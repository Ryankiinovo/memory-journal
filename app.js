const layoutNames = ['左图右文', '左文右图', '上图下文', '整页大图', '双图 + 下方文字', '大图 + 小图 + 文字', '纯文字页', '全屏照片'];

const CONTENT = window.MEMORY_JOURNAL || {};
const SITE = CONTENT.site || {};
const uploadPhotos = CONTENT.photos || [];

const pages = CONTENT.pages || [];

let currentPage = 3;
let readerCurrentPage = currentPage;
let currentSlide = 0;
let readerOrigin = 'editor';
let slideshowOrigin = 'editor';
let confirmCallback = null;
let autoTimer = null;
let readerTimer = null;
let slideTransitionTimer = null;
let lastFocused = null;
let uploadReturnScreen = 'city';
let readerScrollLocked = false;
let readerUserNavigating = false;
let playInterval = 5;
let playTransition = 'fade';
let autoMode = false;
let draftStory = null;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
}
function nl2br(value) { return escapeHTML(value).replace(/\n/g, '<br>'); }
function padPage(n) { return String(n + 1).padStart(2, '0'); }
function pagePhoto(page, slot = 0) {
  const index = page.photos[slot] ?? page.photos[0];
  return uploadPhotos[index] || uploadPhotos[0];
}
function setImage(el, photo) {
  if (!el || !photo) return;
  el.src = photo[0];
  el.width = photo[1];
  el.height = photo[2];
  el.alt = photo[3];
}

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
  const target = document.getElementById('screen-' + name);
  if (target) target.classList.add('active');
  document.body.classList.toggle('reader-open', name === 'reader');
  closeMenus();
  hideSearch();
  if (name === 'reader') {
    readerScrollLocked = true;
    readerUserNavigating = false;
    readerCurrentPage = Math.max(0, Math.min(pages.length - 1, readerCurrentPage));
    currentPage = readerCurrentPage;
    document.getElementById('reader-back').textContent = readerOrigin === 'editor' ? '← 返回编辑' : '← 返回' + (SITE.city || '');
    renderReaderPages();
    updateCounts();
    armReaderBar();
    requestAnimationFrame(() => {
      const page = document.querySelector('[data-reader-index="' + readerCurrentPage + '"]');
      window.scrollTo({ top: page ? Math.max(0, page.offsetTop - 14) : 0, behavior: 'auto' });
      setTimeout(() => { readerScrollLocked = false; }, reducedMotion.matches ? 20 : 340);
    });
  } else {
    readerScrollLocked = false;
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (name === 'editor') { renderPages(); renderCurrentPage(); }
    if (name === 'library' || name === 'city') updateCounts();
  }
}

function openReaderAt(index = currentPage) {
  const active = document.querySelector('.screen.active');
  const origin = active ? active.id.replace('screen-', '') : 'editor';
  if (origin !== 'reader' && origin !== 'slideshow') readerOrigin = origin;
  readerCurrentPage = Math.max(0, Math.min(pages.length - 1, index));
  currentPage = readerCurrentPage;
  showScreen('reader');
}
function exitReader() { showScreen(readerOrigin === 'reader' ? 'city' : readerOrigin); }
function openEditorAt(index = currentPage) {
  if (window.innerWidth < 900) { toast('编辑界面需要更宽的窗口（≥900px）'); return; }
  currentPage = Math.max(0, Math.min(pages.length - 1, index));
  showScreen('editor');
}
function openSlideshowAt(index = currentPage) { currentPage = Math.max(0, Math.min(pages.length - 1, index)); openSlideshow(); }

