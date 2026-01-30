/**
 * Git Credentials Storage Utility
 * Uses localStorage to avoid file system permission issues on macOS
 */

export interface GitCredentials {
  username: string;
  token: string;
}

const CREDENTIALS_KEY = 'git_credentials';

/**
 * Save Git credentials to localStorage
 */
export function saveGitCredentials(credentials: GitCredentials): void {
  try {
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
  } catch (error) {
    console.error('Failed to save credentials to localStorage:', error);
    throw error;
  }
}

/**
 * Load Git credentials from localStorage
 */
export function loadGitCredentials(): GitCredentials | null {
  try {
    const stored = localStorage.getItem(CREDENTIALS_KEY);
    if (stored) {
      return JSON.parse(stored) as GitCredentials;
    }
    return null;
  } catch (error) {
    console.error('Failed to load credentials from localStorage:', error);
    return null;
  }
}

/**
 * Clear Git credentials from localStorage
 */
export function clearGitCredentials(): void {
  try {
    localStorage.removeItem(CREDENTIALS_KEY);
  } catch (error) {
    console.error('Failed to clear credentials from localStorage:', error);
  }
}

/**
 * Check if Git credentials exist
 */
export function hasGitCredentials(): boolean {
  return localStorage.getItem(CREDENTIALS_KEY) !== null;
}
