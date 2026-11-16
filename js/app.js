import { seed } from './data/seed.js?v=20261116-6';
import { images } from './data/images.js?v=20261116-6';
import { createRepository } from './storage/repository.js?v=20261116-6';
import { validateBackup } from './data/schema.js?v=20261116-6';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escape = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const types = { main: 'Lịch chính', optional: 'Optional', food: 'Ăn uống', coffee: 'Cà phê', transport: 'Di chuyển', hotel: 'Khách sạn', backup: 'Dự phòng' };
const categories = { nature: 'Thiên nhiên', coffee: 'Cà phê', architecture: 'Kiến trúc', city: 'Thành phố', 'check-in': 'Check-in', food: 'Ăn uống', optional: 'Ghé thêm', hotel: 'Lưu trú' };
let data = { activities: [], places: [], restaurants: [], notes: [] };
let repo;
let dayFilter = 'all';
let editing = false;
let busy = false;
let toastTimer;
let returnFocus;
let personal = {};
try {
  personal = JSON.parse(localStorage.getItem('dalat-personal-v1') || '{}');
  if (!personal || typeof personal !== 'object' || Array.isArray(personal)) {
    personal = {};
  }
} catch {
  personal = {};
}

function toast(message, error = false) {
  const element = $('#toast');
  element.textContent = message;
  element.className = `visible${error ? ' error' : ''}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove('visible'), error ? 7000 : 4000);
}

function setPersonal(key, checked) {
  const previous = personal[key];
  personal[key] = checked;
  try {
    localStorage.setItem('dalat-personal-v1', JSON.stringify(personal));
    return true;
  } catch {
    personal[key] = previous;
    toast('Trình duyệt không lưu được checklist. Kiểm tra quyền lưu trữ.', true);
    return false;
  }
}

function mapsUrl(place) {
  return safeUrl(place?.googleMapsUrl, 'maps') || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place?.name || ''} ${place?.address || ''} Đà Lạt`)}`;
}

function safeUrl(value, kind = 'image') {
  if (typeof value !== 'string' || !value.trim()) {
    return '';
  }
  try {
    const url = new URL(value, document.baseURI);
    if (url.protocol !== 'https:' && !(kind === 'image' && url.origin === location.origin && url.protocol === 'http:')) {
      return '';
    }
    if (kind === 'maps' && !(url.hostname === 'maps.app.goo.gl' || url.hostname === 'maps.google.com' || url.hostname === 'goo.gl' || /(^|\.)google\.(com|com\.vn)$/.test(url.hostname))) {
      return '';
    }
    return url.href;
  } catch {
    return '';
  }
}

function imageFor(place) {
  const custom = safeUrl(place?.images?.[0]);
  if (custom) {
    return { url: custom, credit: place.imageCredit || '', source: '' };
  }
  if (images.places[place?.id]) {
    return images.places[place.id];
  }
  const name = place?.name?.toLocaleLowerCase('vi') || '';
  if (name.includes('tuyền lâm')) {
    return images.lake;
  }
  if (name.includes('ga đà lạt')) {
    return images.station;
  }
  if (name.includes('cầu đất')) {
    return images.tea;
  }
  if (name.includes('xuân hương')) {
    return images.city;
  }
  return null;
}

function photo(place, className = '', imageOverride = null) {
  const image = imageOverride || imageFor(place);
  const url = safeUrl(image?.url);
  const fallback = `<div class="photo-fallback"><span class="pine-art" aria-hidden="true">♧</span><strong>${escape(place?.name || 'Đà Lạt đang chờ')}</strong><small>ẢNH CHƯA ĐƯỢC BỔ SUNG</small></div>`;
  return `<div class="photo ${escape(className)} tone-${(place?.name?.length || 0) % 4}">${url ? `<img src="${escape(url)}" alt="${escape(place?.name || 'Cảnh Đà Lạt')}" loading="lazy" decoding="async">` : fallback}</div>`;
}

function bindImageFallbacks(root = document) {
  $$('img', root).forEach((img) => {
    const fallback = () => {
      const parent = img.parentElement;
      if (parent) {
        parent.innerHTML = `<div class="photo-fallback"><span class="pine-art" aria-hidden="true">♧</span><strong>${escape(img.alt)}</strong><small>ẢNH CHƯA TẢI ĐƯỢC</small></div>`;
      }
    };
    img.addEventListener('error', fallback, { once: true });
    if (img.complete && img.naturalWidth === 0) {
      fallback();
    }
  });
}

function placeById(id) {
  return [...data.places, ...data.restaurants].find((place) => place.id === id);
}

function sortedActivities(dayId) {
  return data.activities.filter((activity) => activity.dayId === dayId).sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}

function priorityBadge(priority) {
  return ['group', 'high', 'must', 'Ưu tiên nhóm'].includes(priority) ? '<span class="badge priority">✧ Ưu tiên nhóm</span>' : '';
}

function statusLabel(status) {
  return status === 'verified' ? 'Đã xác minh' : status === 'considering' ? 'Đang cân nhắc' : 'Cần xác nhận';
}

function renderDays() {
  const dayImages = [images.city, images.tea, images.lake, images.station];
  $('#day-cards').innerHTML = seed.days.map((day, index) => `<article class="day-card"><a href="#itinerary" data-day="${day.id}" aria-label="Xem lịch ngày ${index + 1}"><div class="day-photo">${photo({ name: day.title }, '', dayImages[index])}<span class="day-number">0${index + 1}</span></div><span class="eyebrow">${escape(day.date)} / DAY ${index + 1}</span><h3>${escape(day.title)}</h3><p>${escape(day.route)}</p><span class="text-button">Khám phá ngày ${index + 1} ↗</span></a></article>`).join('');
  $('#day-tabs').innerHTML = [{ id: 'all', label: 'All' }, ...seed.days.map((day, index) => ({ id: day.id, label: `Day ${index + 1}` }))].map((day) => `<button class="day-tab" data-tab="${day.id}" aria-pressed="${dayFilter === day.id}">${day.label}</button>`).join('');
  $('#map-day').innerHTML = seed.days.map((day, index) => `<option value="${day.id}">Day ${index + 1} · ${escape(day.date)}</option>`).join('');
  const colors = [['#393d37', '#b0a497', '#e6ddd0'], ['#faf7ec', '#d3bfa3', '#bf9c87'], ['#d6c7ae', '#315e4c', '#743b46'], ['#a87c58', '#f2e4cd', '#656d5c']];
  $('#outfits').innerHTML = seed.days.map((day, index) => {
    const note = data.notes.find((entry) => entry.id === `outfit-${index + 1}`);
    return `<article class="outfit-card"><span class="eyebrow">DAY 0${index + 1}</span><h3>${escape(['Winter in the city', 'Soft days, tea hills', 'Into the pine forest', 'A vintage goodbye'][index])}</h3><p>${escape(note?.body || day.outfit)}</p><div class="color-chips" aria-hidden="true">${colors[index].map((color) => `<span style="background:${color}"></span>`).join('')}</div>${note ? `<button class="text-button edit-only" data-edit="notes" data-id="${note.id}">Sửa gợi ý</button>` : ''}</article>`;
  }).join('');
}

function renderTimeline() {
  $$('.day-tab').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.tab === dayFilter)));
  const days = seed.days.filter((day) => dayFilter === 'all' || day.id === dayFilter);
  $('#timeline').innerHTML = days.map((day) => {
    const all = sortedActivities(day.id);
    const activities = all.filter((activity) => $('#optional').checked || !['optional', 'backup'].includes(activity.type));
    return `<section class="timeline-day"><div class="timeline-day-heading"><span class="day-index">0${seed.days.indexOf(day) + 1}</span><div><h3>${escape(day.title)}</h3><p>${escape(day.date)} · ${escape(day.route)}</p></div></div><div class="timeline">${activities.map((activity) => {
      const place = placeById(activity.placeId);
      const index = all.findIndex((entry) => entry.id === activity.id);
      const optional = ['optional', 'backup'].includes(activity.type);
      return `<article class="activity${personal[activity.id] ? ' completed' : ''}"><div class="activity-time">${escape(activity.start)}${activity.end ? `<br>– ${escape(activity.end)}` : ''}</div>${photo(place || { name: activity.title }, 'activity-photo')}<div class="activity-main"><div class="badges"><span class="badge${optional ? ' optional' : ''}">${escape(types[activity.type] || activity.type)}</span>${priorityBadge(activity.priority)}</div><h4>${escape(activity.title)}</h4>${place ? `<p><strong>${escape(place.name)}</strong></p>` : ''}<p>${escape(activity.description)}</p>${activity.notes ? `<p class="activity-notes">${escape(activity.notes)}</p>` : ''}${activity.alternative ? `<p class="activity-notes">Phương án khác: ${escape(activity.alternative)}</p>` : ''}${place ? `<a href="${escape(mapsUrl(place))}" target="_blank" rel="noopener noreferrer">Mở Google Maps ↗</a>` : ''}</div><label class="completion"><input type="checkbox" data-complete="${activity.id}" ${personal[activity.id] ? 'checked' : ''} aria-label="Đánh dấu hoàn thành: ${escape(activity.title)}"></label><div class="activity-actions edit-only"><button data-edit="activities" data-id="${activity.id}">Sửa / đổi quán</button><button data-move="${activity.id}" data-direction="-1" ${index === 0 ? 'disabled' : ''} aria-label="Đưa ${escape(activity.title)} lên">↑ Lên</button><button data-move="${activity.id}" data-direction="1" ${index === all.length - 1 ? 'disabled' : ''}>↓ Xuống</button><button data-delete="activities" data-id="${activity.id}">Xóa</button></div></article>`;
    }).join('') || '<p class="empty-state">Chưa có hoạt động phù hợp. Bật chỉnh sửa để thêm một chiếc hẹn mới.</p>'}</div></section>`;
  }).join('');
  bindImageFallbacks($('#timeline'));
}

function renderPlaces() {
  const query = $('#place-search').value.trim().toLocaleLowerCase('vi');
  const category = $('#place-filter').value;
  const list = data.places.filter((place) => `${place.name} ${place.address} ${place.tags.join(' ')}`.toLocaleLowerCase('vi').includes(query) && (category === 'all' || place.category === category));
  $('#place-grid').innerHTML = list.map((place) => `<article class="place-card"><button class="place-photo" data-detail="places" data-id="${place.id}" aria-label="Xem ${escape(place.name)}">${photo(place)}</button><div class="card-meta"><span class="badge">${escape(categories[place.category] || place.category)}</span>${priorityBadge(place.priority)}</div><h3>${escape(place.name)}</h3><p>${escape(place.description)}</p><p>${escape(statusLabel(place.verificationStatus))}</p><div class="card-links"><button class="text-button" data-detail="places" data-id="${place.id}">Khám phá ↗</button><a href="${escape(mapsUrl(place))}" target="_blank" rel="noopener noreferrer">Bản đồ ↗</a><button class="text-button edit-only" data-edit="places" data-id="${place.id}">Sửa</button><button class="text-button edit-only" data-use="${place.id}">+ Vào lịch</button></div></article>`).join('') || '<p class="empty-state">Chưa tìm thấy địa điểm. Thử từ khóa khác nhé.</p>';
  bindImageFallbacks($('#place-grid'));
}

function renderFood() {
  const query = $('#food-search').value.trim().toLocaleLowerCase('vi');
  const list = data.restaurants.filter((place) => `${place.name} ${place.dish} ${place.address}`.toLocaleLowerCase('vi').includes(query) && (!$('#food-priority').checked || priorityBadge(place.priority)));
  $('#food-grid').innerHTML = list.map((place) => {
    const days = [...new Set(data.activities.filter((activity) => activity.placeId === place.id).map((activity) => `Day ${seed.days.findIndex((day) => day.id === activity.dayId) + 1}`))];
    return `<article class="food-card">${photo(place, 'food-photo')}${priorityBadge(place.priority)}<span class="badge">${escape(statusLabel(place.verificationStatus))}</span><h3>${escape(place.name)}</h3><p><strong>${escape(place.dish || place.description)}</strong></p><p>${escape(place.address || 'Chưa chốt địa chỉ / chi nhánh')}</p><p>${escape(place.notes)}</p><small>${days.length ? `Dự kiến: ${days.join(', ')}` : 'Đang cân nhắc · Chưa xếp vào lịch'}</small><div class="card-links"><a href="${escape(mapsUrl(place))}" target="_blank" rel="noopener noreferrer">Google Maps ↗</a><button class="text-button" data-detail="restaurants" data-id="${place.id}">Chi tiết</button><button class="text-button edit-only" data-edit="restaurants" data-id="${place.id}">Sửa</button><button class="text-button edit-only" data-use="${place.id}">+ Vào lịch</button></div></article>`;
  }).join('') || '<p class="empty-state">Chưa tìm thấy quán phù hợp.</p>';
  bindImageFallbacks($('#food-grid'));
}

function renderMap() {
  const day = seed.days.find((entry) => entry.id === $('#map-day').value) || seed.days[0];
  const places = [...new Map(sortedActivities(day.id).map((activity) => placeById(activity.placeId)).filter(Boolean).map((place) => [place.id, place])).values()];
  const hotel = data.places.find((place) => place.name.includes('Charlie'));
  if (hotel && !places.some((place) => place.id === hotel.id)) {
    places.unshift(hotel);
  }
  const routePlaces = places.slice(0, 9);
  const route = new URL('https://www.google.com/maps/dir/');
  route.searchParams.set('api', '1');
  if (routePlaces.length > 1) {
    route.searchParams.set('origin', `${routePlaces[0].name} ${routePlaces[0].address} Đà Lạt`);
    route.searchParams.set('destination', `${routePlaces.at(-1).name} ${routePlaces.at(-1).address} Đà Lạt`);
    route.searchParams.set('waypoints', routePlaces.slice(1, -1).map((place) => `${place.name} ${place.address} Đà Lạt`).join('|'));
    route.searchParams.set('travelmode', 'driving');
  }
  $('#map-content').innerHTML = `<div class="route-art"><span class="eyebrow">DAY 0${seed.days.indexOf(day) + 1} · THE LITTLE ROAD TRIP</span><h3>${escape(day.title)}</h3><p>${escape(day.route)}</p><p>Cung đường tham khảo từ các điểm hiện có. Google Maps có thể giới hạn số điểm dừng trên điện thoại; hãy kiểm tra từng điểm.</p>${routePlaces.length > 1 ? `<a class="button button-cream" href="${escape(route.href)}" target="_blank" rel="noopener noreferrer">Mở cung đường ↗</a>` : ''}</div><div class="route-stops">${places.map((place, index) => `<div class="map-stop"><div><span>${String(index + 1).padStart(2, '0')}</span>${escape(place.name)}</div><a href="${escape(mapsUrl(place))}" target="_blank" rel="noopener noreferrer" aria-label="Bản đồ ${escape(place.name)}">Maps ↗</a></div>`).join('') || '<p>Chưa có địa điểm cho ngày này.</p>'}</div>`;
}

function renderNotes() {
  $('#notes-grid').innerHTML = data.notes.filter((note) => !note.id.startsWith('outfit-')).map((note) => `<article class="note-card"><h3>${escape(note.title)}</h3>${note.kind === 'checklist' ? note.body.split('\n').filter(Boolean).map((line, index) => `<label class="note-check"><input type="checkbox" data-personal="${escape(`${note.id}:${index}:${line}`)}" ${personal[`${note.id}:${index}:${line}`] ? 'checked' : ''}>${escape(line)}</label>`).join('') : `<p>${escape(note.body)}</p>`}<div class="card-links"><button class="text-button edit-only" data-edit="notes" data-id="${note.id}">Sửa ghi chú</button><button class="text-button edit-only" data-delete="notes" data-id="${note.id}">Xóa</button></div></article>`).join('') || '<p class="empty-state">Chưa có ghi chú chung.</p>';
}

function render() {
  const mapDay = $('#map-day').value;
  renderDays();
  if (mapDay) {
    $('#map-day').value = mapDay;
  }
  const current = $('#place-filter').value;
  const unique = [...new Set(data.places.map((place) => place.category))];
  $('#place-filter').innerHTML = '<option value="all">Tất cả</option>' + unique.map((category) => `<option value="${escape(category)}">${escape(categories[category] || category)}</option>`).join('');
  $('#place-filter').value = unique.includes(current) ? current : 'all';
  renderTimeline();
  renderPlaces();
  renderFood();
  renderMap();
  renderNotes();
  bindImageFallbacks($('#day-cards'));
}

const dialog = $('#editor');
function openDialog(html) {
  returnFocus = document.activeElement;
  $('#dialog-content').innerHTML = html;
  if (!dialog.open) {
    dialog.showModal();
  }
  requestAnimationFrame(() => {
    const focus = $('input, textarea, select, .detail-body a', $('#dialog-content')) || $('#close-dialog');
    focus.focus();
  });
}

function closeDialog() {
  if (busy) {
    toast('Đang lưu. Vui lòng chờ xác nhận.');
    return;
  }
  dialog.close();
}

dialog.addEventListener('close', () => {
  if (returnFocus?.isConnected) {
    returnFocus.focus();
  } else {
    $('#edit-toggle').focus();
  }
});
dialog.addEventListener('cancel', (event) => {
  if (busy) {
    event.preventDefault();
  }
});
$('#close-dialog').addEventListener('click', closeDialog);
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) {
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
      closeDialog();
    }
  }
});

function field(name, label, value = '', options = {}) {
  const full = options.full ? ' full' : '';
  const attributes = `${options.required ? ' required' : ''} maxlength="${options.max || 2000}"`;
  let input;
  if (options.options) {
    input = `<select name="${name}"${options.required ? ' required' : ''}>${options.options.map(([key, text]) => `<option value="${escape(key)}" ${value === key ? 'selected' : ''}>${escape(text)}</option>`).join('')}</select>`;
  } else if (options.textarea) {
    input = `<textarea name="${name}"${attributes}>${escape(value)}</textarea>`;
  } else {
    input = `<input name="${name}" value="${escape(value)}"${attributes}${options.type ? ` type="${options.type}"` : ''}>`;
  }
  return `<label class="form-field${full}">${label}${input}${options.help ? `<small>${options.help}</small>` : ''}</label>`;
}

function newId(prefix) {
  return `${prefix}-${crypto.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`}`;
}