function openCreateFlow() {
  document.getElementById('new-city').value = '';
  showCreateStep('city');
  openModal('create-modal');
}
function showCreateStep(step) {
  const isCity = step === 'city';
  document.getElementById('create-city-step').hidden = !isCity;
  document.getElementById('create-story-step').hidden = isCity;
  if (!isCity) document.getElementById('create-city-label').textContent = document.getElementById('new-city').value.trim() || (SITE.city || '天津');
  requestAnimationFrame(() => document.querySelector(isCity ? '#create-city-step button' : '#album-title')?.focus());
}
function createStoryAndUpload() {
  const city = document.getElementById('new-city').value.trim() || (SITE.city || '天津');
  const story = document.getElementById('album-title').value.trim() || '未命名故事';
  draftStory = { city, story };
  uploadReturnScreen = city === (SITE.city || '天津') ? 'city' : 'library';
  document.getElementById('upload-crumb').textContent = '城市记忆 / ' + city + ' / ' + story;
  document.getElementById('upload-back').textContent = city === (SITE.city || '天津') ? '← 返回' + (SITE.city || '') : '← 返回城市记忆';
  document.getElementById('upload-footer-back').textContent = city === (SITE.city || '天津') ? '返回' + (SITE.city || '') : '返回城市记忆';
  closeModal('create-modal');
  document.getElementById('selection-area').hidden = true;
  document.getElementById('dropzone').style.display = '';
  showScreen('upload');
}
function returnFromUpload() { showScreen(uploadReturnScreen); }

function selectDemoPhotos() {
  document.getElementById('selection-area').hidden = false;
  const countEl = document.getElementById('upload-count');
  if (countEl) countEl.textContent = String(uploadPhotos.length);
  document.getElementById('dropzone').style.display = 'none';
  renderUploadThumbs();
}
function renderUploadThumbs() {
  document.getElementById('upload-thumbs').innerHTML = uploadPhotos.map((photo, i) =>
    '<div class="upload-thumb" data-index="' + String(i + 1).padStart(2, '0') + '"><img src="' + photo[0] + '" width="' + photo[1] + '" height="' + photo[2] + '" alt="' + escapeHTML(photo[3]) + '" loading="lazy" decoding="async" /></div>'
  ).join('');
}
function createPagesFromDemo() {
  const label = draftStory && draftStory.city && draftStory.city !== '天津' ? '（演示版内置' + (SITE.city || '') + '故事）' : '';
  toast('示例页面已载入编辑器' + label);
  openEditorAt(0);
}

function openModal(id) {
  lastFocused = document.activeElement;
  closeMenus();
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add('open');
  setTimeout(() => modal.querySelector('input, textarea, button')?.focus(), 30);
}
function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove('open');
  lastFocused?.focus?.();
}
function openConfirm(title, copy, cb, actionLabel = '确认删除') {
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-copy').textContent = copy;
  document.getElementById('confirm-modal').querySelector('.btn-primary').textContent = actionLabel;
  confirmCallback = cb;
  openModal('confirm-modal');
}
function confirmAction() {
  closeModal('confirm-modal');
  if (confirmCallback) confirmCallback();
  confirmCallback = null;
}
function toast(message) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('show'), 2100);
}
function closeMenus() { document.querySelectorAll('.menu.open').forEach(m => m.classList.remove('open')); }

