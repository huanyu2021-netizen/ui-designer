fn main() {
    tauri_build::build();

    // 在 macOS 构建后修改 Info.plist，删除 LSRequiresCarbon
    #[cfg(target_os = "macos")]
    {
        use std::fs;
        use std::path::Path;

        // 查找生成的 Info.plist 文件
        let bundle_path = Path::new("src-tauri/target/release/bundle/macos/ADP UI Designer.app");
        let info_plist_path = bundle_path.join("Contents/Info.plist");

        if info_plist_path.exists() {
            println!("cargo:warning=正在修改 Info.plist 以删除 LSRequiresCarbon...");

            match fs::read_to_string(&info_plist_path) {
                Ok(mut plist_content) => {
                    // 删除 LSRequiresCarbon 键及其值
                    let lines: Vec<&str> = plist_content.lines().collect();
                    let mut filtered_lines = Vec::new();
                    let mut i = 0;

                    while i < lines.len() {
                        let line = lines[i];

                        // 跳过 LSRequiresCarbon 相关行
                        if line.contains("<key>LSRequiresCarbon</key>") {
                            // 跳过 <key> 行
                            i += 1;
                            // 跳过 <true/> 或 <false/> 行
                            if i < lines.len() && (lines[i].contains("<true/>") || lines[i].contains("<false/>")) {
                                i += 1;
                            }
                            continue;
                        }

                        filtered_lines.push(line);
                        i += 1;
                    }

                    // 写回文件
                    let modified_content = filtered_lines.join("\n");
                    if fs::write(&info_plist_path, modified_content).is_ok() {
                        println!("cargo:warning=已成功删除 LSRequiresCarbon 从 Info.plist");
                    }
                }
                Err(e) => {
                    println!("cargo:warning=无法读取 Info.plist: {}", e);
                }
            }
        }
    }
}
