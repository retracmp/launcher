use winapi::um::winreg::{RegCloseKey, RegOpenKeyExW, RegSetValueExW, RegQueryValueExW, HKEY_LOCAL_MACHINE};
use winapi::shared::winerror::ERROR_SUCCESS;
use winapi::um::winnt::{KEY_READ, KEY_WRITE, KEY_WOW64_64KEY};
use std::ptr::null_mut;
use std::ffi::OsStr;
use std::os::windows::ffi::OsStrExt;

fn to_wide_string(s: &str) -> Vec<u16> {
    OsStr::new(s).encode_wide().chain(Some(0).into_iter()).collect()
}

#[tauri::command]
pub fn add_to_windows_defender_exclusion_list(folder_path: &str) -> Result<bool, String> {
  unsafe {
    let key_path = to_wide_string("SOFTWARE\\Microsoft\\Windows Defender\\Exclusions\\Paths");
    let folder_path_wide = to_wide_string(folder_path);

    let mut hkey = null_mut();
    let status = RegOpenKeyExW(
      HKEY_LOCAL_MACHINE,
      key_path.as_ptr(),
      0,
      KEY_WRITE | KEY_WOW64_64KEY,
      &mut hkey,
    );

    if (status as u32) != ERROR_SUCCESS {
      return Err(format!("Failed to open registry key: error code {}", status));
    }

    let result = RegSetValueExW(
      hkey,
      folder_path_wide.as_ptr(),
      0,
      winapi::um::winnt::REG_SZ,
      folder_path_wide.as_ptr() as *const u8,
      (folder_path_wide.len() * 2) as u32,
    );

    RegCloseKey(hkey);

    if (result as u32) == ERROR_SUCCESS {
      Ok(true)
    } else {
      Err(format!("Failed to set registry value: error code {}", result))
    }
  }
}

#[tauri::command]
pub fn is_folder_in_exclusion_list(folder_path: &str) -> Result<bool, String> {
  unsafe {
    let key_path = to_wide_string("SOFTWARE\\Microsoft\\Windows Defender\\Exclusions\\Paths");
    let folder_path_wide = to_wide_string(folder_path);

    let mut hkey = null_mut();
    let status = RegOpenKeyExW(
      HKEY_LOCAL_MACHINE,
      key_path.as_ptr(),
      0,
      KEY_READ | KEY_WOW64_64KEY,
      &mut hkey,
    );

    if (status as u32) != ERROR_SUCCESS {
      return Err(format!("Failed to open registry key: error code {}", status));
    }

    let mut buffer = vec![0u16; 256];
    let mut buffer_size = (buffer.len() * 2) as u32;
    let result = RegQueryValueExW(
      hkey,
      folder_path_wide.as_ptr(),
      null_mut(),
      null_mut(),
      buffer.as_mut_ptr() as *mut u8,
      &mut buffer_size,
    );

    RegCloseKey(hkey);

    if (result as u32) == ERROR_SUCCESS {
      Ok(true)
    } else if (result as u32) == winapi::shared::winerror::ERROR_FILE_NOT_FOUND {
      Ok(false)
    } else {
      Err(format!("Failed to query registry value: error code {}", result))
    }
  }
}

// extern crate winapi;
// use winapi::um::processthreadsapi::OpenProcessToken;
// use winapi::um::securitybaseapi::GetTokenInformation;
// use winapi::um::winnt::{TokenElevation, TOKEN_ELEVATION, TOKEN_QUERY};
// use winapi::shared::minwindef::DWORD;
// use winapi::shared::ntdef::HANDLE;
// pub fn is_running_as_admin() -> bool {
//   let mut is_admin = false;
//   unsafe {
//     let mut token_handle: HANDLE = null_mut();
//     if OpenProcessToken(winapi::um::processthreadsapi::GetCurrentProcess(), TOKEN_QUERY, &mut token_handle) != 0 {
//       let mut elevation = TOKEN_ELEVATION { TokenIsElevated: 0 };
//       let mut return_length: DWORD = 0;
//       if GetTokenInformation(
//         token_handle,
//         TokenElevation,
//         &mut elevation as *mut _ as *mut _,
//         std::mem::size_of::<TOKEN_ELEVATION>() as DWORD,
//         &mut return_length,
//       ) != 0
//       {
//         is_admin = elevation.TokenIsElevated != 0;
//       }
//       winapi::um::handleapi::CloseHandle(token_handle);
//     }
//   }
//   is_admin
// }


// use winapi::um::shellapi::ShellExecuteW;
// use winapi::um::winuser::SW_SHOWNORMAL;
// use std::env;
// use std::ffi::OsString;

// pub fn restart_as_admin(args: &[String]) {
//   let executable_path = env::current_exe().unwrap().into_os_string().encode_wide().collect::<Vec<u16>>();
//   let parameters = args.join(" ");
//   let parameters_wide: Vec<u16> = OsString::from(parameters).encode_wide().chain(Some(0).into_iter()).collect();

//   unsafe {
//     ShellExecuteW(
//       null_mut(),
//       "runas".encode_utf16().collect::<Vec<u16>>().as_ptr(),
//       executable_path.as_ptr(),
//       parameters_wide.as_ptr(),
//       null_mut(),
//       SW_SHOWNORMAL,
//     );
//   }
// }
