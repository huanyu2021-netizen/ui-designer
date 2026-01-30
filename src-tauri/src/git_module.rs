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
