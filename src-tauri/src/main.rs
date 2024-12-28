#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{regex::Regex, AppHandle, Manager, Window, WindowEvent};
use window_shadows::set_shadow;
use std::path::PathBuf;
use std::sync::Mutex;
use sha2::Digest;
use std::env;

mod carter;
mod defend;

#[tauri::command]
async fn hash(i: String) -> Result<String, String> {
  let i = std::path::PathBuf::from(i);
  if !i.exists() {
    return Err("File ".to_string() + i.to_str().unwrap() + " does not exist");
  }

  let bytes = std::fs::read(i).unwrap();
  let hash = sha2::Sha256::digest(bytes.as_slice());
  return Ok(format!("{:x}", hash));
}

#[tauri::command]
async fn exists(i: &str) -> Result<bool, String> {
  Ok(std::path::Path::new(i).exists())
}

#[tauri::command]
async fn size(i: &str) -> Result<u64, String> {
  let metadata = std::fs::metadata(i);
  if metadata.is_err() {
    return Err("Could not get metadata".to_string());
  }

  Ok(metadata.unwrap().len())
}

#[tauri::command]
async fn experience(i: String, c: &str, ac_token: &str, _local: bool, edit_on_release: bool, disable_pre_edit: bool, version: i32, launch_args: &str, app: AppHandle) -> Result<bool, String> {
  let window = app.get_window("main").unwrap();

  carter::kill();
  let path = PathBuf::from(i);

  let mut nvidia_path = path.clone();
  nvidia_path.push("Engine\\Binaries\\ThirdParty\\NVIDIA\\NVaftermath\\Win64\\GFSDK_Aftermath_Lib.x64.dll");
  while nvidia_path.exists() {
    if std::fs::remove_file(nvidia_path.clone()).is_ok() {
      break;
    }

    std::thread::sleep(std::time::Duration::from_millis(100));
  }

  // let mut dicord_rpc = path.clone();
  // dicord_rpc.push("Engine\\Binaries\\ThirdParty\\Discord\\Win64\\discord-rpc.dll");
  // while dicord_rpc.exists() {
  //   if std::fs::remove_file(dicord_rpc.clone()).is_ok() {
  //     break;
  //   }

  //   std::thread::sleep(std::time::Duration::from_millis(100));
  // }

  let client = carter::download("https://cdn.0xkaede.xyz/dlls", &format!("retrac_s{}.dll", version), nvidia_path.clone().to_str().unwrap(), &window).await;
  if client.is_err() {
    return Err(format!("Could not download {} for reason {}", &format!("retrac_s{}.dll", version), client.unwrap_err()));
  }

  let mut eac_path = path.clone();
  eac_path.push("r10EasyAntiCheat.zip");
  let eac = carter::download("https://cdn.0xkaede.xyz/data", "r10EasyAntiCheat.zip", eac_path.clone().to_str().unwrap(), &window).await;
  if eac.is_err() {
    return Err("Could not download EasyAntiCheat_final.zip".to_string());
  }

  let target_eac_path = path.clone();
  let cursor = std::io::Cursor::new(std::fs::read(eac_path.clone()).unwrap());
  match zip_extract::extract(cursor, &target_eac_path, true) {
    Ok(_) => {},
    Err(e) => {
      return Err("Could not extract the EAC file for reason: ".to_string() + e.to_string().as_str());
    }
  }
  while eac_path.exists() {
    if std::fs::remove_file(eac_path.clone()).is_ok() {
      break;
    }

    std::thread::sleep(std::time::Duration::from_millis(100));
  }

  let mut eac_setup = path.clone();
  eac_setup.push("EasyAntiCheat\\EasyAntiCheat_EOS_Setup.exe");
  if !eac_setup.exists() {
    return Err("Could not find EAC setup".to_string());
  }

  match carter::launch_eac(path.to_str().unwrap(), &format!("-AUTH_LOGIN= -AUTH_PASSWORD={} -AUTH_TYPE=exchangecode", c), ac_token, edit_on_release, disable_pre_edit, launch_args).await {
    Ok(_) => Ok(true),
    Err(e) => {
      return Err("Could not launch EAC for reason: ".to_string() + e.to_string().as_str());
    },
  }
}

