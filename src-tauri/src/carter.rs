use std::io::Write;
use std::os::windows::process::CommandExt;

use winapi::shared::minwindef::FALSE;
use winapi::um::handleapi::CloseHandle;
use winapi::um::processthreadsapi::{OpenThread, SuspendThread};
use winapi::um::tlhelp32::{
    CreateToolhelp32Snapshot, Thread32First, Thread32Next, TH32CS_SNAPTHREAD, THREADENTRY32,
};

use winapi::um::winnt::HANDLE;
use winapi::um::winnt::THREAD_SUSPEND_RESUME;

use sysinfo::System;

extern crate num_cpus;
use tokio::sync::Mutex;
use std::sync::Arc;
use tauri::{AppHandle, Manager};

const CREATE_NO_WINDOW: u32 = 0x08000000;

pub fn kill() {
  let mut system = System::new_all();
  system.refresh_all();

  let processes = vec![
    "EpicGamesLauncher.exe",
    "FortniteLauncher.exe",
    "FortniteClient-Win64-Shipping_EAC.exe",
    "FortniteClient-Win64-Shipping.exe",
    "EasyAntiCheat_EOS.exe",
    "EpicWebHelper.exe",
  ];

  for process in processes.iter() {
    let cmd = std::process::Command::new("cmd")
      .creation_flags(CREATE_NO_WINDOW)
      .args(&["/C", "taskkill /F /IM", process])
      .spawn();

    if cmd.is_err() {
      return
    }
  }

  std::thread::sleep(std::time::Duration::from_millis(10));
}

pub fn kill_epic() {
  let cmd = std::process::Command::new("cmd")
    .creation_flags(CREATE_NO_WINDOW)
    .args(&["/C", "taskkill /F /IM", "EpicGamesLauncher.exe"])
    .spawn();

  if cmd.is_err() {
    return
  }

  std::thread::sleep(std::time::Duration::from_millis(10));
}

pub fn search() -> u32 {
  let mut pid = 0;
  unsafe {
    let tl = tasklist::Tasklist::new();

    for task in tl {
      if task.get_pname() == "FortniteClient-Win64-Shipping.exe" {
        pid = task.get_pid();
        break;
      }
    }
  }

  pid
}

