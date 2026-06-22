import { api, imgUrl } from './api.js';
import { state, setState } from './state.js';
import { icons, DEFAULT_AVATAR, PLACEHOLDER_IMG } from './icons.js';
import { S } from './strings.js';
import { renderPostEditor, bindPostEditor } from './postForm.js';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderPostCard(post, { editMode = false } = {}) {
  const tags = (post.varieties || []).filter(Boolean);
  const image = imgUrl(post.seedImage) || PLACEHOLDER_IMG;
  const avatar = imgUrl(post.authorAvatar) || DEFAULT_AVATAR;

  return `
    <article class="post-card" data-id="${post.id}" data-edit="${editMode}">
      <div class="post-card-image">
        <img src="${escapeHtml(image)}" alt="${escapeHtml(post.title)}" loading="lazy"
          onerror="this.src='${PLACEHOLDER_IMG}'" />
      </div>
      <div class="post-card-body">
        <h3 class="post-card-title">${escapeHtml(post.title)}</h3>
        <div class="post-card-tags">
          ${tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
        </div>
        <div class="post-card-author">
          <img src="${escapeHtml(avatar)}" alt="" onerror="this.src='${DEFAULT_AVATAR}'" />
          <span>${escapeHtml(post.authorName)}</span>
        </div>
      </div>
    </article>
  `;
}

function renderPostGrid(posts, { editMode = false, emptyText = S.noPosts } = {}) {
  if (!posts.length) {
    return `<div class="center-message"><p>${emptyText}</p></div>`;
  }
  return `<div class="post-grid">${posts.map((p) => renderPostCard(p, { editMode })).join('')}</div>`;
}

async function loadGarden(container) {
  container.innerHTML = `<div class="loading">${S.loading}</div>`;
  try {
    const query = state.searchQuery?.trim();
    const posts = query ? await api.searchPosts(query) : await api.getPosts();
    const title = query
      ? `Search: "${escapeHtml(query)}"`
      : 'Latest Feed';
    container.innerHTML = `
      <h2 class="content-title">${title}</h2>
      ${renderPostGrid(posts, { emptyText: query ? S.noSearchResults : S.noPosts })}
    `;
    bindPostClicks(container, false);
  } catch (e) {
    container.innerHTML = `<p class="error-text">${escapeHtml(e.message)}</p>`;
  }
}

async function refreshUserPostCount() {
  if (!state.user?.id) return;
  try {
    const posts = await api.getPosts(state.user.id);
    state.postCount = posts.length;
    const statEl = document.querySelector('.sidebar-stat-num');
    if (statEl) statEl.textContent = posts.length;
  } catch {
    /* sidebar stat is non-critical */
  }
}

async function loadMyPlant(container) {
  if (!state.user) {
    container.innerHTML = `
      <div class="center-message">
        <p>${S.loginFirst}</p>
        <button type="button" id="myplant-login-btn">${S.goLogin}</button>
      </div>
    `;
    container.querySelector('#myplant-login-btn')?.addEventListener('click', () => {
      setState({ showLogin: true });
    });
    return;
  }

  container.innerHTML = `<div class="loading">${S.loading}</div>`;
  try {
    const posts = await api.getPosts(state.user.id);
    state.postCount = posts.length;
    const statEl = document.querySelector('.sidebar-stat-num');
    if (statEl) statEl.textContent = posts.length;
    container.innerHTML = `
      <h2 class="content-title">My Plants</h2>
      ${renderPostGrid(posts, { editMode: true, emptyText: S.noMyPosts })}
    `;
    bindPostClicks(container, true);
  } catch (e) {
    container.innerHTML = `<p class="error-text">${escapeHtml(e.message)}</p>`;
  }
}

function bindPostClicks(container, editMode) {
  container.querySelectorAll('.post-card').forEach((card) => {
    card.addEventListener('click', () => {
      const id = Number(card.dataset.id);
      if (editMode) {
        setState({ route: { page: 'edit', id }, showPostDetail: null });
        window.location.hash = `#/edit/${id}`;
      } else {
        openPostDetail(id);
      }
    });
  });
}