function renderPages() {
  document.getElementById('page-list').innerHTML = pages.map((page, i) => {
    const photo = pagePhoto(page);
    return '<div class="page-item ' + (i === currentPage ? 'selected' : '') + '" data-page-index="' + i + '" draggable="true" tabindex="0" role="button" aria-label="切换到第 ' + (i + 1) + ' 页：' + escapeHTML(page.title) + '" onclick="selectPage(' + i + ')">' +
      '<span class="page-num">' + padPage(i) + '</span>' +
      '<div class="mini-page"><img class="mini-photo" src="' + photo[0] + '" width="' + photo[1] + '" height="' + photo[2] + '" alt="" loading="lazy" decoding="async" /><span class="mini-copy"></span></div>' +
      '<span class="page-label">' + escapeHTML(page.title) + '</span>' +
      '<button class="icon-btn page-more" type="button" onclick="event.stopPropagation(); openPageMenu(' + i + ', this)" aria-label="页面操作">···</button></div>';
  }).join('');
}
function renderLayouts() {
  document.querySelector('.layout-grid').innerHTML = layoutNames.map((name, i) =>
    '<button class="layout-choice" type="button" data-layout="' + (i + 1) + '" onclick="applyLayout(' + (i + 1) + ')"><span class="layout-icon"><span></span><span></span></span><small>' + String(i + 1).padStart(2, '0') + ' · ' + name + '</small></button>'
  ).join('');
}
function renderCurrentPage() {
  const page = pages[currentPage];
  if (!page) return;
  const photo = pagePhoto(page);
  setImage(document.getElementById('story-image'), photo);
  setImage(document.getElementById('story-image-secondary'), pagePhoto(page, 1));
  document.getElementById('page-position').textContent = '页面 ' + padPage(currentPage) + ' · 16:9';
  document.getElementById('editor-crumb-page').textContent = '页面 ' + padPage(currentPage);
  document.getElementById('canvas-title').textContent = page.title;
  document.getElementById('essay-text').textContent = page.essay;
  document.getElementById('canvas-place').textContent = page.place;
  document.getElementById('canvas-date').textContent = page.date;
  document.getElementById('canvas-time').textContent = page.time;
  document.getElementById('canvas-foot-place').textContent = page.place;
  document.getElementById('inspector-photo-name').textContent = photo[3];
  document.getElementById('inspector-page-title').textContent = page.title;
  document.getElementById('note').value = page.note;
  applyLayout(page.layout, false);
  updateCounts();
}
function animateCanvas() {
  const canvas = document.getElementById('canvas');
  canvas.getAnimations?.().forEach(animation => animation.cancel());
  if (reducedMotion.matches || !canvas.animate) return;
  canvas.animate([{ opacity: .35, transform: 'translateX(6px)' }, { opacity: 1, transform: 'none' }], { duration: 180, easing: 'cubic-bezier(.2,.8,.2,1)' });
}
function selectPage(i) {
  currentPage = Math.max(0, Math.min(pages.length - 1, i));
  renderPages();
  renderCurrentPage();
  animateCanvas();
  toast('已切换到第 ' + padPage(currentPage) + ' 页');
}
function addPage() {
  const base = pages[currentPage];
  pages.push({ title: '未命名页面', essay: '在这里写下这一页的故事。', date: base.date, time: base.time, place: base.place, layout: 1, photos: [base.photos[0], base.photos[1]], note: '' });
  currentPage = pages.length - 1;
  renderPages(); renderCurrentPage(); renderReaderPages(); toast('已新增页面');
}
function openPageMenu(i, trigger) {
  let menu = document.getElementById('page-menu');
  if (!menu) {
    menu = document.createElement('div');
    menu.id = 'page-menu';
    menu.className = 'menu';
    menu.innerHTML = '<button type="button" onclick="duplicatePage()">复制页面</button><button type="button" onclick="insertPage()">在后方新建页面</button><button type="button" class="danger" onclick="deletePagePrompt()">删除页面</button>';
    document.body.appendChild(menu);
  }
  currentPage = Math.max(0, Math.min(pages.length - 1, i));
  renderPages(); renderCurrentPage();
  const r = trigger.getBoundingClientRect();
  menu.style.left = Math.max(8, Math.min(r.right + 4, window.innerWidth - 180)) + 'px';
  menu.style.top = Math.max(8, Math.min(r.top, window.innerHeight - 150)) + 'px';
  menu.classList.add('open');
}
function duplicatePage() {
  const copy = JSON.parse(JSON.stringify(pages[currentPage]));
  copy.title += ' · 副本';
  pages.splice(currentPage + 1, 0, copy);
  currentPage++;
  renderPages(); renderCurrentPage(); renderReaderPages(); closeMenus(); toast('页面已复制');
}
function insertPage() {
  const base = pages[currentPage];
  pages.splice(currentPage + 1, 0, { title: '未命名页面', essay: '在这里写下这一页的故事。', date: base.date, time: base.time, place: base.place, layout: 1, photos: [base.photos[0], base.photos[1]], note: '' });
  currentPage++;
  renderPages(); renderCurrentPage(); renderReaderPages(); closeMenus(); toast('已在后方新建页面');
}
function deletePagePrompt() {
  closeMenus();
  if (pages.length <= 1) { toast('至少保留一个页面'); return; }
  openConfirm('删除这个页面？', '“' + pages[currentPage].title + '”将从相册中移除，删除后无法恢复。', () => {
    pages.splice(currentPage, 1);
    currentPage = Math.max(0, currentPage - 1);
    renderPages(); renderCurrentPage(); renderReaderPages(); toast('页面已删除');
  });
}
function applyLayout(n, notify = true) {
  if (pages[currentPage]) pages[currentPage].layout = n;
  document.getElementById('canvas').className = 'canvas layout-' + n;
  document.querySelectorAll('.layout-choice').forEach(button => button.classList.toggle('selected', Number(button.dataset.layout) === n));
  if (notify) { renderReaderPages(); animateCanvas(); toast('已应用“' + layoutNames[n - 1] + '”'); }
}
function switchInspector(panel) {
  document.querySelectorAll('.inspector-tab').forEach(button => button.classList.toggle('active', button.dataset.panel === panel));
  document.querySelectorAll('.inspector-view').forEach(view => view.classList.toggle('active', view.id === 'inspector-' + panel));
}
function selectBlock(type, el) {
  document.querySelectorAll('.selected-block').forEach(block => block.classList.remove('selected-block'));
  el.classList.add('selected-block');
  switchInspector(type);
}
function addEssay() {
  const addition = '有些路段没有被拍下来，但我记得树影移动的方向，也记得我们停下来时那阵很轻的风。';
  pages[currentPage].essay = pages[currentPage].essay + '\n\n' + addition;
  renderCurrentPage();
  renderReaderPages();
  closeModal('add-content-modal');
  switchInspector('text');
  toast('随笔已加入当前页面');
}