fn generate_ranges(file_size: u64, worker_count: u64) -> Vec<(u64, u64)> {
  let mut ranges = Vec::new();
  let chunk_size = file_size / worker_count;
  let mut start = 0;

  for i in 0..worker_count {
    let end = if i == worker_count - 1 {
      file_size - 1
    } else {
      start + chunk_size - 1
    };

    ranges.push((start, end));
    start = end + 1;
  }

  ranges
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct DownloadProgress {
  pub file_name: String,
  pub wanted_file_size: u64,
  pub downloaded_file_size: u64,
  pub download_speed: u128,
  pub is_zip_progress: bool,
}

const OVERWRITE_LIST: [[&str; 2]; 3] =
[
  ["EasyAntiCheat", "Easy Anti-Cheat"],
  ["retrac", "Retrac Client"],
  ["paks", "Retrac Custom Content"],
];

pub async fn download(
  url: &str,
  file_name: &str,
  path: &str,
  window: &tauri::Window,
) -> Result<bool, String> {
  let file_url = format!("{}/{}", url, file_name);
  let file_client = reqwest::Client::new();

  let file_res = file_client.get(file_url.clone()).send().await;
  let file_res = match file_res {
    Ok(res) => res,
    Err(e) => return Err(format!("Failed to download '{}': {}", file_name, e)),
  };

  let wanted_file_size = file_res.content_length().unwrap_or(0);
  let progress = Arc::new(Mutex::new(DownloadProgress {
    file_name: file_name.to_string(),
    wanted_file_size,
    downloaded_file_size: 0,
    download_speed: 0,
    is_zip_progress: false, 
  }));

  for i in 0..OVERWRITE_LIST.len() {
    if file_name.contains(OVERWRITE_LIST[i][0]) {
      let mut progress_m = progress.lock().await;
      progress_m.file_name = OVERWRITE_LIST[i][1].to_string();
      break;
    }
  }

  window.emit("download_progress", progress.lock().await.to_owned()).unwrap();

  let worker_count = (num_cpus::get() / 2) as u8;
  let byte_ranges = generate_ranges(wanted_file_size, worker_count as u64);

  let download_tasks: Vec<_> = byte_ranges
    .into_iter()
    .map(|(start, end)| {
      let file_url = file_url.clone();
      let file_name = file_name.to_string();
      let progress = progress.clone();
      let partial_file_client = file_client.clone();
      let window = window.clone();

      tokio::spawn(async move {
        let mut bytes: Vec<u8> = Vec::new();
        let res = partial_file_client
          .get(file_url.clone())
          .header("Range", format!("bytes={}-{}", start, end))
          .send()
          .await;

        let mut res = match res {
          Ok(res) => res,
          Err(e) => return Err(format!("Failed to download '{}': {}", file_name, e)),
        };

        let mut last_update = std::time::Instant::now();

        while let Some(chunk) = res.chunk().await.unwrap_or(None) {
          let now = std::time::Instant::now();
          let elapsed = now.duration_since(last_update).as_millis();
          
          let mut progress_lock = progress.lock().await;
          progress_lock.downloaded_file_size += chunk.len() as u64;

          let mut elapsed2 = now.duration_since(last_update).as_millis();
          if elapsed2 == 0 { elapsed2 = 1; }
          progress_lock.download_speed = (chunk.len() as u128 * 1000000) / elapsed2;

          if elapsed >= 100 {
            window.emit("download_progress", progress_lock.to_owned()).unwrap();
            last_update = now;
          }

          drop(progress_lock);
          bytes.write_all(&chunk).unwrap();
        }

        window.emit("download_progress", progress.lock().await.to_owned()).unwrap();

        Ok::<Vec<u8>, String>(bytes)
      })
    })
    .collect();

  let results = futures::future::join_all(download_tasks).await;

  let mut total_bytes: Vec<u8> = Vec::new();
  for result in results {
    let bytes = match result {
      Ok(bytes) => bytes,
      Err(_) => {
        println!("Failed to download '{}'", file_name);
        return Err("Failed to download file".to_string())
      },
    };

    total_bytes.write_all(bytes.unwrap().as_ref()).unwrap();
  }

  let mut file = std::fs::File::create(path).or(Err(format!("Failed to create file '{}'", path)))?;
  file.write_all(&total_bytes).or(Err(format!("Failed to write '{}'", path)))?;

  Ok(true)
}

pub async fn unzip(path: &str, out_path: &str) -> Result<bool, String> {
  let path_buf = std::path::PathBuf::from(path);
  let out_path_buf = std::path::PathBuf::from(out_path);

  let cursor = std::io::Cursor::new(
    std::fs::read(path).or(Err(format!("Failed to read '{}'", path)))?
  );
  
  match zip_extract::extract(cursor, &out_path_buf, true) {
    Ok(_) => {},
    Err(e) => {
      return Err("Could not extract the file for reason: ".to_string() + e.to_string().as_str());
    }
  }

  let mut num_tries = 0;
  while path_buf.exists() {
    if std::fs::remove_file(path).is_ok() {
      break;
    }

    if num_tries > 100 {
      return Err("Failed to remove zip file".to_string());
    }

    num_tries += 1;
    std::thread::sleep(std::time::Duration::from_millis(100));
  }

  Ok(true)
}

#[tauri::command]
pub async fn download_retrac_custom_content(path: &str, app: AppHandle) -> Result<bool, String> {
  println!("download_retrac_custom_content({})", path);
  let window = app.get_window("main").unwrap();
  let base = std::path::PathBuf::from(path);

  let mut custom_content_zip_path = base.clone();
  custom_content_zip_path.push("paks.zip");

  let custom_content_zip = download("https://cdn.retrac.site", "paks.zip", custom_content_zip_path.clone().to_str().unwrap(), &window).await;
  if custom_content_zip.is_err() {
    return Err("Failed to download custom content".to_string());
  }

  let mut unzip_progress = DownloadProgress {
    file_name: "Retrac Data".to_string(),
    wanted_file_size: 1,
    downloaded_file_size: 0,
    download_speed: 0,
    is_zip_progress: true,
  };
  window.emit("download_progress", unzip_progress.clone()).unwrap();

  let custom_content_path = base.clone();
  let res = unzip(custom_content_zip_path.clone().to_str().unwrap(), custom_content_path.clone().to_str().unwrap(),).await;
  match res {
    Ok(_) => {},
    Err(e) => {
      return Err("Could not extract the custom content file for reason: ".to_string() + e.to_string().as_str());
    }
  }

  unzip_progress.downloaded_file_size = 1;
  window.emit("download_progress", unzip_progress.clone()).unwrap();

  Ok(true)
}

pub async fn delete(path: &str) -> Result<bool, String> {
  let path2 = std::path::PathBuf::from(path).clone();
  if path2.clone().exists() {
    std::fs::remove_file(path).or(Err(format!("Failed to delete '{}'", path2.to_str().unwrap())))?;
  }

  Ok(true)
}

pub fn suspend_process(pid: u32) -> (u32, bool) {
  unsafe {
    let mut has_err = false;
    let mut count: u32 = 0;

    let te: &mut THREADENTRY32 = &mut std::mem::zeroed();
    (*te).dwSize = std::mem::size_of::<THREADENTRY32>() as u32;

    let snapshot: HANDLE = CreateToolhelp32Snapshot(TH32CS_SNAPTHREAD, 0);

    if Thread32First(snapshot, te) == 1 {
      loop {
        if pid == (*te).th32OwnerProcessID {
          let tid = (*te).th32ThreadID;

          let thread: HANDLE = OpenThread(THREAD_SUSPEND_RESUME, FALSE, tid);
          has_err |= SuspendThread(thread) as i32 == -1i32;

          CloseHandle(thread);
          count += 1;
        }

        if Thread32Next(snapshot, te) == 0 {
          break;
        }
      }
    }

    CloseHandle(snapshot);

    (count, has_err)
  }
}

pub fn is_process_suspended(pid: u32) -> bool {
  unsafe {
    let mut is_suspended = true;

    let te: &mut THREADENTRY32 = &mut std::mem::zeroed();
    (*te).dwSize = std::mem::size_of::<THREADENTRY32>() as u32;

    let snapshot: HANDLE = CreateToolhelp32Snapshot(TH32CS_SNAPTHREAD, 0);

    if Thread32First(snapshot, te) == 1 {
      loop {
        if pid == (*te).th32OwnerProcessID {
          let tid = (*te).th32ThreadID;

          let thread: HANDLE = OpenThread(THREAD_SUSPEND_RESUME, FALSE, tid);
          let suspend_count = SuspendThread(thread) as i32;

          if suspend_count == -1i32 {
            is_suspended = false;
          } else {
            is_suspended &= suspend_count > 0;
          }

          CloseHandle(thread);
        }

        if Thread32Next(snapshot, te) == 0 {
          break;
        }
      }
    }

    CloseHandle(snapshot);

    is_suspended
  }
}

pub async fn launch_real_launcher(root: &str) -> Result<bool, String> {
  let base = std::path::PathBuf::from(root);
  let mut resource_path = base.clone();
  resource_path.push("FortniteGame\\Binaries\\Win64\\FortniteLauncher.exe");

  let mut cwd = std::path::PathBuf::from(root);
  cwd.push("FortniteGame\\Binaries\\Win64");

  kill_epic();
  let cmd = std::process::Command::new(resource_path.clone())
    .creation_flags(CREATE_NO_WINDOW | 0x00000004)
    .current_dir(cwd)
    .spawn();


  if cmd.is_err() {
    return Err(format!("Failed to launch '{}'", resource_path.to_str().unwrap()));
  }

  let pid = cmd.unwrap().id();
  while !is_process_suspended(pid.clone()) {
    let (_, _) = suspend_process(pid.clone());
    std::thread::sleep(std::time::Duration::from_millis(100));
  }

  kill_epic();

  Ok(true)
}

pub async fn launch_game(
  path: &str,
  code: &str,
  ac_token: &str,
  use_edit_on_release: bool,
  use_disable_pre_edits: bool,
  launch_args: &str,
) -> Result<bool, String> {
  let base = std::path::PathBuf::from(path);

  // let mut eac_setup = base.clone();
  // eac_setup.push("EasyAntiCheat\\EasyAntiCheat_EOS_Setup.exe");
  // let eac_setup_args = vec![
  //   "install",
  //   "b2504259773b40e3a818f820e31979ca"
  // ];
  // let eac_setup_cmd = std::process::Command::new(eac_setup)
  //   .creation_flags(CREATE_NO_WINDOW)
  //   .args(eac_setup_args)
  //   .spawn();
  // if eac_setup_cmd.is_err() {
  //   return Err("Failed to launch EAC setup".to_string());
  // }

  let mut fort_ac_path = base.clone();
  fort_ac_path.push("FortniteGame\\Binaries\\Win64\\FortniteClient-Win64-Shipping_EAC.exe");
  let mut fort_ac_cwd = base.clone();
  fort_ac_cwd.push("FortniteGame\\Binaries\\Win64");
  let fortnite_ac_process = std::process::Command::new(fort_ac_path)
    .creation_flags(CREATE_NO_WINDOW | 0x00000004)
    .current_dir(fort_ac_cwd)
    .spawn();
  if fortnite_ac_process.is_err() {
    return Err("Failed to launch FortniteClient-Win64-Shipping_EAC.exe".to_string());
  }

  let env = format!("-actoken={}", ac_token);
  let mut fort_args = vec![
    "-epicapp=Fortnite",
    "-epicenv=Prod",
    "-epiclocale=en-us",
    "-epicportal",
    "-nobe",
    "-fromfl=eac",
    "-fltoken=hchc0906bb1bg83c3934fa31",
    "-skippatchcheck",
    "-noeac",
    env.as_str(),
    launch_args,
  ];

  if use_edit_on_release {
    fort_args.push("-retrac_editonrelease");
  }

  if use_disable_pre_edits {
    fort_args.push("-retrac_disablepreedits");
  }

  let mut binary = base.clone();
  binary.push("FortniteGame\\Binaries\\Win64\\FortniteClient-Win64-Shipping.exe");

  let cmd = std::process::Command::new(binary)
    .creation_flags(CREATE_NO_WINDOW)
    .args(fort_args)
    .args(code.split(" "))
    .spawn();

  if cmd.is_err() {
    return Err(format!("Failed to launch '{}'", path));
  }

  Ok(true)
}

pub async fn launch_eac(
  path: &str, 
  code: &str,
  ac_token: &str,
  use_edit_on_release: bool,
  use_disable_pre_edits: bool,
  launch_args: &str,
) -> Result<bool, String>{
  let base = std::path::PathBuf::from(path);

  let mut eac_setup = base.clone();
  eac_setup.push("EasyAntiCheat\\EasyAntiCheat_EOS_Setup.exe");
  let eac_setup_args = vec![
    "install",
    "b2504259773b40e3a818f820e31979ca"
  ];
  let eac_setup_cmd = std::process::Command::new(eac_setup)
    .creation_flags(CREATE_NO_WINDOW )
    .args(eac_setup_args)
    .spawn();
  if eac_setup_cmd.is_err() {
    return Err("Failed to launch EAC setup".to_string());
  }

  let mut fort_ac_path = base.clone();
  fort_ac_path.push("FortniteGame\\Binaries\\Win64\\FortniteClient-Win64-Shipping_EAC.exe");
  let mut fort_ac_cwd = base.clone();
  fort_ac_cwd.push("FortniteGame\\Binaries\\Win64");
  let fortnite_ac_process = std::process::Command::new(fort_ac_path)
    .creation_flags(CREATE_NO_WINDOW | 0x00000004)
    .current_dir(fort_ac_cwd)
    .spawn();
  if fortnite_ac_process.is_err() {
    return Err("Failed to launch FortniteClient-Win64-Shipping_EAC.exe".to_string());
  }

  let res = launch_real_launcher(base.clone().to_str().unwrap()).await;
  if res.is_err() {
    println!("launc easy anti cheat");
    return Err("Failed to launch Fortnite Launcher".to_string());
  }

  let mut fort_binary = base.clone();
  fort_binary.push("FortniteGame\\Binaries\\Win64\\FortniteClient-Win64-Shipping.exe");
  if !fort_binary.exists() {
    return Err("Could not find FortniteClient-Win64-Shipping.exe".to_string());
  }

  let mut eac_binary = base.clone();
  eac_binary.push("Retrac_EAC.exe");
  if !eac_binary.exists() {
    return Err("Could not find EAC binary".to_string());
  }

  let env2 = format!("-actoken={}", ac_token);
  let mut fort_args = vec![
    "-epicapp=Fortnite",
    "-epiclocale=en-us",
    "-epicportal",
    "-nobe",
    "-fromfl=eac",
    "-fltoken=hchc0906bb1bg83c3934fa31",
    "-caldera=eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50X2lkIjoiYmU5ZGE1YzJmYmVhNDQwN2IyZjQwZWJhYWQ4NTlhZDQiLCJnZW5lcmF0ZWQiOjE2Mzg3MTcyNzgsImNhbGRlcmFHdWlkIjoiMzgxMGI4NjMtMmE2NS00NDU3LTliNTgtNGRhYjNiNDgyYTg2IiwiYWNQcm92aWRlciI6IkVhc3lBbnRpQ2hlYXQiLCJub3RlcyI6IiIsImZhbGxiYWNrIjpmYWxzZX0.VAWQB67RTxhiWOxx7DBjnzDnXyyEnX7OljJm-j2d88G_WgwQ9wrE6lwMEHZHjBd1ISJdUO1UVUqkfLdU5nofBQ",
    "-skippatchcheck",
    "-noeac",
    env2.as_str(),
    launch_args,
  ];

  if use_edit_on_release {
    fort_args.push("-instantreset");
  }

  if use_disable_pre_edits {
    fort_args.push("-disablepreedit");
  }

  let fort_cmd = std::process::Command::new(eac_binary)
    .creation_flags(CREATE_NO_WINDOW)
    .args(fort_args)
    .args(code.split(" "))
    .spawn();

  if fort_cmd.is_err() {
    return Err("Failed to launch FortniteClient-Win64-Shipping_EAC.exe".to_string());
  }

  Ok(true)
}