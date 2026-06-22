const jsonHeaders = { 'Content-Type': 'application/json' };

async function request(path, options = {}) {
  const res = await fetch(path, {
    credentials: 'include',
    ...options,
    headers: { ...jsonHeaders, ...options.headers },
  });

  if (res.status === 204) return null;

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message = data?.message || res.statusText;
    throw new Error(message);
  }

  return data;
}

export const api = {
  register: (body) =>
    request('/api/v1/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  login: (body) =>
    request('/api/v1/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  logout: () => request('/api/v1/auth/logout', { method: 'POST' }),

  me: () => request('/api/v1/auth/me'),

  updateProfile: (body) =>
    request('/api/v1/auth/me', { method: 'PATCH', body: JSON.stringify(body) }),

  getPosts: (gardenerId) => {
    const qs = gardenerId ? `?gardenerId=${encodeURIComponent(gardenerId)}` : '';
    return request(`/api/v1/seeds${qs}`);
  },

  /** Search by post title or author username (merges two backend queries) */
  async searchPosts(query) {
    const q = encodeURIComponent(query);
    const [byTitle, byAuthor] = await Promise.all([
      request(`/api/v1/seeds?postName=${q}`),
      request(`/api/v1/seeds?gardenerName=${q}`),
    ]);
    const map = new Map();
    for (const post of [...byTitle, ...byAuthor]) {
      map.set(post.id, post);
    }
    return [...map.values()];
  },

  getPost: (id) => request(`/api/v1/seeds/${id}`),

  createPost: (body) =>
    request('/api/v1/seeds', { method: 'POST', body: JSON.stringify(body) }),

  updatePost: (id, body) =>
    request(`/api/v1/seeds/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  deletePost: (id) => request(`/api/v1/seeds/${id}`, { method: 'DELETE' }),

  getTags: (keyword) => {
    const qs = keyword?.trim() ? `?tag=${encodeURIComponent(keyword.trim())}` : '';
    return request(`/api/v1/tags${qs}`);
  },

  createTags: (tagsName) =>
    request('/api/v1/tags', { method: 'POST', body: JSON.stringify({ tagsName }) }),

  uploadAvatar: async (file) => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/v1/upload/avatar', {
      method: 'POST',
      credentials: 'include',
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || '\u5934\u50cf\u4e0a\u4f20\u5931\u8d25');
    return data;
  },

  uploadImage: async (file) => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/v1/upload/image', {
      method: 'POST',
      credentials: 'include',
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || '\u4e0a\u4f20\u5931\u8d25');
    return data;
  },
};

export function imgUrl(path) {
  if (!path) return null;
  if (path.startsWith('/avatars/')) return '/img/avatar/default.png';
  if (path.startsWith('http')) return path;
  // 兼容旧数据：/img/uuid.png → /img/post/uuid.png
  const legacy = path.match(/^\/img\/([0-9a-f-]+\.[a-z]+)$/i);
  if (legacy) return `/img/post/${legacy[1]}`;
  return path;
}
