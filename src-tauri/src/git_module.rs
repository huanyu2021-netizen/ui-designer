use std::path::Path;
use git2::{Repository, FetchOptions, Cred, RemoteCallbacks};

/// Clone a repository to the given directory
pub fn git_clone(url: &str, target_dir: &Path) -> Result<String, String> {
    Repository::clone(url, target_dir)
        .map(|_| format!("Successfully cloned repository to: {}", target_dir.display()))
        .map_err(|e| format!("Failed to clone repository: {}", e))
}

/// Clone a repository using token (for HTTPS)
pub fn git_clone_with_token(url: &str, target_dir: &Path, token: &str) -> Result<String, String> {
    // Prepare callbacks for token authentication
    let mut callbacks = RemoteCallbacks::new();
    callbacks.credentials(|_url, username_from_url, _allowed| {
        // Use the username from URL if available, otherwise use "oauth2" for GitHub or use the token as both username and password
        let username = username_from_url.unwrap_or("oauth2");
        Cred::userpass_plaintext(username, token)
            .map_err(|_e| git2::Error::from_str("Authentication failed"))
    });

    // Create fetch options with callbacks
    let mut fetch_opts = FetchOptions::new();
    fetch_opts.remote_callbacks(callbacks);

    // Clone repository with authentication using clone_opts
    let mut repo_builder = git2::build::RepoBuilder::new();
    repo_builder.fetch_options(fetch_opts);

    repo_builder.clone(url, target_dir)
        .map(|_| format!("Successfully cloned repository to: {}", target_dir.display()))
        .map_err(|e| format!("Failed to clone repository: {}", e))
}

/// Clone a repository using username and token
pub fn git_clone_with_auth(url: &str, target_dir: &Path, username: &str, token: &str) -> Result<String, String> {
    // Prepare callbacks for token authentication
    let mut callbacks = RemoteCallbacks::new();
    callbacks.credentials(|_url, _username_from_url, _allowed| {
        Cred::userpass_plaintext(username, token)
            .map_err(|_e| git2::Error::from_str("Authentication failed"))
    });

    // Create fetch options with callbacks
    let mut fetch_opts = FetchOptions::new();
    fetch_opts.remote_callbacks(callbacks);

    // Clone repository with authentication
    let mut repo_builder = git2::build::RepoBuilder::new();
    repo_builder.fetch_options(fetch_opts);

    repo_builder.clone(url, target_dir)
        .map(|_| format!("Successfully cloned repository to: {}", target_dir.display()))
        .map_err(|e| format!("Failed to clone repository: {}", e))
}

/// Check if a directory is a git repository
pub fn is_git_repo(dir: &Path) -> bool {
    dir.join(".git").exists() || Repository::discover(dir).is_ok()
}

/// Get the current branch name of a repository
pub fn get_current_branch(repo_dir: &Path) -> Result<Option<String>, String> {
    let repo = Repository::open(repo_dir)
        .map_err(|e| format!("Failed to open repository: {}", e))?;

    let head = repo.head().ok();
    match head {
        Some(head_ref) => {
            if head_ref.is_branch() {
                let name = head_ref.shorthand()
                    .map(|s| s.to_string());
                Ok(name)
            } else {
                Ok(None)
            }
        }
        None => Ok(None),
    }
}