async function openPostDetail(id) {
  setState({ showPostDetail: { id, loading: true, data: null, imageIndex: 0 } });
  try {
    const data = await api.getPost(id);
    setState({ showPostDetail: { id, loading: false, data, imageIndex: 0 } });
  } catch (e) {
    setState({ showPostDetail: { id, loading: false, error: e.message } });
  }
}

function renderSidebar() {
  const user = state.user;
  const avatar = user ? imgUrl(user.avatar) || DEFAULT_AVATAR : DEFAULT_AVATAR;
  const name = user ? user.username : 'Guest';
  const view = state.view;

  const navItems = [
    { id: 'garden', label: 'garden', icon: icons.garden },
    { id: 'myplant', label: 'myplant', icon: icons.myplant },
    { id: 'settings', label: 'settings', icon: icons.settings },
  ];

  return `
    <aside class="sidebar">
      <div class="sidebar-logo">
        ${icons.logo}
        <span>Plantd</span>
      </div>
      <div class="sidebar-profile">
        <div class="sidebar-avatar-wrap">
          <img class="sidebar-avatar" src="${escapeHtml(avatar)}" alt=""
            onerror="this.src='${DEFAULT_AVATAR}'" />
        </div>
        <div class="sidebar-username">${escapeHtml(name)}</div>
        <div class="sidebar-subtitle">${user ? 'Gardener' : S.notLoggedIn}</div>
        ${user ? `
          <div class="sidebar-stats">
            <div class="sidebar-stat">
              <div class="sidebar-stat-num">${state.postCount}</div>
              <div class="sidebar-stat-label">Posts</div>
            </div>
          </div>
        ` : ''}
      </div>
      <nav class="sidebar-nav">
        ${navItems
          .map((item) => {
            if (item.id === 'settings') {
              return `
          <div class="settings-nav-wrap">
            <button class="nav-item ${view === 'account' ? 'active' : ''} ${state.settingsOpen ? 'open' : ''}" data-view="settings" id="settings-nav-btn">
              ${item.icon}
              <span>${item.label}</span>
            </button>
            ${
              state.settingsOpen
                ? `
              <div class="settings-dropdown" id="settings-dropdown">
                <button type="button" class="settings-dropdown-item" id="settings-account">${S.accountSettings}</button>
                <button type="button" class="settings-dropdown-item settings-dropdown-logout" id="settings-logout">${S.accountLogout}</button>
              </div>
            `
                : ''
            }
          </div>
        `;
            }
            return `
          <button class="nav-item ${view === item.id ? 'active' : ''}" data-view="${item.id}">
            ${item.icon}
            <span>${item.label}</span>
          </button>
        `;
          })
          .join('')}
      </nav>
    </aside>
  `;
}

function renderTopbar() {
  const avatar = state.user ? imgUrl(state.user.avatar) || DEFAULT_AVATAR : DEFAULT_AVATAR;
  return `
    <header class="topbar">
      <a class="topbar-logo mobile-only" href="#" id="topbar-logo" aria-label="Plantd">
        ${icons.logo}
      </a>
      <form class="topbar-search" id="search-form">
        <input
          type="search"
          id="search-input"
          class="topbar-search-input"
          placeholder="${S.searchPlaceholder}"
          value="${escapeHtml(state.searchQuery || '')}"
          autocomplete="off"
        />
      </form>
      <div class="topbar-actions desktop-only">
        <button class="btn-seed" id="btn-plant-seed" type="button">+ Plant A Seed</button>
        <img class="topbar-avatar" id="topbar-avatar" src="${escapeHtml(avatar)}" alt="profile"
          onerror="this.src='${DEFAULT_AVATAR}'" />
      </div>
    </header>
  `;
}

function renderBottomNav() {
  const view = state.view;
  const items = [
    { id: 'garden', label: S.navHome, icon: icons.garden },
    { id: 'myplant', label: S.navMarket, icon: icons.market },
    { id: 'create', label: '', icon: icons.plus, isCenter: true },
    { id: 'messages', label: S.navMessages, icon: icons.message },
    { id: 'account', label: S.navMe, icon: icons.user },
  ];

  return `
    <nav class="bottom-nav mobile-only" id="bottom-nav">
      ${items
        .map((item) => {
          if (item.isCenter) {
            return `
          <button type="button" class="bottom-nav-item bottom-nav-create" id="bottom-nav-create" aria-label="Plant A Seed">
            <span class="bottom-nav-create-icon">${item.icon}</span>
          </button>
        `;
          }
          const active = view === item.id;
          return `
          <button type="button" class="bottom-nav-item ${active ? 'active' : ''}" data-view="${item.id}">
            ${item.icon}
            <span>${item.label}</span>
          </button>
        `;
        })
        .join('')}
    </nav>
  `;
}

