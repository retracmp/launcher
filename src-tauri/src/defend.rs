use std::env;
use std::ffi::OsString;
use std::os::windows::ffi::OsStrExt;
use winapi::um::shellapi::ShellExecuteW;
use std::ptr;
use std::fs::File;
use std::io::Read;

fn spawn_admin_process_and_get_output(command: &str, args: Vec<&str>) -> Result<String, String> {
  let cwd = env::current_dir().expect("Failed to get current working directory");
  let cwd_str = cwd.to_str().expect("Failed to convert path to string");
  
  let output_file = cwd.join("out");
  let output_file_str = output_file.to_str().expect("Failed to convert output path to string");
  
  let cwd_wide: Vec<u16> = OsString::from(cwd_str).encode_wide().chain(Some(0)).collect();
  let verb_wide: Vec<u16> = OsString::from("runas").encode_wide().chain(Some(0)).collect();
  let command_wide: Vec<u16> = OsString::from(command).encode_wide().chain(Some(0)).collect();
  
  let mut params = args.join(" ");
  params.push_str(&format!(" > \"{}\"", output_file_str));
  let params_wide: Vec<u16> = OsString::from(params).encode_wide().chain(Some(0)).collect();
  
  let result = unsafe {
    ShellExecuteW(
      ptr::null_mut(),
      verb_wide.as_ptr(),
      command_wide.as_ptr(),
      params_wide.as_ptr(),
      cwd_wide.as_ptr(),
      0,
    )
  };

  if result as isize <= 32 {
    return Err(format!("Failed to execute command"));
  }

  std::thread::sleep(std::time::Duration::from_millis(1500));
  
  let output_file = cwd.join("out"); // is a file contaitn a wide string
  let mut file = File::open(output_file.clone()).expect("Failed to open output file");
  
  let mut file_data: Vec<u8> = Vec::new();
  file.read_to_end(&mut file_data).expect("Failed to read output file");

  let mut wide_file_data: Vec<u16> = Vec::new();
  for i in 0..file_data.len() / 2 {
    let byte1 = file_data[i * 2];
    let byte2 = file_data[i * 2 + 1];
    let u16_val = (byte2 as u16) << 8 | byte1 as u16;
    wide_file_data.push(u16_val);
  }

  let output = String::from_utf16(&wide_file_data).expect("Failed to convert output to string");
  std::fs::remove_file(output_file).expect("Failed to delete output file");

  Ok(output)
}

#[tauri::command]
pub fn add_windows_defender_exclusions(folder_path: &str) -> Result<bool, String> {
  let command = format!(
    "Add-MpPreference -ExclusionPath \"{}\"; (Get-MpPreference).ExclusionPath",
    folder_path
  );
  let output = spawn_admin_process_and_get_output("powershell", vec!["-Command", &command])?;

  if !output.contains(folder_path) {
    println!("Failed to add exclusion");
    return Err("Failed to add exclusion".to_string());
  }

  Ok(true)
}