/// Pull latest changes from remote
pub fn git_pull(repo_dir: &Path, remote_name: &str, branch_name: &str) -> Result<String, String> {
    let repo = Repository::open(repo_dir)
        .map_err(|e| format!("Failed to open repository: {}", e))?;

    // Find the remote
    let mut remote = repo.find_remote(remote_name)
        .map_err(|e| format!("Failed to find remote '{}': {}", remote_name, e))?;

    // Fetch from remote
    let mut fetch_options = FetchOptions::new();
    remote.fetch(&[branch_name], Some(&mut fetch_options), None)
        .map_err(|e| format!("Failed to fetch: {}", e))?;

    // Get the remote branch reference
    let remote_branch_name = format!("{}/{}", remote_name, branch_name);
    let remote_oid = repo.refname_to_id(&format!("refs/remotes/{}", remote_branch_name))
        .map_err(|e| format!("Failed to find remote branch: {}", e))?;

    // Get the HEAD reference
    let mut head = repo.head()
        .map_err(|e| format!("Failed to get HEAD: {}", e))?;
    let head_oid = head.target().ok_or("HEAD has no target")?;

    // Check if we need to merge
    if head_oid != remote_oid {
        // Fast-forward merge
        head.set_target(remote_oid, "pull: Fast-forward")
            .map_err(|e| format!("Failed to update HEAD: {}", e))?;

        Ok(format!("Successfully pulled and fast-forwarded to latest commit"))
    } else {
        Ok("Already up to date".to_string())
    }
}

/// Pull latest changes from remote with authentication
pub fn git_pull_with_auth(repo_dir: &Path, remote_name: &str, branch_name: &str, username: &str, token: &str) -> Result<String, String> {
    let repo = Repository::open(repo_dir)
        .map_err(|e| format!("Failed to open repository: {}", e))?;

    // Find the remote
    let mut remote = repo.find_remote(remote_name)
        .map_err(|e| format!("Failed to find remote '{}': {}", remote_name, e))?;

    // Prepare callbacks for authentication
    let mut callbacks = RemoteCallbacks::new();
    callbacks.credentials(|_url, _username_from_url, _allowed| {
        Cred::userpass_plaintext(username, token)
            .map_err(|_e| git2::Error::from_str("Authentication failed"))
    });

    // Fetch from remote with authentication
    let mut fetch_options = FetchOptions::new();
    fetch_options.remote_callbacks(callbacks);
    remote.fetch(&[branch_name], Some(&mut fetch_options), None)
        .map_err(|e| format!("Failed to fetch: {}", e))?;

    // Get the remote branch reference
    let remote_branch_name = format!("{}/{}", remote_name, branch_name);
    let remote_oid = repo.refname_to_id(&format!("refs/remotes/{}", remote_branch_name))
        .map_err(|e| format!("Failed to find remote branch: {}", e))?;

    // Get the HEAD reference
    let mut head = repo.head()
        .map_err(|e| format!("Failed to get HEAD: {}", e))?;
    let head_oid = head.target().ok_or("HEAD has no target")?;

    // Check if we need to merge
    if head_oid != remote_oid {
        // Fast-forward merge
        head.set_target(remote_oid, "pull: Fast-forward")
            .map_err(|e| format!("Failed to update HEAD: {}", e))?;

        Ok(format!("Successfully pulled and fast-forwarded to latest commit"))
    } else {
        Ok("Already up to date".to_string())
    }
}

/// Create and checkout a new branch
pub fn git_checkout_branch(repo_dir: &Path, branch_name: &str) -> Result<String, String> {
    let repo = Repository::open(repo_dir)
        .map_err(|e| format!("Failed to open repository: {}", e))?;

    // Get current HEAD commit
    let head = repo.head()
        .map_err(|e| format!("Failed to get HEAD: {}", e))?;
    let head_commit = head.peel_to_commit()
        .map_err(|e| format!("Failed to peel HEAD: {}", e))?;

    // Create the new branch
    let branch_oid = repo.branch(branch_name, &head_commit, false)
        .map_err(|e| format!("Failed to create branch: {}", e))?
        .get()
        .target()
        .ok_or("Branch has no target")?;

    // Checkout the branch
    let obj = repo.find_object(branch_oid, None)
        .map_err(|e| format!("Failed to find object: {}", e))?;
    repo.checkout_tree(&obj, None)
        .map_err(|e| format!("Failed to checkout tree: {}", e))?;

    // Set HEAD to the new branch
    repo.set_head(&format!("refs/heads/{}", branch_name))
        .map_err(|e| format!("Failed to set HEAD: {}", e))?;

    Ok(format!("Created and checked out branch: {}", branch_name))
}

