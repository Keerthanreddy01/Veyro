/**
 * Universal media URL resolver for Veyro LMS.
 * Properly maps uploaded assets (thumbnails, video chunks, PDFs, certificates)
 * to either the local proxy in development or the absolute Render backend in production.
 */
export function getMediaUrl(path?: string | null): string {
  if (!path) return '';

  // Already a full external URL or data URL
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }

  // Strip leading slashes to normalize
  const cleanPath = path.replace(/^\/+/, '');

  // Prepend static/ if not present
  const staticPath = cleanPath.startsWith('static/') ? cleanPath : `static/${cleanPath}`;

  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl && typeof apiUrl === 'string' && apiUrl.startsWith('http')) {
    // apiUrl is e.g. "https://veyro-y6gj.onrender.com/api"
    const backendOrigin = apiUrl.replace(/\/api\/?$/, '');
    return `${backendOrigin}/${staticPath}`;
  }

  // Fallback to local dev proxy (/static/...)
  return `/${staticPath}`;
}