function timeField(name, label, value, required = false) {
  const clock = !value || /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
  return `<div class="form-field"><label for="time-${name}">${label}</label><input id="time-${name}" name="${name}" type="${clock ? 'time' : 'text'}" value="${escape(value)}" maxlength="80"${required ? ' required' : ''}><button type="button" class="text-button time-toggle" data-time-toggle="${name}">${clock ? 'Nhập khung giờ bằng chữ' : 'Chọn giờ bằng picker'}</button></div>`;
}

function blankRecord(collection) {
  if (collection === 'activities') {
    const dayId = dayFilter === 'all' ? 'day-1' : dayFilter;
    const maxOrder = Math.max(0, ...sortedActivities(dayId).map((activity) => activity.order));
    return { id: newId('act'), revision: 1, dayId, title: '', start: '', end: '', type: 'main', placeId: '', description: '', notes: '', priority: 'main', order: maxOrder + 100, alternative: '' };
  }
  if (collection === 'notes') {
    return { id: newId('note'), revision: 1, title: '', body: '', kind: 'general' };
  }
  return { id: newId(collection === 'restaurants' ? 'food' : 'place'), revision: 1, name: '', category: collection === 'restaurants' ? 'food' : 'nature', address: '', description: '', notes: '', images: [], imageCredit: '', googleMapsUrl: '', latitude: null, longitude: null, priority: 'main', tags: [], verificationStatus: 'needs-confirmation', dish: '' };
}

