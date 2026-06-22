const listeners = new Set();

export const state = {
  user: null,
  view: 'garden',
  showLogin: false,
  showPostDetail: null,
  settingsOpen: false,
  route: null,
  postCount: 0,
  searchQuery: '',
};

export function setState(patch) {
  Object.assign(state, patch);
  listeners.forEach((fn) => fn());
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
