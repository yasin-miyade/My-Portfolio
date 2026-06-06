/**
 * URL Utilities for separated frontend and backend deployment.
 */

// Reads the backend URL from the Vite environment variable VITE_API_URL
const API_URL = import.meta.env.VITE_API_URL || '';

// Normalize the base API URL (removing trailing slash if present)
const getNormalizedBase = () => {
  if (!API_URL) return '';
  return API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
};

/**
 * Resolves an asset path (such as /uploads/filename.png) to its absolute URL
 * on the backend server if VITE_API_URL is configured.
 */
export const getAssetUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  
  // Return directly if it's already an absolute path
  if (
    path.startsWith('http://') || 
    path.startsWith('https://') || 
    path.startsWith('data:')
  ) {
    return path;
  }
  
  const base = getNormalizedBase();
  if (!base) return path; // Fallback to relative path if no base API is set
  
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

/**
 * Parses a rich-text HTML string and updates relative src/href attributes
 * pointing to /uploads/ to use the absolute backend server URL.
 */
export const processHtmlContent = (html: string | null | undefined): string => {
  if (!html) return '';
  
  const base = getNormalizedBase();
  if (!base) return html; // Return original if no base URL is defined
  
  // Replace relative src="/uploads/..." or src='/uploads/...'
  return html
    .replace(/src=(['"])\/uploads\//g, `src=$1${base}/uploads/`)
    .replace(/href=(['"])\/uploads\//g, `href=$1${base}/uploads/`);
};