/// Get the remote URL of a repository
pub fn get_remote_url(repo_dir: &Path, remote_name: &str) -> Result<Option<String>, String> {
    let repo = Repository::open(repo_dir)
        .map_err(|e| format!("Failed to open repository: {}", e))?;

    let remote = repo.find_remote(remote_name);
    let url = match remote {
        Ok(r) => r.url().map(|u| u.to_string()),
        Err(_) => None,
    };
    Ok(url)
}

/// Check if repository has a specific remote URL
pub fn has_remote_url(repo_dir: &Path, expected_url: &str) -> bool {
    match get_remote_url(repo_dir, "origin") {
        Ok(Some(url)) => {
            url.contains(expected_url) || expected_url.contains(&url)
        }
        _ => false,
    }
}

/// Check if a file or directory has uncommitted changes
pub fn git_has_changes(repo_dir: &Path, pathspec: &str) -> Result<bool, String> {
    // Verify that repo_dir is a git repository
    let _repo = Repository::open(repo_dir)
        .map_err(|e| format!("无法打开仓库: {}", e))?;

    // Check if the path exists in the filesystem
    let target_path = repo_dir.join(pathspec);
    if !target_path.exists() {
        eprintln!("Path does not exist: {}", target_path.display());
        return Ok(false);
    }

    // Use git -C flag to specify repository directory (works on all platforms)
    let repo_dir_str = repo_dir.to_str()
        .ok_or_else(|| "Invalid repository path".to_string())?;

    eprintln!("Checking git status for: repo={}, pathspec={}", repo_dir_str, pathspec);

    #[cfg(target_os = "windows")]
    let result = {
        std::process::Command::new("cmd")
            .args([
                "/C",
                "git",
                "-C",
                repo_dir_str,
                "status",
                "--porcelain",
                "--untracked-files=all",
                pathspec,
            ])
            .output()
    };

    #[cfg(not(target_os = "windows"))]
    let result = {
        std::process::Command::new("git")
            .args([
                "-C",
                repo_dir_str,
                "status",
                "--porcelain",
                "--untracked-files=all",
                pathspec,
            ])
            .output()
    };

    match result {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout);
            let stderr = String::from_utf8_lossy(&output.stderr);

            // Log for debugging
            if !stdout.trim().is_empty() {
                eprintln!("Git detected changes in '{}': {}", pathspec, stdout.trim());
            }
            if !stderr.trim().is_empty() && !stderr.contains("warning:") {
                eprintln!("Git status stderr: {}", stderr);
            }

            // Git status returns empty if no changes
            Ok(!stdout.trim().is_empty())
        }
        Err(e) => {
            eprintln!("Failed to run git status command: {}", e);
            // Fallback: try to detect changes using git2 library
            detect_changes_fallback(repo_dir, pathspec)
        }
    }
}

/// Fallback method to detect changes using git2 library
fn detect_changes_fallback(repo_dir: &Path, pathspec: &str) -> Result<bool, String> {
    let repo = Repository::open(repo_dir)
        .map_err(|e| format!("无法打开仓库: {}", e))?;

    // Check for any changes in the repository
    let statuses = repo.statuses(None)
        .map_err(|e| format!("无法获取状态: {}", e))?;

    // Check if any entry in statuses matches the pathspec
    for entry in statuses.iter() {
        if let Some(path) = entry.path() {
            // Check if this file is within the pathspec directory
            if path.starts_with(pathspec) || path.contains(pathspec) {
                return Ok(true);
            }
        }
    }

    Ok(false)
}

