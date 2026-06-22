import { api, imgUrl } from './api.js';
import { setState } from './state.js';
import { icons } from './icons.js';
import { S } from './strings.js';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

let imageIdSeq = 0;
function nextImageId() {
  imageIdSeq += 1;
  return `img-${imageIdSeq}`;
}

export function renderPostEditor({ mode, post = null } = {}) {
  const isEdit = mode === 'edit';
  const title = post?.seedName || '';
  const content = post?.content || '';
  const publishLabel = isEdit ? S.save : S.plantBtn;

  return `
    <div class="post-editor">
      <header class="editor-topbar">
        <button type="button" class="editor-topbar-btn" id="editor-home" title="${S.back}">
          ${icons.back}
        </button>
        <div class="editor-topbar-actions">
          ${
            isEdit
              ? `<button type="button" class="editor-topbar-btn editor-topbar-btn-danger" id="editor-delete" title="${S.delete}">${icons.trash}</button>`
              : ''
          }
          <button type="button" class="editor-topbar-btn editor-topbar-btn-accent editor-publish-desktop" id="editor-publish" title="${isEdit ? S.save : S.publish}">
            ${icons.check}
          </button>
        </div>
      </header>
      <div class="editor-body">
        <section class="editor-section editor-images-section">
          <div class="editor-image-list editor-image-list--mobile" id="image-list"></div>
          <input type="file" id="image-file-input" accept="image/*" hidden />
        </section>
        <section class="editor-section editor-main-section">
          <input class="editor-title" id="editor-title" type="text" placeholder="${S.seedNamePlaceholder}" value="${escapeHtml(title)}" maxlength="200" />
          <textarea class="editor-content" id="editor-content" placeholder="${S.contentPlaceholder}">${escapeHtml(content)}</textarea>
          <p class="login-error editor-error" id="editor-error" hidden></p>
        </section>
        <section class="editor-section editor-tags-section">
          <div class="editor-tags-panel">
            <div class="editor-tag-search-row">
              <input type="search" class="editor-tag-search" id="tag-search" placeholder="${S.tagSearchPlaceholder}" autocomplete="off" />
              <button type="button" class="editor-tag-add-btn" id="tag-add-btn" title="${S.newTag}">${icons.plus}</button>
            </div>
            <div class="editor-tag-list" id="tag-list"></div>
          </div>
        </section>
      </div>
      <footer class="editor-mobile-footer">
        <button type="button" class="btn-plant-mobile editor-publish-mobile" id="editor-publish-mobile">${publishLabel}</button>
      </footer>
    </div>
    <div class="overlay" id="new-tag-overlay" hidden>
      <div class="tag-modal">
        <div class="tag-modal-header">
          <span>${S.newTag}</span>
          <button type="button" class="tag-modal-close" id="new-tag-close">&times;</button>
        </div>
        <div class="tag-modal-body">
          <input type="text" id="new-tag-input" placeholder="${S.tagNamePlaceholder}" maxlength="50" />
        </div>
        <div class="tag-modal-footer">
          <button type="button" class="btn-primary tag-modal-confirm" id="new-tag-confirm">${S.confirm}</button>
        </div>
        <p class="login-error tag-modal-error" id="new-tag-error" hidden></p>
      </div>
    </div>
  `;
}