function editForm(collection, id = null, preset = {}) {
  if (!editing || repo?.readOnly) {
    return;
  }
  const original = id ? data[collection].find((record) => record.id === id) : null;
  if (id && !original) {
    toast('Mục này đã được xóa. Hãy tải lại danh sách.', true);
    return;
  }
  const record = { ...(original || blankRecord(collection)), ...preset };
  let fields = '';
  if (collection === 'activities') {
    fields = field('title', 'Tên hoạt động', record.title, { required: true, full: true, max: 160 }) + field('dayId', 'Ngày', record.dayId, { options: seed.days.map((day, index) => [day.id, `Day ${index + 1} · ${day.date}`]) }) + field('type', 'Loại hoạt động', record.type, { options: Object.entries(types) }) + timeField('start', 'Bắt đầu / khung giờ', record.start, true) + timeField('end', 'Kết thúc (nếu có)', record.end) + field('placeId', 'Địa điểm / nhà hàng', record.placeId, { full: true, options: [['', 'Không gắn địa điểm'], ...data.places.map((place) => [place.id, `Địa điểm · ${place.name}`]), ...data.restaurants.map((place) => [place.id, `Quán · ${place.name}`])] }) + '<div class="form-field full"><button type="button" class="text-button" id="inline-place">+ Tạo địa điểm mới ngay trong form</button></div>' + field('priority', 'Ưu tiên', record.priority, { options: priorityOptions(record.priority) }) + field('description', 'Mô tả', record.description, { textarea: true, full: true }) + field('notes', 'Ghi chú', record.notes, { textarea: true, full: true }) + field('alternative', 'Phương án thay thế', record.alternative, { textarea: true, full: true });
  } else if (collection === 'notes') {
    fields = field('title', 'Tiêu đề', record.title, { required: true, full: true, max: 160 }) + field('kind', 'Loại ghi chú', record.kind, { options: uniqueOptions([['general', 'Ghi chú chung'], ['checklist', 'Checklist'], ['outfit', 'Trang phục'], ['transport', 'Di chuyển'], ['weather', 'Thời tiết']], record.kind) }) + field('body', 'Nội dung', record.body, { full: true, textarea: true, required: true, max: 5000, help: 'Với checklist, mỗi dòng là một mục. Dấu tích chỉ lưu riêng trên trình duyệt.' });
  } else {
    fields = field('name', 'Tên địa điểm / quán', record.name, { required: true, full: true, max: 160 }) + field('category', 'Danh mục', record.category, { options: uniqueOptions(Object.entries(categories), record.category) }) + field('priority', 'Ưu tiên', record.priority, { options: priorityOptions(record.priority) }) + field('address', 'Địa chỉ tham khảo', record.address, { full: true, max: 300 }) + (collection === 'restaurants' ? field('dish', 'Món nổi bật', record.dish, { full: true, max: 300 }) : '') + field('description', 'Mô tả', record.description, { full: true, textarea: true }) + field('googleMapsUrl', 'Google Maps URL', record.googleMapsUrl, { full: true, max: 1500, help: 'Để trống sẽ tạo link Google Maps Search từ tên và địa chỉ.' }) + field('image', 'Ảnh URL hoặc local asset', record.images[0] || '', { full: true, max: 1500, help: 'HTTPS hoặc đường dẫn tương đối, VD: assets/spots/anh.jpg. Chỉ dùng ảnh có quyền sử dụng.' }) + field('imageCredit', 'Nguồn ảnh / tác giả / giấy phép', record.imageCredit, { full: true, max: 500 }) + field('tags', 'Tags (phân cách bằng dấu phẩy)', record.tags.join(', '), { full: true, max: 500 }) + field('verificationStatus', 'Trạng thái xác minh', record.verificationStatus, { options: uniqueOptions([['needs-confirmation', 'Cần xác nhận'], ['considering', 'Đang cân nhắc'], ['verified', 'Đã xác minh']], record.verificationStatus) }) + field('notes', 'Ghi chú', record.notes, { full: true, textarea: true });
  }
  const title = `${id ? 'Chỉnh sửa' : 'Thêm'} ${({ activities: 'hoạt động', places: 'địa điểm', restaurants: 'quán ăn', notes: 'ghi chú' })[collection]}`;
  openDialog(`<h2 class="dialog-title" id="dialog-title">${title}</h2><form id="edit-form"><div class="form-grid">${fields}</div><p class="form-error" id="form-error" role="alert"></p><div class="form-actions"><button type="button" class="button button-outline" id="cancel-form">Hủy</button><button type="submit" class="button" id="save-form">Lưu thay đổi ↗</button></div></form>`);
  $('#cancel-form').addEventListener('click', closeDialog);
  if (collection === 'activities') {
    $('#inline-place').addEventListener('click', () => {
      const content = $('#dialog-content');
      const inline = document.createElement('fieldset');
      inline.className = 'form-field full';
      inline.innerHTML = '<legend>Địa điểm mới</legend>' + field('newPlaceName', 'Tên địa điểm mới', '', { required: true, max: 160 }) + field('newPlaceAddress', 'Địa chỉ tham khảo', '', { max: 300 }) + '<small>Địa điểm sẽ được lưu vào catalog trước, rồi gắn vào hoạt động. Có thể bổ sung ảnh trong form sửa địa điểm.</small>';
      $('.form-grid', content).append(inline);
      $('#inline-place').disabled = true;
      $('input', inline).focus();
    });
  }
  $('#edit-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (busy) {
      return;
    }
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const next = { ...record };
    const fieldsToCopy = collection === 'activities' ? ['title', 'dayId', 'type', 'start', 'end', 'placeId', 'priority', 'description', 'notes', 'alternative'] : collection === 'notes' ? ['title', 'kind', 'body'] : ['name', 'category', 'priority', 'address', 'description', 'googleMapsUrl', 'imageCredit', 'verificationStatus', 'notes'];
    fieldsToCopy.forEach((key) => {
      next[key] = values[key]?.trim() || '';
    });
    try {
      if (collection === 'activities') {
        if (next.placeId !== record.placeId && next.title === record.title) {
          const oldPlace = placeById(record.placeId);
          const newPlace = placeById(next.placeId);
          if (oldPlace && newPlace && next.title.includes(oldPlace.name)) {
            next.title = next.title.replace(oldPlace.name, newPlace.name);
          }
        }
        if (/^\d{2}:\d{2}$/.test(next.start) && /^\d{2}:\d{2}$/.test(next.end) && next.end <= next.start) {
          throw new Error('Giờ kết thúc cần sau giờ bắt đầu.');
        }
        if (next.dayId !== record.dayId) {
          next.order = Math.max(0, ...sortedActivities(next.dayId).map((activity) => activity.order)) + 100;
        }
      } else if (collection !== 'notes') {
        if (values.image.trim() && !safeUrl(values.image.trim())) {
          throw new Error('Ảnh cần dùng HTTPS hoặc đường dẫn local hợp lệ.');
        }
        if (next.googleMapsUrl && !safeUrl(next.googleMapsUrl, 'maps')) {
          throw new Error('Vui lòng dùng liên kết Google Maps HTTPS hợp lệ.');
        }
        next.images = values.image.trim() ? [values.image.trim()] : [];
        next.tags = values.tags.split(',').map((tag) => tag.trim()).filter(Boolean);
        if (collection === 'restaurants') {
          next.dish = values.dish.trim();
        }
      }
      busy = true;
      $('#save-form').disabled = true;
      $('#save-form').textContent = 'Đang lưu…';
      $('#form-error').textContent = '';
      if (values.newPlaceName) {
        const place = { ...blankRecord('places'), name: values.newPlaceName.trim(), address: values.newPlaceAddress.trim() };
        await repo.save('places', place, 0);
        next.placeId = place.id;
        const selector = $('[name="placeId"]', event.currentTarget);
        const option = document.createElement('option');
        option.value = place.id;
        option.textContent = place.name;
        selector.append(option);
        selector.value = place.id;
        $('[name="newPlaceName"]', event.currentTarget).closest('fieldset').remove();
        toast('Đã tạo địa điểm. Đang lưu hoạt động…');
      }
      await repo.save(collection, next, original ? original.revision : 0);
      busy = false;
      dialog.close();
      toast(repo.mode === 'cloud' ? 'Đã lưu lên cloud.' : 'Đã lưu trên trình duyệt này.');
    } catch (error) {
      busy = false;
      $('#form-error').textContent = error.message || 'Không lưu được. Nội dung trong form vẫn được giữ lại.';
      $('#save-form').disabled = false;
      $('#save-form').textContent = 'Thử lưu lại';
    }
  });
}

