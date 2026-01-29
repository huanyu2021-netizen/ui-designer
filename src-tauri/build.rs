fn main() {
    tauri_build::build();

    // 在 macOS 构建后修改 Info.plist，删除 LSRequiresCarbon
    #[cfg(target_os = "macos")]
    {
        use std::fs;
        use std::path::Path;

        // 可能的 Info.plist 路径
        let possible_paths = vec![
            "src-tauri/target/release/bundle/macos/ADP UI Designer.app/Contents/Info.plist",
            "target/release/bundle/macos/ADP UI Designer.app/Contents/Info.plist",
        ];

        for plist_path_str in possible_paths {
            let info_plist_path = Path::new(plist_path_str);

            if info_plist_path.exists() {
                println!("cargo:warning=找到 Info.plist: {}", plist_path_str);
                println!("cargo:warning=正在删除 LSRequiresCarbon...");

                match fs::read_to_string(&info_plist_path) {
                    Ok(plist_content) => {
                        // 删除 LSRequiresCarbon 键及其值
                        let lines: Vec<&str> = plist_content.lines().collect();
                        let mut filtered_lines = Vec::new();
                        let mut i = 0;
                        let mut found_and_removed = false;

                        while i < lines.len() {
                            let line = lines[i];

                            // 跳过 LSRequiresCarbon 相关行
                            if line.contains("<key>LSRequiresCarbon</key>") {
                                println!("cargo:warning=发现 LSRequiresCarbon，正在删除...");
                                found_and_removed = true;
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
                        match fs::write(&info_plist_path, modified_content) {
                            Ok(_) => {
                                println!("cargo:warning=✅ 已成功删除 LSRequiresCarbon");
                                return; // 成功修改后退出
                            }
                            Err(e) => {
                                println!("cargo:warning=❌ 写入 Info.plist 失败: {}", e);
                            }
                        }
                    }
                    Err(e) => {
                        println!("cargo:warning=❌ 无法读取 Info.plist: {}", e);
                    }
                }
            }
        }

        println!("cargo:warning=⚠️  未找到 Info.plist 文件，可能尚未构建或路径不同");
    }
}
