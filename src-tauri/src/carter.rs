use sysinfo::System;
use std::io::Write;
use std::os::windows::process::CommandExt;
use futures_util::StreamExt;

use winapi::shared::minwindef::FALSE;
use winapi::um::handleapi::CloseHandle;
use winapi::um::processthreadsapi::{OpenThread, SuspendThread};
use winapi::um::tlhelp32::{
    CreateToolhelp32Snapshot, Thread32First, Thread32Next, TH32CS_SNAPTHREAD, THREADENTRY32,
};

use winapi::um::winnt::HANDLE;
use winapi::um::winnt::THREAD_SUSPEND_RESUME;

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

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct DownloadProgress {
  pub file_name: String,
  pub wanted_file_size: u64,
  pub downloaded_file_size: u64,
  pub download_speed: u128,
}

async fn downloader(
  client: reqwest::Client,
  url: &str,
  path: &str,
  window: &tauri::Window
) -> Result<(), String> {
  let response: reqwest::Response = client.get(url).send().await.or(Err("Failed to send request".to_string()))?;
  if !response.status().is_success() {
    return Err(format!("Failed to download '{}' for reason '{}'", url, response.status().to_string()));
  }
  let wal = response.content_length().unwrap_or(0);
  let mut file_name = url.split("/").last().unwrap().to_string();
  if file_name == "rrEasyAntiCheat.zip" {
    file_name = "Easy Anti-Cheat".to_string();
  }

  let mut file = std::fs::File::create(path).or(Err(format!("Failed to create file '{}'", path)))?;
  let mut stream = response.bytes_stream();

  let mut progress: DownloadProgress = DownloadProgress {
    file_name: file_name.clone(),
    wanted_file_size: wal,
    downloaded_file_size: 0,
    download_speed: 0,
  };
  let last_time = std::time::Instant::now();

  while let Some(chunk) = stream.next().await {
    let chunk = chunk.unwrap();
    file.write_all(&chunk).or(Err(format!("Failed to write to file '{}'", path)))?;

    let progress = &mut progress;
    progress.downloaded_file_size += chunk.len() as u64;

    let elapsed = last_time.elapsed().as_secs();
    if elapsed > 0 {
      progress.download_speed = progress.downloaded_file_size as u128 / elapsed as u128;
    }

    window.emit("download_progress", progress.to_owned()).unwrap();
  }

  Ok(())
}

pub async fn download(
  url: &str,
  file: &str,
  path: &str,
  window: &tauri::Window
) -> Result<bool, String> {
  let client = reqwest::Client::new();
  let file_url = format!("{}/{}", url, file);

  if let Err(err) = downloader(client.clone(), &file_url, path, window).await {
    return Err(err);
  } else {
    return Ok(true);
  }
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
    .creation_flags(CREATE_NO_WINDOW)
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
  use_edit_on_release: bool,
  use_disable_pre_edits: bool,
) -> Result<bool, String> {
  let base = std::path::PathBuf::from(path);
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
  use_edit_on_release: bool,
  use_disable_pre_edits: bool,
) -> Result<bool, String>{
  let base = std::path::PathBuf::from(path);

  let mut eac_setup = base.clone();
  eac_setup.push("EasyAntiCheat\\EasyAntiCheat_EOS_Setup.exe");
  let eac_setup_args = vec![
    "install",
    "b2504259773b40e3a818f820e31979ca"
  ];
  let eac_setup_cmd = std::process::Command::new(eac_setup)
    .creation_flags(CREATE_NO_WINDOW)
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
    .creation_flags(CREATE_NO_WINDOW)
    .current_dir(fort_ac_cwd)
    .spawn();
  if fortnite_ac_process.is_err() {
    return Err("Failed to launch FortniteClient-Win64-Shipping_EAC.exe".to_string());
  }
  suspend_process(fortnite_ac_process.unwrap().id());

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

  let mut eor = "";
  if use_edit_on_release {
    eor = "ROR";
  }

  let mut dpe = "";
  if use_disable_pre_edits {
    dpe = "DPE";
  }

  let env = format!("-epicenv=Prod##{}##{}", eor, dpe);
  let fort_args = vec![
    "-epicapp=Fortnite",
    env.as_str(),
    "-epiclocale=en-us",
    "-epicportal",
    "-nobe",
    "-fromfl=eac",
    "-fltoken=hchc0906bb1bg83c3934fa31",
    "-caldera=eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50X2lkIjoiYmU5ZGE1YzJmYmVhNDQwN2IyZjQwZWJhYWQ4NTlhZDQiLCJnZW5lcmF0ZWQiOjE2Mzg3MTcyNzgsImNhbGRlcmFHdWlkIjoiMzgxMGI4NjMtMmE2NS00NDU3LTliNTgtNGRhYjNiNDgyYTg2IiwiYWNQcm92aWRlciI6IkVhc3lBbnRpQ2hlYXQiLCJub3RlcyI6IiIsImZhbGxiYWNrIjpmYWxzZX0.VAWQB67RTxhiWOxx7DBjnzDnXyyEnX7OljJm-j2d88G_WgwQ9wrE6lwMEHZHjBd1ISJdUO1UVUqkfLdU5nofBQ",
    "-skippatchcheck",
    "-noeac",
  ];

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