function renderReaderPages() {
  document.getElementById('reader-pages').innerHTML = pages.map((page, i) => {
    if (page.layout === 7) {
      return '<article class="reader-page chapter" data-reader-index="' + i + '" aria-label="' + escapeHTML(page.title) + '">' +
        '<div class="chapter-inner"><p class="meta">' + padPage(i) + ' · ' + escapeHTML(page.place) + '</p>' +
        '<h2>' + escapeHTML(page.title) + '</h2><p>' + nl2br(page.essay) + '</p></div></article>';
    }
    const photo = pagePhoto(page);
    const secondary = pagePhoto(page, 1);
    return '<article class="reader-page canvas layout-' + page.layout + '" data-reader-index="' + i + '" aria-label="' + escapeHTML(page.title) + '">' +
      '<div class="canvas-photo"><img class="story-img" src="' + photo[0] + '" width="' + photo[1] + '" height="' + photo[2] + '" alt="' + escapeHTML(photo[3]) + '" loading="' + (i === 0 ? 'eager' : 'lazy') + '" decoding="async" />' +
      '<img class="story-img secondary" src="' + secondary[0] + '" width="' + secondary[1] + '" height="' + secondary[2] + '" alt="' + escapeHTML(secondary[3]) + '" loading="lazy" decoding="async" /></div>' +
      '<div class="canvas-copy"><div class="canvas-meta"><span>' + escapeHTML(page.place) + '</span><span>' + escapeHTML(page.date) + '</span></div>' +
      '<h2>' + escapeHTML(page.title) + '</h2><p class="essay">' + nl2br(page.essay) + '</p><p class="canvas-foot">' + escapeHTML(page.time) + '　' + escapeHTML(page.place) + '</p></div></article>';
  }).join('');
}
function updateCounts() {
  const albumMeta = document.getElementById('primary-album-meta');
  if (albumMeta) albumMeta.textContent = pages.length + ' 页 · ' + uploadPhotos.length + ' 张照片 · 刚刚编辑';
  const cityMeta = document.getElementById('city-memory-meta');
  if (cityMeta) cityMeta.textContent = '1 个故事 · ' + uploadPhotos.length + ' 张照片 · 刚刚编辑';
  const readerCount = document.getElementById('reader-count');
  if (readerCount) readerCount.textContent = padPage(readerCurrentPage) + ' / ' + String(pages.length).padStart(2, '0');
  const slideCount = document.getElementById('slide-count');
  if (slideCount) slideCount.textContent = padPage(Math.min(currentSlide, pages.length - 1)) + ' / ' + String(pages.length).padStart(2, '0');
}
function readerGo(delta) {
  const next = Math.max(0, Math.min(pages.length - 1, readerCurrentPage + delta));
  if (next === readerCurrentPage) return;
  readerCurrentPage = next;
  currentPage = next;
  const page = document.querySelector('[data-reader-index="' + next + '"]');
  if (page) {
    readerScrollLocked = true;
    window.scrollTo({ top: Math.max(0, page.offsetTop - 14), behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    setTimeout(() => { readerScrollLocked = false; updateReaderFromScroll(); }, reducedMotion.matches ? 30 : 440);
  }
  updateCounts();
  armReaderBar();
}
function updateReaderFromScroll() {
  if (readerScrollLocked || !document.getElementById('screen-reader').classList.contains('active')) return;
  const center = window.innerHeight / 2;
  const readerPages = Array.from(document.querySelectorAll('[data-reader-index]'));
  if (!readerPages.length) return;
  const nearest = readerPages.reduce((best, el) => Math.abs(el.getBoundingClientRect().top + el.offsetHeight / 2 - center) < Math.abs(best.getBoundingClientRect().top + best.offsetHeight / 2 - center) ? el : best);
  readerCurrentPage = Number(nearest.dataset.readerIndex);
  currentPage = readerCurrentPage;
  updateCounts();
  armReaderBar();
}
function armReaderBar() {
  const bar = document.getElementById('reader-bar');
  bar.classList.remove('hidden');
  clearTimeout(readerTimer);
  readerTimer = setTimeout(() => bar.classList.add('hidden'), 5000);
}

function buildSlide() {
  const stage = document.getElementById('slide-stage');
  const page = pages[currentSlide];
  if (!page) return;
  if (page.layout === 7) {
    stage.className = 'slide-stage chapter';
    stage.innerHTML = '<div class="chapter-inner"><p class="meta">' + padPage(currentSlide) + ' · ' + escapeHTML(page.place) + '</p><h2>' + escapeHTML(page.title) + '</h2><p>' + nl2br(page.essay) + '</p></div>';
  } else {
    const photo = pagePhoto(page);
    const secondary = pagePhoto(page, 1);
    stage.className = 'slide-stage canvas layout-' + page.layout;
    stage.innerHTML = '<div class="canvas-photo"><img class="story-img" src="' + photo[0] + '" width="' + photo[1] + '" height="' + photo[2] + '" alt="' + escapeHTML(photo[3]) + '" /><img class="story-img secondary" src="' + secondary[0] + '" width="' + secondary[1] + '" height="' + secondary[2] + '" alt="' + escapeHTML(secondary[3]) + '" /></div>' +
      '<div class="canvas-copy"><div class="canvas-meta"><span>' + escapeHTML(page.place) + '</span><span>' + escapeHTML(page.date) + '</span></div><h2>' + escapeHTML(page.title) + '</h2><p class="essay">' + nl2br(page.essay) + '</p><p class="canvas-foot">' + escapeHTML(page.time) + '　' + escapeHTML(page.place) + '</p></div>';
  }
  updateCounts();
}
function openSlideshow() {
  const active = document.querySelector('.screen.active');
  slideshowOrigin = active ? active.id.replace('screen-', '') : 'editor';
  const sourcePage = slideshowOrigin === 'reader' ? readerCurrentPage : currentPage;
  currentSlide = sourcePage < pages.length ? sourcePage : 0;
  buildSlide();
  showScreen('slideshow');
}
function exitSlideshow() {
  stopAutoplay();
  clearTimeout(slideTransitionTimer);
  slideTransitionTimer = null;
  currentPage = currentSlide;
  if (slideshowOrigin === 'reader') readerCurrentPage = currentSlide;
  showScreen(slideshowOrigin === 'slideshow' ? 'editor' : slideshowOrigin);
}
function changeSlide(delta) {
  const stage = document.getElementById('slide-stage');
  const duration = reducedMotion.matches || playTransition === 'none' ? 0 : 120;
  clearTimeout(slideTransitionTimer);
  stage.classList.remove('fading');
  void stage.offsetWidth;
  if (duration) stage.classList.add('fading');
  slideTransitionTimer = setTimeout(() => {
    currentSlide = (currentSlide + delta + pages.length) % pages.length;
    currentPage = currentSlide;
    if (slideshowOrigin === 'reader') readerCurrentPage = currentSlide;
    buildSlide();
    stage.classList.remove('fading');
    slideTransitionTimer = null;
  }, duration);
}
function startAutoplay() {
  stopAutoplay();
  autoMode = true;
  updatePlayModeUI();
  autoTimer = setInterval(() => changeSlide(1), playInterval * 1000);
  document.getElementById('autoplay-btn').textContent = 'Ⅱ';
}
function stopAutoplay() {
  if (autoTimer) clearInterval(autoTimer);
  autoTimer = null;
  autoMode = false;
  updatePlayModeUI();
  document.getElementById('autoplay-btn').textContent = '▶';
}
function toggleAutoplay() { if (autoTimer) stopAutoplay(); else startAutoplay(); }
function updatePlayModeUI() {
  document.querySelectorAll('#play-mode button').forEach(button => button.classList.toggle('selected', button.dataset.mode === (autoMode ? 'auto' : 'manual')));
}
function togglePlaySettings() { document.getElementById('play-settings').classList.toggle('open'); }
function toggleFullscreen() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
  else document.exitFullscreen?.();
}

function openPhotoPicker() {
  closeModal('add-content-modal');
  const page = pages[currentPage];
  document.getElementById('photo-picker-grid').innerHTML = uploadPhotos.map((photo, i) =>
    '<button class="photo-pick ' + (i === page.photos[0] ? 'selected' : '') + '" type="button" data-photo-index="' + i + '" onclick="choosePhoto(' + i + ')" aria-label="选择：' + escapeHTML(photo[3]) + '"><img src="' + photo[0] + '" width="' + photo[1] + '" height="' + photo[2] + '" alt="' + escapeHTML(photo[3]) + '" loading="lazy" decoding="async" /><span>' + String(i + 1).padStart(2, '0') + '</span></button>'
  ).join('');
  openModal('photo-picker');
}
function choosePhoto(index) {
  if (!pages[currentPage]) return;
  pages[currentPage].photos[0] = index;
  renderPages();
  renderCurrentPage();
  renderReaderPages();
  closeModal('photo-picker');
  toast('已替换当前页面的主图');
}

function renderSearch() {
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  const query = input.value.trim().toLowerCase();
  if (!query) { hideSearch(); return; }
  const hits = pages.map((page, index) => ({ page, index })).filter(({ page }) =>
    [page.title, page.essay, page.place, page.date].join(' ').toLowerCase().includes(query)
  ).slice(0, 6);
  results.innerHTML = hits.length
    ? hits.map(({ page, index }) => '<button class="search-result" type="button" role="option" data-index="' + index + '" onclick="openSearchResult(' + index + ')"><strong>' + escapeHTML(page.title) + '</strong><small>' + padPage(index) + ' · ' + escapeHTML(page.place) + ' · ' + escapeHTML(page.date) + '</small></button>').join('')
    : '<div class="search-empty">没有找到“' + escapeHTML(input.value.trim()) + '”</div>';
  results.hidden = false;
  input.setAttribute('aria-expanded', 'true');
}
function hideSearch() {
  const results = document.getElementById('search-results');
  const input = document.getElementById('search-input');
  if (!results || !input) return;
  results.hidden = true;
  results.innerHTML = '';
  input.setAttribute('aria-expanded', 'false');
}
function openSearchResult(index) {
  const input = document.getElementById('search-input');
  input.value = '';
  hideSearch();
  openReaderAt(index);
}

function bindEvents() {
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', renderSearch);
  searchInput.addEventListener('focus', () => { if (searchInput.value.trim()) renderSearch(); });
  searchInput.addEventListener('keydown', event => {
    if (event.key === 'Escape') { searchInput.blur(); hideSearch(); }
    if (event.key === 'Enter') { const first = document.querySelector('.search-result'); if (first) first.click(); }
  });
  document.addEventListener('click', event => { if (!event.target.closest('.search-wrap')) hideSearch(); });

  document.getElementById('album-title')?.addEventListener('keydown', event => { if (event.key === 'Enter') createStoryAndUpload(); });
  document.querySelectorAll('.overlay').forEach(overlay => {
    overlay.addEventListener('click', event => { if (event.target === overlay && overlay.id !== 'confirm-modal') closeModal(overlay.id); });
  });

  document.getElementById('page-list').addEventListener('dragstart', event => {
    const item = event.target.closest('.page-item');
    if (item) event.dataTransfer.setData('text/plain', item.dataset.pageIndex);
  });
  document.getElementById('page-list').addEventListener('dragover', event => event.preventDefault());
  document.getElementById('page-list').addEventListener('drop', event => {
    event.preventDefault();
    const item = event.target.closest('.page-item');
    if (!item) return;
    const from = Number(event.dataTransfer.getData('text/plain'));
    const to = Number(item.dataset.pageIndex);
    if (Number.isNaN(from) || Number.isNaN(to) || from === to || from < 0 || to < 0) return;
    const moved = pages.splice(from, 1)[0];
    pages.splice(to, 0, moved);
    currentPage = to;
    renderPages(); renderCurrentPage(); renderReaderPages(); toast('页面顺序已更新');
  });

  document.getElementById('canvas-title').addEventListener('input', event => {
    pages[currentPage].title = event.currentTarget.textContent.trim() || '未命名页面';
    renderPages(); renderReaderPages();
  });
  document.getElementById('essay-text').addEventListener('input', event => {
    pages[currentPage].essay = event.currentTarget.innerText;
    renderReaderPages();
  });
  document.getElementById('note').addEventListener('input', event => {
    pages[currentPage].note = event.currentTarget.value;
  });

  document.querySelectorAll('.segmented').forEach(group => group.addEventListener('click', event => {
    if (event.target.tagName !== 'BUTTON') return;
    group.querySelectorAll('button').forEach(button => button.classList.remove('selected'));
    event.target.classList.add('selected');
  }));
  document.getElementById('play-mode').addEventListener('click', event => {
    if (event.target.tagName !== 'BUTTON') return;
    if (event.target.dataset.mode === 'auto') startAutoplay();
    else stopAutoplay();
  });
  document.getElementById('play-interval').addEventListener('change', event => {
    playInterval = Number(event.target.value) || 5;
    if (autoTimer) startAutoplay();
  });
  document.getElementById('play-transition').addEventListener('change', event => { playTransition = event.target.value; });

  const dropzone = document.getElementById('dropzone');
  dropzone.addEventListener('dragover', event => { event.preventDefault(); dropzone.classList.add('drag'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag'));
  dropzone.addEventListener('drop', event => { event.preventDefault(); dropzone.classList.remove('drag'); selectDemoPhotos(); });

  window.addEventListener('wheel', () => { if (document.getElementById('screen-reader').classList.contains('active')) readerUserNavigating = true; }, { passive: true });
  let readerScrollFrame = null;
  window.addEventListener('scroll', () => {
    if (readerScrollFrame) return;
    readerScrollFrame = requestAnimationFrame(() => { readerScrollFrame = null; updateReaderFromScroll(); });
  }, { passive: true });
  document.addEventListener('mousemove', () => { if (document.getElementById('screen-reader').classList.contains('active')) armReaderBar(); });
  document.addEventListener('touchstart', () => { if (document.getElementById('screen-reader').classList.contains('active')) armReaderBar(); }, { passive: true });
  document.addEventListener('click', event => { if (!event.target.closest('.menu') && !event.target.closest('[onclick*="openPageMenu"]')) closeMenus(); });

  document.addEventListener('keydown', event => {
    const typing = event.target.matches('input, textarea, [contenteditable="true"]');
    if (document.getElementById('screen-slideshow').classList.contains('active')) {
      if (event.key === 'Escape') { event.preventDefault(); exitSlideshow(); }
      else if (event.key === 'ArrowRight' || event.key === ' ') { event.preventDefault(); changeSlide(1); }
      else if (event.key === 'ArrowLeft') { event.preventDefault(); changeSlide(-1); }
      return;
    }
    if (document.getElementById('screen-reader').classList.contains('active') && !typing) {
      if (event.key === 'Escape') exitReader();
      else if (event.key === 'ArrowRight' || event.key === 'ArrowDown' || event.key === 'PageDown') { event.preventDefault(); readerUserNavigating = true; readerGo(1); }
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp' || event.key === 'PageUp') { event.preventDefault(); readerUserNavigating = true; readerGo(-1); }
      return;
    }
    if (event.key === 'Escape') {
      const open = document.querySelector('.overlay.open');
      if (open) { event.preventDefault(); closeModal(open.id); }
    }
  });
}

function applySiteContent() {
  const S = SITE || {};
  const setText = (id, v) => { const el = document.getElementById(id); if (el && v != null) el.textContent = v; };
  const n = uploadPhotos.length;
  const heroPhoto = uploadPhotos[(CONTENT.heroPhoto | 0)] || uploadPhotos[0];
  const heroImg = document.getElementById('hero-image');
  const featureImg = document.getElementById('story-feature-image');
  if (heroPhoto) { if (heroImg) setImage(heroImg, heroPhoto); if (featureImg) setImage(featureImg, heroPhoto); }
  document.title = (S.brand || '记忆随笔') + ' · ' + (S.subtitle || '影像随笔相册');
  setText('hero-city', S.city);
  setText('city-title', S.city);
  setText('crumb-city', S.city);
  setText('city-summary', S.citySummary);
  setText('story-title', S.storyTitle);
  setText('story-summary', S.storySummary);
  setText('library-note', S.libraryNote);
  setText('footer-city', (S.city || '') + ' · ' + (S.season || ''));
  setText('library-count', '照片 ' + n + ' · 故事 ' + pages.length + ' 页 · ' + (S.season || ''));
  setText('city-meta', '1 个故事 · ' + n + ' 张照片');
  setText('create-city-name', S.city);
  setText('create-city-meta', '已有 1 个故事，' + n + ' 张照片');
  setText('create-city-label', S.city);
  setText('upload-back', '← 返回' + (S.city || ''));
  setText('upload-footer-back', '返回' + (S.city || ''));
  setText('upload-crumb', '城市记忆 / ' + (S.city || '') + ' / ' + (S.storyTitle || ''));
  setText('demo-note', '示例流程 · 使用 ' + n + ' 张示例照片 · 不会上传');
  setText('editor-back', '← ' + (S.city || ''));
  setText('photo-picker-intro', '从这 ' + n + ' 张示例照片中选择一张，作为当前页面的主图。');
  const crumb = document.getElementById('editor-crumb');
  if (crumb) crumb.innerHTML = '城市记忆 / ' + (S.city || '') + ' / ' + (S.storyTitle || '') + ' / <span id="editor-crumb-page">页面 ' + padPage(currentPage) + '</span>';
  const titleInput = document.getElementById('album-title');
  if (titleInput && S.storyTitle) titleInput.value = S.storyTitle;
  const subInput = document.getElementById('album-subtitle');
  if (subInput && S.storySubtitle) subInput.value = S.storySubtitle;
  const list = document.getElementById('chapter-list');
  if (list && Array.isArray(S.chapters)) list.innerHTML = S.chapters.map(c => '<button class="chapter-row" type="button" onclick="openReaderAt(' + (c.page | 0) + ')"><span>' + escapeHTML(c.label) + '</span><strong>' + escapeHTML(c.title) + '</strong><small>' + escapeHTML(c.note || '') + '</small></button>').join('');
  const media = document.querySelector('.story-feature-media');
  if (media && S.storyTitle) media.setAttribute('aria-label', '阅读' + S.storyTitle);
}

applySiteContent();
renderUploadThumbs();
renderLayouts();
renderPages();
renderCurrentPage();
renderReaderPages();
buildSlide();
bindEvents();