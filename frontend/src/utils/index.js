export function sanitizeImagePreviewUrl(url) {
    if (!url || typeof url !== 'string') return null;
    try {
        const parsed = new URL(url, window.location.origin);
        const allowedProtocols = ['blob:', 'http:', 'https:'];
        return allowedProtocols.includes(parsed.protocol) ? parsed.href : null;
    } catch {
        return null;
    }
}