function renderPostDetailModal() {
  const detail = state.showPostDetail;
  if (!detail) return '';

  if (detail.loading) {
    return `
      <div class="overlay" id="detail-overlay">
        <div class="dev-toast">${S.loading}</div>
      </div>
    `;
  }

  if (detail.error) {
    return `
      <div class="overlay" id="detail-overlay">
        <div class="dev-toast">
          <p>${escapeHtml(detail.error)}</p>
          <button type="button" id="detail-close-btn">${S.close}</button>
        </div>
      </div>
    `;
  }

  const post = detail.data;
  const images = post.imageUrls?.length ? post.imageUrls : [PLACEHOLDER_IMG];
  const idx = detail.imageIndex || 0;
  const currentImg = imgUrl(images[idx]) || PLACEHOLDER_IMG;
  const authorAvatar = imgUrl(post.authorAvatar) || DEFAULT_AVATAR;

  return `
    <div class="overlay" id="detail-overlay">
      <div class="detail-modal">
        <button class="detail-close" id="detail-close-btn" type="button">&times;</button>
        <div class="detail-modal-media">
          <img src="${escapeHtml(currentImg)}" alt="" onerror="this.src='${PLACEHOLDER_IMG}'" />
          ${
            images.length > 1
              ? `
            <button class="carousel-btn prev" id="carousel-prev" type="button">&#8249;</button>
            <button class="carousel-btn next" id="carousel-next" type="button">&#8250;</button>
            <div class="carousel-dots">
              ${images.map((_, i) => `<span class="carousel-dot ${i === idx ? 'active' : ''}"></span>`).join('')}
            </div>
          `
              : ''
          }
        </div>
        <div class="detail-modal-info">
          <div class="detail-header">
            <img src="${escapeHtml(authorAvatar)}" alt="" onerror="this.src='${DEFAULT_AVATAR}'" />
            <span class="name">${escapeHtml(post.authorName)}</span>
          </div>
          <div class="detail-body">
            <h2 class="detail-title">${escapeHtml(post.seedName)}</h2>
            <p class="detail-content">${escapeHtml(post.content || '')}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderLoginModal() {
  if (!state.showLogin) return '';
  return `
    <div class="overlay" id="login-overlay">
      <div class="login-modal">
        <button class="login-close" id="login-close" type="button">&times;</button>
        <h2>${S.loginTitle}</h2>
        <form id="login-form">
          <div class="login-field">
            <input type="text" name="username" placeholder="${S.username}" required autocomplete="username" />
          </div>
          <div class="login-field">
            <input type="password" name="password" placeholder="${S.password}" required autocomplete="current-password" />
          </div>
          <button class="btn-login" type="submit">${S.login}</button>
          <p class="login-error" id="login-error" hidden></p>
        </form>
        <p class="login-footer">
          ${S.noAccount}<a href="#/register" id="go-register">${S.register}</a>
        </p>
      </div>
    </div>
  `;
}

function renderAccountSettings() {
  const user = state.user;
  const avatar = user ? imgUrl(user.avatar) || DEFAULT_AVATAR : DEFAULT_AVATAR;

  return `
    <div class="account-settings">
      <h2 class="account-settings-title">${S.accountInfoTitle}</h2>
      <form id="account-form" class="account-form">
        <div class="account-row account-avatar-row">
          <label class="account-label">${S.avatar}</label>
          <div class="account-avatar-block">
            <img class="account-avatar-preview" id="account-avatar-preview" src="${escapeHtml(avatar)}"
              alt="" onerror="this.src='${DEFAULT_AVATAR}'" />
            <label class="account-avatar-upload">
              <input type="file" id="account-avatar-input" accept="image/*" hidden />
              ${S.changeAvatar}
            </label>
            <p class="account-hint">${S.avatarHint}</p>
          </div>
        </div>
        <div class="account-row">
          <label class="account-label" for="account-username">${S.nickname}</label>
          <div class="account-field">
            <input id="account-username" name="username" type="text" required
              value="${escapeHtml(user?.username || '')}" placeholder="${S.username}" maxlength="30" />
            <p class="account-hint">${S.usernameHint}</p>
          </div>
        </div>
        <p class="login-error" id="account-error" hidden></p>
        <div class="account-actions">
          <button class="btn-primary" type="submit">${S.save}</button>
          <button class="btn-logout mobile-only" type="button" id="account-logout">${S.accountLogout}</button>
        </div>
      </form>
    </div>
  `;
}

function loadMessages(container) {
  container.innerHTML = `
    <div class="center-message messages-empty">
      <p>${S.messagesEmpty}</p>
    </div>
  `;
}

function loadAccountSettings(container) {
  if (!state.user) {
    container.innerHTML = `
      <div class="center-message">
        <p>${S.loginFirst}</p>
        <button type="button" id="account-login-btn">${S.goLogin}</button>
      </div>
    `;
    container.querySelector('#account-login-btn')?.addEventListener('click', () => {
      setState({ showLogin: true });
    });
    return;
  }

  container.innerHTML = renderAccountSettings();
  bindAccountForm(container);
}

function bindAccountForm(container) {
  const form = container.querySelector('#account-form');
  const errorEl = container.querySelector('#account-error');
  const preview = container.querySelector('#account-avatar-preview');
  const avatarInput = container.querySelector('#account-avatar-input');

  avatarInput?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    errorEl.hidden = true;
    try {
      const res = await api.uploadAvatar(file);
      const user = await api.me();
      setState({ user });
      preview.src = imgUrl(res.url) || imgUrl(user.avatar) || DEFAULT_AVATAR;
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.hidden = false;
    } finally {
      avatarInput.value = '';
    }
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.hidden = true;
    const username = form.querySelector('[name="username"]').value.trim();
    if (!username) {
      errorEl.textContent = S.usernameRequired;
      errorEl.hidden = false;
      return;
    }
    const btn = form.querySelector('.btn-primary');
    btn.disabled = true;
    try {
      const user = await api.updateProfile({ username });
      setState({ user });
      errorEl.style.color = '#27ae60';
      errorEl.textContent = S.saveSuccess;
      errorEl.hidden = false;
      setTimeout(() => {
        errorEl.hidden = true;
        errorEl.style.color = '';
      }, 2000);
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.hidden = false;
    } finally {
      btn.disabled = false;
    }
  });

  container.querySelector('#account-logout')?.addEventListener('click', async () => {
    try {
      await api.logout();
    } catch {
      /* cookie cleared even on error */
    }
    setState({ user: null, view: 'garden', settingsOpen: false, route: null, searchQuery: '' });
  });
}

async function renderEditPage(container, id) {
  if (!state.user) {
    container.innerHTML = `
      <div class="center-message">
        <p>${S.loginFirst}</p>
        <button type="button" id="edit-login-btn">${S.goLogin}</button>
      </div>
    `;
    container.querySelector('#edit-login-btn')?.addEventListener('click', () => {
      setState({ showLogin: true });
    });
    return;
  }

  container.innerHTML = `<div class="loading">${S.loading}</div>`;
  try {
    const post = await api.getPost(id);
    if (post.authorName !== state.user.username) {
      container.innerHTML = `<p class="error-text">${S.editForbidden}</p>`;
      return;
    }
    container.innerHTML = renderPostEditor({ mode: 'edit', post });
    bindPostEditor(container, { mode: 'edit', post });
  } catch (e) {
    container.innerHTML = `<p class="error-text">${escapeHtml(e.message)}</p>`;
  }
}

function renderRegisterPage() {
  return `
    <div class="content" style="display:flex;align-items:center;justify-content:center;min-height:80vh;">
      <div class="page-form" style="width:100%;">
        <h1>${S.registerTitle}</h1>
        <form id="register-form">
          <div class="form-group">
            <label>${S.username} *</label>
            <input name="username" required placeholder="${S.username}" autocomplete="username" />
          </div>
          <div class="form-group">
            <label>${S.password} *</label>
            <input type="password" name="password" required placeholder="${S.password}" autocomplete="new-password" />
          </div>
          <p class="login-error" id="form-error" hidden></p>
          <div class="form-actions">
            <button class="btn-primary" type="submit">${S.register}</button>
            <a class="btn-secondary" href="#" id="back-login" style="display:inline-flex;align-items:center;">${S.backToLogin}</a>
          </div>
        </form>
      </div>
    </div>
  `;
}

function bindRegisterPage(container) {
  const form = container.querySelector('#register-form');
  const errorEl = container.querySelector('#form-error');

  container.querySelector('#back-login')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.hash = '';
    setState({ route: null, showLogin: true });
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.hidden = true;
    const fd = new FormData(form);
    try {
      await api.register({
        username: fd.get('username'),
        password: fd.get('password'),
      });
      window.location.hash = '';
      setState({ route: null, showLogin: true });
      alert(S.registerSuccess);
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.hidden = false;
    }
  });
}

let searchDebounceTimer = null;

function applySearch(query) {
  const trimmed = query.trim();
  if (trimmed === (state.searchQuery || '')) return;
  setState({ searchQuery: trimmed, view: 'garden', route: null });
}

function bindShellEvents(root) {
  root.querySelectorAll('[data-view]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const view = btn.dataset.view;
      if (view === 'settings') {
        e.stopPropagation();
        if (!state.user) {
          setState({ showLogin: true, settingsOpen: false });
          return;
        }
        setState({ settingsOpen: !state.settingsOpen });
        return;
      }
      if (view === 'account' && !state.user) {
        setState({ showLogin: true, settingsOpen: false });
        return;
      }
      if (view === 'messages') {
        setState({ view: 'messages', route: null, settingsOpen: false });
        return;
      }
      setState({ view, route: null, settingsOpen: false, searchQuery: view === 'garden' ? state.searchQuery : '' });
    });
  });

  root.querySelector('#bottom-nav-create')?.addEventListener('click', () => {
    if (!state.user) {
      setState({ showLogin: true });
      return;
    }
    window.location.hash = '#/create';
    setState({ route: { page: 'create' }, showPostDetail: null });
  });

  root.querySelector('#topbar-logo')?.addEventListener('click', (e) => {
    e.preventDefault();
    setState({ view: 'garden', route: null, settingsOpen: false });
  });

  const searchForm = root.querySelector('#search-form');
  const searchInput = root.querySelector('#search-input');

  searchForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    applySearch(searchInput?.value || '');
  });

  searchInput?.addEventListener('input', (e) => {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      applySearch(e.target.value);
    }, 350);
  });

  searchInput?.addEventListener('search', (e) => {
    if (e.target.value === '') {
      applySearch('');
    }
  });

  root.querySelector('#settings-account')?.addEventListener('click', (e) => {
    e.stopPropagation();
    setState({ view: 'account', settingsOpen: false, route: null });
  });

  root.querySelector('#settings-logout')?.addEventListener('click', async (e) => {
    e.stopPropagation();
    try {
      await api.logout();
    } catch {
      /* cookie cleared even on error */
    }
    setState({ user: null, view: 'garden', settingsOpen: false, route: null, searchQuery: '' });
  });

  if (state.settingsOpen) {
    setTimeout(() => {
      document.addEventListener(
        'click',
        function closeSettingsMenu() {
          setState({ settingsOpen: false });
          document.removeEventListener('click', closeSettingsMenu);
        },
        { once: true }
      );
    }, 0);
    root.querySelector('#settings-dropdown')?.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  root.querySelector('#btn-plant-seed')?.addEventListener('click', () => {
    if (!state.user) {
      setState({ showLogin: true });
      return;
    }
    window.location.hash = '#/create';
    setState({ route: { page: 'create' }, showPostDetail: null });
  });

  root.querySelector('#topbar-avatar')?.addEventListener('click', () => {
    if (!state.user) {
      setState({ showLogin: true });
    }
  });

  root.querySelector('#detail-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'detail-overlay') {
      setState({ showPostDetail: null });
    }
  });

  root.querySelector('#detail-close-btn')?.addEventListener('click', () => {
    setState({ showPostDetail: null });
  });

  const detail = state.showPostDetail;
  if (detail?.data?.imageUrls?.length > 1) {
    root.querySelector('#carousel-prev')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const len = detail.data.imageUrls.length;
      const next = ((detail.imageIndex || 0) - 1 + len) % len;
      setState({ showPostDetail: { ...detail, imageIndex: next } });
    });
    root.querySelector('#carousel-next')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const len = detail.data.imageUrls.length;
      const next = ((detail.imageIndex || 0) + 1) % len;
      setState({ showPostDetail: { ...detail, imageIndex: next } });
    });
  }

  root.querySelector('#login-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'login-overlay') {
      setState({ showLogin: false });
    }
  });

  root.querySelector('#login-close')?.addEventListener('click', () => {
    setState({ showLogin: false });
  });

  root.querySelector('#go-register')?.addEventListener('click', (e) => {
    e.preventDefault();
    setState({ showLogin: false, route: { page: 'register' } });
    window.location.hash = '#/register';
  });

  root.querySelector('#login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = root.querySelector('#login-error');
    errorEl.hidden = true;
    const fd = new FormData(e.target);
    const btn = e.target.querySelector('.btn-login');
    btn.disabled = true;
    try {
      const user = await api.login({
        username: fd.get('username'),
        password: fd.get('password'),
      });
      setState({ user, showLogin: false });
      await refreshUserPostCount();
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.hidden = false;
    } finally {
      btn.disabled = false;
    }
  });
}

let contentContainer = null;

export function render() {
  const app = document.getElementById('app');
  const route = state.route;
  const isRegister = route?.page === 'register' || window.location.hash === '#/register';

  if (isRegister) {
    app.innerHTML = renderRegisterPage();
    bindRegisterPage(app);
    return;
  }

  const isFullPage = route?.page === 'create' || route?.page === 'edit';

  if (isFullPage) {
    app.innerHTML = `
      <div id="main-content"></div>
      ${renderLoginModal()}
    `;
    contentContainer = app.querySelector('#main-content');
    bindShellEvents(app);

    if (route?.page === 'create') {
      if (!state.user) {
        contentContainer.innerHTML = `
          <div class="center-message">
            <p>${S.loginFirst}</p>
            <button type="button" id="create-login-btn">${S.goLogin}</button>
          </div>
        `;
        contentContainer.querySelector('#create-login-btn')?.addEventListener('click', () => {
          setState({ showLogin: true });
        });
      } else {
        contentContainer.innerHTML = renderPostEditor({ mode: 'create' });
        bindPostEditor(contentContainer, { mode: 'create' });
      }
    } else if (route?.page === 'edit') {
      renderEditPage(contentContainer, route.id);
    }
    return;
  }

  app.innerHTML = `
    <div class="app-shell">
      ${renderSidebar()}
      <div class="main-area">
        ${renderTopbar()}
        <div id="main-content"></div>
      </div>
    </div>
    ${renderBottomNav()}
    ${renderPostDetailModal()}
    ${renderLoginModal()}
  `;

  contentContainer = app.querySelector('#main-content');
  contentContainer.className = 'content';
  bindShellEvents(app);

  if (state.view === 'garden') {
    loadGarden(contentContainer);
  } else if (state.view === 'myplant') {
    loadMyPlant(contentContainer);
  } else if (state.view === 'account') {
    loadAccountSettings(contentContainer);
  } else if (state.view === 'messages') {
    loadMessages(contentContainer);
  }
}

export async function initAuth() {
  try {
    const user = await api.me();
    setState({ user });
    await refreshUserPostCount();
  } catch {
    setState({ user: null });
  }
}

export function parseHash() {
  const hash = window.location.hash;
  if (hash === '#/register') {
    setState({ route: { page: 'register' } });
  } else if (hash === '#/create') {
    setState({ route: { page: 'create' } });
  } else if (hash.startsWith('#/edit/')) {
    const id = Number(hash.replace('#/edit/', ''));
    if (id) setState({ route: { page: 'edit', id } });
  } else {
    setState({ route: null });
  }
}