/// Stage and commit changes to a specific file or directory
pub fn git_commit_files(repo_dir: &Path, pathspec: &str, message: &str) -> Result<String, String> {
    // Check if there are actually changes first
    let has_changes = git_has_changes(repo_dir, pathspec)?;
    if !has_changes {
        return Err("没有改动需要提交".to_string());
    }

    // Use git -C flag to specify repository directory (works on all platforms)
    let repo_dir_str = repo_dir.to_str()
        .ok_or_else(|| "Invalid repository path".to_string())?;

    eprintln!("Committing changes: repo={}, pathspec={}, message={}", repo_dir_str, pathspec, message);

    // Stage the files
    #[cfg(target_os = "windows")]
    let add_result = {
        std::process::Command::new("cmd")
            .args(["/C", "git", "-C", repo_dir_str, "add", pathspec])
            .output()
    };

    #[cfg(not(target_os = "windows"))]
    let add_result = {
        std::process::Command::new("git")
            .args(["-C", repo_dir_str, "add", pathspec])
            .output()
    };

    if !add_result.as_ref().map(|o| o.status.success()).unwrap_or(false) {
        let stderr = add_result.as_ref()
            .map(|o| String::from_utf8_lossy(&o.stderr).to_string())
            .unwrap_or_default();
        eprintln!("Git add failed: {}", stderr);
        return Err(format!("暂存失败: {}", stderr.trim()));
    }

    eprintln!("Git add successful for: {}", pathspec);

    // Commit the changes
    #[cfg(target_os = "windows")]
    let commit_result = {
        std::process::Command::new("cmd")
            .args(["/C", "git", "-C", repo_dir_str, "commit", "-m", message])
            .output()
    };

    #[cfg(not(target_os = "windows"))]
    let commit_result = {
        std::process::Command::new("git")
            .args(["-C", repo_dir_str, "commit", "-m", message])
            .output()
    };

    match commit_result {
        Ok(output) => {
            if output.status.success() {
                eprintln!("Git commit successful");
                Ok(format!("成功提交: {}", message))
            } else {
                let stderr = String::from_utf8_lossy(&output.stderr);
                eprintln!("Git commit failed: {}", stderr);
                if stderr.contains("nothing to commit") {
                    Err("没有改动需要提交".to_string())
                } else {
                    Err(format!("提交失败: {}", stderr.trim()))
                }
            }
        }
        Err(e) => {
            eprintln!("Git commit command failed: {}", e);
            Err(format!("提交命令执行失败: {}", e))
        }
    }
}

/// Push commits to remote repository
pub fn git_push(repo_dir: &Path) -> Result<String, String> {
    let repo = Repository::open(repo_dir)
        .map_err(|e| format!("无法打开仓库: {}", e))?;

    // Get the current branch name
    let branch_name = get_current_branch(repo_dir)
        .map_err(|e| format!("无法获取分支名: {}", e))?
        .ok_or_else(|| "无法获取当前分支".to_string())?;

    // Find the remote
    let mut remote = repo.find_remote("origin")
        .map_err(|e| format!("找不到 origin 远程仓库: {}", e))?;

    // Push
    remote.push(&[format!("refs/heads/{}", branch_name)], None)
        .map_err(|e| format!("推送失败: {}", e))?;

    Ok(format!("成功推送到远程仓库的 {} 分支", branch_name))
}

/// Push commits to remote repository with authentication
pub fn git_push_with_auth(repo_dir: &Path, username: &str, token: &str) -> Result<String, String> {
    let repo = Repository::open(repo_dir)
        .map_err(|e| format!("无法打开仓库: {}", e))?;

    // Get the current branch name
    let branch_name = get_current_branch(repo_dir)
        .map_err(|e| format!("无法获取分支名: {}", e))?
        .ok_or_else(|| "无法获取当前分支".to_string())?;

    // Find the remote
    let mut remote = repo.find_remote("origin")
        .map_err(|e| format!("找不到 origin 远程仓库: {}", e))?;

    // Prepare callbacks for authentication
    let mut callbacks = RemoteCallbacks::new();
    callbacks.credentials(|_url, _username_from_url, _allowed| {
        Cred::userpass_plaintext(username, token)
            .map_err(|_e| git2::Error::from_str("认证失败"))
    });

    // Push with authentication
    let mut push_options = git2::PushOptions::new();
    push_options.remote_callbacks(callbacks);

    remote.push(&[format!("refs/heads/{}", branch_name)], Some(&mut push_options))
        .map_err(|e| format!("推送失败: {}", e))?;

    Ok(format!("成功推送到远程仓库的 {} 分支", branch_name))
}