function uniqueOptions(options, value) {
  return options.some(([key]) => key === value) ? options : [...options, [value, value]];
}

function priorityOptions(value) {
  return uniqueOptions([['main', 'Lịch chính'], ['group', 'Ưu tiên nhóm'], ['optional', 'Có thể bỏ']], value);
}

function detail(collection, id) {
  const place = data[collection].find((record) => record.id === id);
  if (!place) {
    return;
  }
  const image = imageFor(place);
  openDialog(`<h2 class="dialog-title" id="dialog-title">${escape(place.name)}</h2>${photo(place, 'detail-photo')}<p class="detail-credit">${escape(image?.credit || place.imageCredit || 'Chưa bổ sung ảnh có nguồn xác minh.')}${image?.source ? ` · <a href="${escape(safeUrl(image.source))}" target="_blank" rel="noopener noreferrer">Nguồn ảnh ↗</a>` : ''}${image?.license ? ` · <a href="${escape(safeUrl(image.license))}" target="_blank" rel="noopener noreferrer">Giấy phép ↗</a>` : ''}</p><div class="detail-body"><p>${escape(place.description)}</p><p>${escape(place.address || 'Địa chỉ chưa chốt')}</p><p>${escape(place.notes)}</p><p>${escape(statusLabel(place.verificationStatus))}</p></div><a class="button" href="${escape(mapsUrl(place))}" target="_blank" rel="noopener noreferrer">Mở Google Maps ↗</a>`);
  bindImageFallbacks(dialog);
}