export function bindPostEditor(container, { mode, post = null } = {}) {
  const isEdit = mode === 'edit';
  const errorEl = container.querySelector('#editor-error');
  const tagListEl = container.querySelector('#tag-list');
  const imageListEl = container.querySelector('#image-list');
  const fileInput = container.querySelector('#image-file-input');
  const tagSearchEl = container.querySelector('#tag-search');
  const overlay = container.querySelector('#new-tag-overlay');

  const selectedTagIds = new Set((post?.varietyIds || []).map(Number));
  let allTags = [];
  let images = [];
  let dragFromIndex = null;
  let tagSearchTimer = null;

  if (post?.imageUrls?.length) {
    images = post.imageUrls.map((url) => ({
      id: nextImageId(),
      url,
      preview: imgUrl(url),
      uploading: false,
    }));
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }

  function clearError() {
    errorEl.hidden = true;
  }

  function renderTags() {
    if (!allTags.length) {
      tagListEl.innerHTML = `<p class="editor-empty-hint">${S.noTags}</p>`;
      return;
    }
    tagListEl.innerHTML = allTags
      .map(
        (tag) => `
      <button type="button" class="editor-tag-chip ${selectedTagIds.has(tag.id) ? 'selected' : ''}" data-id="${tag.id}">
        ${escapeHtml(tag.name)}
      </button>
    `
      )
      .join('');
  }

  function renderImages() {
    const items = images
      .map((item, index) => {
        const src = item.preview || '';
        return `
        <div class="editor-image-item" draggable="true" data-index="${index}" data-id="${item.id}">
          <div class="editor-image-thumb">
            ${
              item.uploading
                ? `<div class="editor-image-loading">${S.uploading}</div>`
                : `<img src="${escapeHtml(src)}" alt="" />`
            }
            ${index === 0 && images.length > 0 ? `<span class="editor-cover-badge">${S.cover}</span>` : ''}
            <button type="button" class="editor-image-remove" data-id="${item.id}">&times;</button>
          </div>
        </div>
      `;
      })
      .join('');

    imageListEl.innerHTML = `
      ${items}
      <button type="button" class="editor-image-add" id="image-add-btn">${icons.plus}</button>
    `;
  }

  async function loadTags(keyword = '') {
    try {
      allTags = await api.getTags(keyword);
      renderTags();
    } catch (e) {
      tagListEl.innerHTML = `<p class="editor-empty-hint error-text">${escapeHtml(e.message)}</p>`;
    }
  }

  async function uploadImageItem(item, file) {
    item.uploading = true;
    renderImages();
    try {
      const res = await api.uploadImage(file);
      item.url = res.url;
      item.preview = imgUrl(res.url);
      item.uploading = false;
    } catch (e) {
      images = images.filter((img) => img.id !== item.id);
      showError(e.message);
    }
    renderImages();
  }

  function addImageFile(file) {
    if (!file) return;
    const item = {
      id: nextImageId(),
      url: null,
      preview: URL.createObjectURL(file),
      file,
      uploading: true,
    };
    images.push(item);
    renderImages();
    uploadImageItem(item, file);
  }

  async function handlePublish(btn) {
    clearError();
    const seedName = container.querySelector('#editor-title').value.trim();
    const content = container.querySelector('#editor-content').value.trim();
    if (!seedName) {
      showError(S.titleRequired);
      return;
    }
    if (images.some((img) => img.uploading)) {
      showError(S.uploading);
      return;
    }
    const imageUrls = images.map((img) => img.url).filter(Boolean);
    const varietyIds = [...selectedTagIds];
    btn.disabled = true;
    const mobileBtn = container.querySelector('#editor-publish-mobile');
    const desktopBtn = container.querySelector('#editor-publish');
    if (mobileBtn) mobileBtn.disabled = true;
    if (desktopBtn) desktopBtn.disabled = true;
    try {
      if (isEdit) {
        await api.updatePost(post.id, {
          seedName,
          content,
          getUrl: post.getUrl || '',
          imageUrls,
          varietyIds,
        });
        window.location.hash = '';
        setState({ route: null, view: 'myplant' });
      } else {
        await api.createPost({
          seedName,
          content,
          getUrl: '',
          imageUrls,
          varietyIds,
        });
        window.location.hash = '';
        setState({ route: null, view: 'myplant' });
      }
    } catch (e) {
      showError(e.message);
    } finally {
      btn.disabled = false;
      if (mobileBtn) mobileBtn.disabled = false;
      if (desktopBtn) desktopBtn.disabled = false;
    }
  }

  tagSearchEl?.addEventListener('input', (e) => {
    clearTimeout(tagSearchTimer);
    tagSearchTimer = setTimeout(() => loadTags(e.target.value), 300);
  });

  tagListEl?.addEventListener('click', (e) => {
    const chip = e.target.closest('.editor-tag-chip');
    if (!chip) return;
    const id = Number(chip.dataset.id);
    if (selectedTagIds.has(id)) {
      selectedTagIds.delete(id);
    } else {
      selectedTagIds.add(id);
    }
    renderTags();
  });

  container.querySelector('#tag-add-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    overlay.hidden = false;
    const input = container.querySelector('#new-tag-input');
    const err = container.querySelector('#new-tag-error');
    input.value = '';
    err.hidden = true;
    input.focus();
  });

  container.querySelector('#new-tag-close')?.addEventListener('click', (e) => {
    e.stopPropagation();
    overlay.hidden = true;
  });

  container.querySelector('.tag-modal')?.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  overlay?.addEventListener('click', () => {
    overlay.hidden = true;
  });

  container.querySelector('#new-tag-confirm')?.addEventListener('click', async () => {
    const input = container.querySelector('#new-tag-input');
    const err = container.querySelector('#new-tag-error');
    const name = input.value.trim();
    if (!name) {
      err.textContent = S.tagNamePlaceholder;
      err.hidden = false;
      return;
    }
    err.hidden = true;
    const btn = container.querySelector('#new-tag-confirm');
    btn.disabled = true;
    try {
      await api.createTags([name]);
      overlay.hidden = true;
      await loadTags(tagSearchEl.value);
      const created = allTags.find((t) => t.name === name);
      if (created) selectedTagIds.add(created.id);
      renderTags();
    } catch (e) {
      err.textContent = e.message;
      err.hidden = false;
    } finally {
      btn.disabled = false;
    }
  });

  imageListEl?.addEventListener('click', (e) => {
    if (e.target.closest('#image-add-btn')) {
      fileInput.click();
      return;
    }
    const removeBtn = e.target.closest('.editor-image-remove');
    if (removeBtn) {
      const id = removeBtn.dataset.id;
      images = images.filter((img) => img.id !== id);
      renderImages();
    }
  });

  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) addImageFile(file);
    fileInput.value = '';
  });

  imageListEl?.addEventListener('dragstart', (e) => {
    const item = e.target.closest('.editor-image-item');
    if (!item) return;
    dragFromIndex = Number(item.dataset.index);
    item.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });

  imageListEl?.addEventListener('dragend', (e) => {
    e.target.closest('.editor-image-item')?.classList.remove('dragging');
    dragFromIndex = null;
  });

  imageListEl?.addEventListener('dragover', (e) => {
    e.preventDefault();
    const item = e.target.closest('.editor-image-item');
    if (!item) return;
    e.dataTransfer.dropEffect = 'move';
    imageListEl.querySelectorAll('.editor-image-item').forEach((el) => el.classList.remove('drag-over'));
    item.classList.add('drag-over');
  });

  imageListEl?.addEventListener('dragleave', (e) => {
    e.target.closest('.editor-image-item')?.classList.remove('drag-over');
  });

  imageListEl?.addEventListener('drop', (e) => {
    e.preventDefault();
    const item = e.target.closest('.editor-image-item');
    if (!item || dragFromIndex === null) return;
    const toIndex = Number(item.dataset.index);
    if (dragFromIndex === toIndex) return;
    const [moved] = images.splice(dragFromIndex, 1);
    images.splice(toIndex, 0, moved);
    dragFromIndex = null;
    renderImages();
  });

  container.querySelector('#editor-home')?.addEventListener('click', () => {
    window.location.hash = '';
    setState({ route: null, view: 'garden' });
  });

  container.querySelector('#editor-delete')?.addEventListener('click', async () => {
    if (!confirm(S.confirmDelete)) return;
    clearError();
    try {
      await api.deletePost(post.id);
      setState({ route: null, view: 'myplant' });
    } catch (e) {
      showError(e.message);
    }
  });

  container.querySelector('#editor-publish')?.addEventListener('click', async (e) => {
    await handlePublish(e.currentTarget);
  });

  container.querySelector('#editor-publish-mobile')?.addEventListener('click', async (e) => {
    await handlePublish(e.currentTarget);
  });

  loadTags();
  renderImages();
}
