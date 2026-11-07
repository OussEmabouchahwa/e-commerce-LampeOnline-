// Centralized API client. All requests go through here.
// Never store tokens — they live in httpOnly cookies.
const BASE = '/api';
async function request(path, options) {
    const res = await fetch(`${BASE}${path}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
        ...options,
    });
    if (res.status === 204)
        return undefined;
    const data = (await res.json());
    if (!res.ok) {
        const err = data;
        throw new ApiError(err.error?.message ?? 'Something went wrong', err.error?.code ?? 'UNKNOWN', res.status, err.error?.details);
    }
    return data;
}
export class ApiError extends Error {
    constructor(message, code, status, details) {
        super(message);
        this.code = code;
        this.status = status;
        this.details = details;
        this.name = 'ApiError';
    }
}
export const api = {
    get: (path) => request(path, { method: 'GET' }),
    post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
    patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
    put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (path) => request(path, { method: 'DELETE' }),
    uploadImage: async (file) => {
        const form = new FormData();
        form.append('image', file);
        const res = await fetch(`${BASE}/products/upload`, {
            method: 'POST',
            credentials: 'include',
            body: form,
        });
        if (!res.ok)
            throw new ApiError('Upload failed', 'UPLOAD_FAILED', res.status);
        return res.json();
    },
};
//# sourceMappingURL=api.js.map