async function removeRecord(collection, id) {
  const record = data[collection].find((entry) => entry.id === id);
  if (!editing || !record || busy) {
    return;
  }
  if (!confirm(`Xóa “${record.title || record.name}”?${repo.mode === 'cloud' ? ' Thay đổi áp dụng cho mọi người.' : ''}`)) {
    return;
  }
  busy = true;
  try {
    await repo.remove(collection, id, record.revision);
    toast('Đã xóa.');
  } catch (error) {
    toast(error.message, true);
  } finally {
    busy = false;
  }
}

async function moveActivity(id, direction) {
  if (busy || !editing) {
    return;
  }
  const record = data.activities.find((activity) => activity.id === id);
  const list = sortedActivities(record.dayId);
  const index = list.findIndex((activity) => activity.id === id);
  const target = index + direction;
  if (!list[target]) {
    return;
  }
  const before = direction < 0 ? list[target - 1] : list[target];
  const after = direction < 0 ? list[target] : list[target + 1];
  const order = before && after ? (before.order + after.order) / 2 : before ? before.order + 100 : after.order / 2;
  if (order === before?.order || order === after?.order) {
    toast('Khoảng thứ tự quá nhỏ. Xuất và nhập lại bản sao để chuẩn hóa thứ tự.', true);
    return;
  }
  busy = true;
  try {
    await repo.save('activities', { ...record, order }, record.revision);
    toast('Đã đổi thứ tự.');
  } catch (error) {
    toast(error.message, true);
  } finally {
    busy = false;
  }
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('button, a[data-day]');
  if (!button) {
    return;
  }
  if (button.dataset.timeToggle) {
    const input = $(`[name="${button.dataset.timeToggle}"]`, dialog);
    const wasClock = input.type === 'time';
    input.dataset[wasClock ? 'clockValue' : 'textValue'] = input.value;
    const previous = input.value;
    input.type = wasClock ? 'text' : 'time';
    input.value = wasClock ? (input.dataset.textValue ?? previous) : (/^([01]\d|2[0-3]):[0-5]\d$/.test(previous) ? previous : input.dataset.clockValue || '');
    input.placeholder = wasClock ? 'VD: Buổi tối, Chiều…' : '';
    button.textContent = wasClock ? 'Chọn giờ bằng picker' : 'Nhập khung giờ bằng chữ';
    input.focus();
  } else if (button.dataset.tab || button.dataset.day) {
    dayFilter = button.dataset.tab || button.dataset.day;
    renderTimeline();
  } else if (button.dataset.edit) {
    editForm(button.dataset.edit, button.dataset.id);
  } else if (button.dataset.detail) {
    detail(button.dataset.detail, button.dataset.id);
  } else if (button.dataset.delete) {
    removeRecord(button.dataset.delete, button.dataset.id);
  } else if (button.dataset.move) {
    moveActivity(button.dataset.move, Number(button.dataset.direction));
  } else if (button.dataset.use) {
    const place = placeById(button.dataset.use);
    editForm('activities', null, { title: place.name, placeId: place.id, type: data.restaurants.includes(place) ? 'food' : place.category === 'coffee' ? 'coffee' : 'main' });
  } else if (button.dataset.action) {
    editForm(({ 'add-activity': 'activities', 'add-place': 'places', 'add-restaurant': 'restaurants', 'add-note': 'notes' })[button.dataset.action]);
  }
});