#[tauri::command]
async fn offline(i: String, username: &str, ac_token: &str, launch_args: &str) -> Result<bool, String> {
  // carter::kill();
  std::thread::sleep(std::time::Duration::from_millis(1000));

  let path = PathBuf::from(i);

  let res = carter::launch_real_launcher(path.clone().to_str().unwrap()).await;
  if res.is_err() {
    println!("offline");
    return Err("".to_string() + res.unwrap_err().as_str());
  }

  match carter::launch_game(path.to_str().unwrap(), &format!("-AUTH_LOGIN={}@retrac.site -AUTH_PASSWORD=snowsOnTop -AUTH_TYPE=epic", username), ac_token, false, false, launch_args).await {
    Ok(_) => Ok(true),
    Err(e) => {
      Err("Could not launch the game for reason: ".to_string() + e.to_string().as_str())
    },
  }
}

#[tauri::command]
async fn kill() {
  carter::kill();
}

#[tauri::command]
async fn download(url: &str, file: &str, out_path: &str, app: AppHandle) -> Result<bool, String> {
  let window = app.get_window("main").unwrap();
  match carter::download(url, file, out_path, &window).await {
    Ok(_) => {},
    Err(e) => {
      return Err("Could not download the file for reason: ".to_string() + e.as_str());
    }
  }
  Ok(true)
}

#[tauri::command]
async fn delete(path: &str) -> Result<bool, String> {
  match carter::delete(path).await {
    Ok(_) => {},
    Err(e) => {
      return Err("Could not delete the file for reason: ".to_string() + e.as_str());
    }
  }

  Ok(true)
}

fn lam(window: Window) {
  std::thread::spawn(move || {
    loop {
      window.emit("fortnite_process_id", carter::search()).unwrap();
      std::thread::sleep(std::time::Duration::from_millis(1000));
    }
  });
}

#[derive(Default)]
struct AppData {
  should_close_fortnite: bool,
}

#[tauri::command]
async fn setshouldclosefortnite(app: AppHandle, i: bool) {
  let state = app.state::<Mutex<AppData>>();
  let mut state = state.lock().unwrap();
  state.should_close_fortnite = i;
}

fn main() {
  tauri_plugin_deep_link::prepare("rocks.snow");
  tauri::Builder::default()
    .setup(|app| {
      app.manage(Mutex::new(AppData::default()));

      let window = app.get_window("main").unwrap();
      lam(window.clone());
      set_shadow(window.clone(), true).expect("Unsupported platform!");

      // #[cfg(target_os = "windows")]
      // apply_blur(&window, Some((18, 18, 18, 125))).expect("Unsupported platform! 'apply_blur' is only supported on Windows");

      tauri_plugin_deep_link::register("snow", move |request| {
        let re = Regex::new(r"snow://auth@([^/]+)").unwrap();
        let re2 = Regex::new(r"snow://auth_onboard@([^/]+)").unwrap();

        if  window.set_focus().is_err() {
          return;
        }
        if let Some(captures) = re.captures(request.as_str()) {
          if let Some(result) = captures.get(1) {
            window
              .eval(&format!("window.location.hash = 'auth:{}'", result.as_str()))
              .unwrap();
          }
        }

        if let Some(captures) = re2.captures(request.as_str()) {
          if let Some(result) = captures.get(1) {
            window
              .eval(&format!("window.location.hash = 'auth_onboard:{}'", result.as_str()))
              .unwrap();
          }
        }
      }).unwrap();


      Ok(())
    })
    .on_window_event(move |event| match event.event() {
      WindowEvent::Destroyed => {
        let app_handle = event.window().app_handle();
        let state = app_handle.state::<Mutex<AppData>>();
        let state = state.lock().unwrap();

        if state.should_close_fortnite {
          carter::kill();
        }
      }
      WindowEvent::Resized(..) => std::thread::sleep(std::time::Duration::from_millis(1)),
      _ => {}
    })
    .invoke_handler(tauri::generate_handler![
      setshouldclosefortnite, 
      hash, exists, experience, kill, offline, size, download, delete, carter::download_retrac_custom_content,
      defend::add_windows_defender_exclusions
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