document.addEventListener('change', (event) => {
  if (event.target.dataset.complete) {
    const success = setPersonal(event.target.dataset.complete, event.target.checked);
    if (success) {
      event.target.closest('.activity').classList.toggle('completed', event.target.checked);
    } else {
      event.target.checked = !event.target.checked;
    }
  }
  if (event.target.dataset.personal && !setPersonal(event.target.dataset.personal, event.target.checked)) {
    event.target.checked = !event.target.checked;
  }
});

$('#edit-toggle').addEventListener('click', () => {
  if (!repo) {
    toast('Dữ liệu chưa sẵn sàng. Vui lòng chờ hoặc kiểm tra cấu hình.', true);
    return;
  }
  if (repo.readOnly) {
    toast('Chuyến đi đang ở chế độ chỉ đọc.');
    return;
  }
  editing = !editing;
  document.body.classList.toggle('editing', editing);
  $('#edit-toggle').setAttribute('aria-pressed', String(editing));
  $('#edit-toggle').textContent = editing ? 'Xong chỉnh sửa ✓' : 'Chỉnh sửa ↗';
});
$('#optional').addEventListener('change', renderTimeline);
$('#place-search').addEventListener('input', renderPlaces);
$('#place-filter').addEventListener('change', renderPlaces);
$('#food-search').addEventListener('input', renderFood);
$('#food-priority').addEventListener('change', renderFood);
$('#map-day').addEventListener('change', renderMap);
$('#share').addEventListener('click', async () => {
  const url = location.href.split('#')[0];
  const text = repo?.mode === 'local' ? 'Đà Lạt Trip 2026 — dữ liệu Local Mode trên máy bạn không được chia sẻ qua link.' : 'Đà Lạt Trip 2026 — lịch trình của chúng mình';
  try {
    if (navigator.share) {
      await navigator.share({ title: 'DA LAT TRIP 2026', text, url });
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      toast(repo?.mode === 'local' ? 'Đã sao chép link. Dữ liệu local không đi kèm link.' : 'Đã sao chép link chuyến đi.');
    } else {
      prompt('Sao chép link chuyến đi. Dữ liệu local không đi kèm link:', url);
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      toast('Không chia sẻ được. Bạn có thể sao chép URL trên thanh địa chỉ.', true);
    }
  }
});
$('#export').addEventListener('click', async () => {
  if (!repo) {
    return;
  }
  try {
    const backup = await repo.exportData();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `da-lat-trip-${repo.mode}-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast(`Đã xuất bản sao ${repo.mode === 'cloud' ? 'cloud' : 'local'}.`);
  } catch (error) {
    toast(error.message, true);
  }
});
$('#import').addEventListener('click', () => $('#import-file').click());
$('#import-file').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  event.target.value = '';
  if (!file || !repo || busy) {
    return;
  }
  try {
    if (file.size > 2 * 1024 * 1024) {
      throw new Error('File quá lớn. Giới hạn bản sao là 2 MB.');
    }
    const backup = validateBackup(JSON.parse(await file.text()));
    const count = ['activities', 'places', 'restaurants', 'notes'].reduce((total, key) => total + backup[key].length, 0);
    if (!confirm(`Nhập ${count} mục và thay thế toàn bộ dữ liệu ${repo.mode === 'cloud' ? 'CLOUD CHUNG CỦA MỌI NGƯỜI' : 'local hiện tại'}? Hãy xuất JSON trước khi tiếp tục.`)) {
      return;
    }
    if (repo.mode === 'cloud' && prompt('Thao tác này thay thế dữ liệu chung. Gõ RESTORE để xác nhận:') !== 'RESTORE') {
      return;
    }
    busy = true;
    await repo.importData(backup);
    toast('Đã khôi phục dữ liệu từ JSON.');
  } catch (error) {
    toast(error.message || 'File JSON không hợp lệ.', true);
  } finally {
    busy = false;
  }
});
$('#reset').addEventListener('click', async () => {
  if (repo?.mode !== 'local' || busy || !confirm('Khôi phục lịch trình local về bản nháp ban đầu? Hãy xuất JSON nếu muốn giữ thay đổi. Checklist cá nhân vẫn được giữ.')) {
    return;
  }
  busy = true;
  try {
    await repo.resetLocal();
    toast('Đã khôi phục bản nháp local.');
  } catch (error) {
    toast(error.message, true);
  } finally {
    busy = false;
  }
});
$('#seed-cloud').addEventListener('click', async () => {
  if (!repo || busy || !confirm('Khởi tạo cloud bằng dữ liệu seed ban đầu? Chỉ thực hiện khi cloud hoàn toàn trống; dữ liệu local sẽ không được tải lên.')) {
    return;
  }
  busy = true;
  try {
    await repo.seedCloud();
    toast('Đã khởi tạo dữ liệu cloud.');
  } catch (error) {
    toast(error.message, true);
  } finally {
    busy = false;
  }
});

function updateMode() {
  $('#mode').textContent = repo.mode === 'cloud' ? (repo.readOnly ? 'Cloud · Chỉ đọc' : 'Cloud Mode') : 'Local Mode';
  $('#backup-help').textContent = repo.mode === 'cloud' ? 'Dữ liệu chung qua Firestore. Xuất JSON để sao lưu bản cloud; nhập sẽ thay thế dữ liệu của mọi người.' : 'Chỉ lưu trên trình duyệt này, chưa đồng bộ với người khác. Xuất JSON để sao lưu hoặc chuyển dữ liệu.';
  $('#reset').hidden = repo.mode !== 'local';
  $('#seed-cloud').hidden = repo.mode !== 'cloud' || repo.readOnly || Object.values(data).some((list) => list.length > 0);
  if (repo.readOnly) {
    $('#edit-toggle').textContent = 'Chỉ đọc';
  }
}

async function init() {
  if (images.hero?.url) {
    const probe = new Image();
    probe.onload = () => {
      $('#hero-image').style.backgroundImage = `url("${safeUrl(images.hero.url)}")`;
    };
    probe.onerror = () => {
      $('#hero-credit').textContent = 'Ảnh Hồ Tuyền Lâm chưa tải được · Xem nguồn ảnh ↗';
    };
    probe.src = images.hero.url;
    $('#hero-credit').textContent = images.hero.credit;
    $('#hero-credit').href = images.hero.source;
  } else {
    $('#hero-credit').textContent = 'Ảnh Đà Lạt đang được bổ sung';
  }
  try {
    repo = await createRepository((next) => {
      data = next;
      render();
      if (repo) {
        updateMode();
      }
    }, (status) => {
      $('#save-status').textContent = status.message;
      $('#save-status').dataset.state = status.state;
    });
    data = repo.data;
    render();
    updateMode();
    if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      $$('.section-heading, .overview article').forEach((element) => observer.observe(element));
    }
  } catch (error) {
    $('#mode').textContent = 'Lỗi dữ liệu';
    $('#save-status').textContent = error.message;
    $('#timeline').innerHTML = '<p class="empty-state">Không tải được dữ liệu. Bản local cũ được giữ nguyên. Kiểm tra cấu hình / quyền lưu trữ rồi tải lại trang.</p>';
    toast(error.message, true);
  }
}
init();
