/**
 * LAST SEEN - Client Application JavaScript
 * Dual-Mode Engine: Works seamlessly with Express backend OR 100% standalone on GitHub Pages / Vercel
 * Academic Project: TraceMates (Archana BS & Gedila Bimala)
 * RV University - 2026
 */

// Initial benchmark seed dataset matching assignment specifications
const SEED_ITEMS = [
  {
    id: "item-1",
    name: "Keys",
    category: "Keys & Keychains",
    status: "missing",
    lastLocation: "Classroom",
    latitude: 12.9238,
    longitude: 77.4987,
    lastSeenDate: "2024-09-11",
    lastSeenTime: "14:15",
    notes: "Silver keychain with RVU bike key and room 204 tag",
    imageUrl: "./images/keys.svg",
    history: [
      { id: "h-1", location: "Classroom", date: "2024-09-11", time: "14:15", notes: "Left on 3rd row desk after IP in Design lecture", latitude: 12.9238, longitude: 77.4987 },
      { id: "h-2", location: "Hostel", date: "2024-09-09", time: "08:30", notes: "Found on bedside nightstand", latitude: 12.9221, longitude: 77.4975 },
      { id: "h-3", location: "Classroom", date: "2024-09-04", time: "16:00", notes: "Near teacher podium", latitude: 12.9238, longitude: 77.4987 },
      { id: "h-4", location: "Library", date: "2024-08-28", time: "11:00", notes: "Reading room cubicle 5", latitude: 12.9249, longitude: 77.5002 },
      { id: "h-5", location: "Classroom", date: "2024-08-20", time: "13:45", notes: "Left on seminar hall bench", latitude: 12.9238, longitude: 77.4987 }
    ]
  },
  {
    id: "item-2",
    name: "Laptop",
    category: "Electronics & Laptops",
    status: "found",
    lastLocation: "Library",
    latitude: 12.9249,
    longitude: 77.5002,
    lastSeenDate: "2024-09-12",
    lastSeenTime: "10:30",
    notes: "Dell XPS 13 in gray sleeve with stickers",
    imageUrl: "./images/laptop.svg",
    history: [
      { id: "h-6", location: "Library", date: "2024-09-12", time: "10:30", notes: "Ground floor reference section desk", latitude: 12.9249, longitude: 77.5002 },
      { id: "h-7", location: "Hostel", date: "2024-09-07", time: "21:00", notes: "Charging on study table", latitude: 12.9221, longitude: 77.4975 },
      { id: "h-8", location: "Library", date: "2024-08-30", time: "15:20", notes: "Left in silent study pod B2", latitude: 12.9249, longitude: 77.5002 }
    ]
  },
  {
    id: "item-3",
    name: "Wallet",
    category: "Wallets & Purses",
    status: "missing",
    lastLocation: "Cafeteria",
    latitude: 12.9231,
    longitude: 77.4994,
    lastSeenDate: "2024-09-10",
    lastSeenTime: "13:20",
    notes: "Black leather bifold containing student ID and metro card",
    imageUrl: "./images/wallet.svg",
    history: [
      { id: "h-9", location: "Cafeteria", date: "2024-09-10", time: "13:20", notes: "On juice counter table after lunch", latitude: 12.9231, longitude: 77.4994 },
      { id: "h-10", location: "Cafeteria", date: "2024-09-02", time: "14:10", notes: "Food court corner table", latitude: 12.9231, longitude: 77.4994 },
      { id: "h-11", location: "Hostel", date: "2024-08-25", time: "09:15", notes: "Jacket pocket in closet", latitude: 12.9221, longitude: 77.4975 }
    ]
  },
  {
    id: "item-4",
    name: "Headphones",
    category: "Audio & Earphones",
    status: "missing",
    lastLocation: "Hostel",
    latitude: 12.9221,
    longitude: 77.4975,
    lastSeenDate: "2024-09-08",
    lastSeenTime: "18:45",
    notes: "White over-ear noise cancelling headphones in black zip case",
    imageUrl: "./images/headphones.svg",
    history: [
      { id: "h-12", location: "Hostel", date: "2024-09-08", time: "18:45", notes: "Common lounge sofa", latitude: 12.9221, longitude: 77.4975 },
      { id: "h-13", location: "Library", date: "2024-09-01", time: "17:30", notes: "2nd floor digital media room", latitude: 12.9249, longitude: 77.5002 },
      { id: "h-14", location: "Hostel", date: "2024-08-22", time: "20:00", notes: "Bedside table", latitude: 12.9221, longitude: 77.4975 }
    ]
  },
  {
    id: "item-5",
    name: "College ID Card",
    category: "ID Cards & Documents",
    status: "found",
    lastLocation: "Classroom",
    latitude: 12.9238,
    longitude: 77.4987,
    lastSeenDate: "2024-09-05",
    lastSeenTime: "11:15",
    notes: "RV University Smart Card with blue lanyard",
    imageUrl: "./images/idcard.svg",
    history: [
      { id: "h-15", location: "Classroom", date: "2024-09-05", time: "11:15", notes: "Left on desk during lab session", latitude: 12.9238, longitude: 77.4987 },
      { id: "h-16", location: "Library", date: "2024-08-29", time: "14:00", notes: "Entry turnstile desk", latitude: 12.9249, longitude: 77.5002 }
    ]
  }
];

const KNOWN_COORDS = {
  'Classroom': { lat: 12.9238, lng: 77.4987 },
  'Library': { lat: 12.9249, lng: 77.5002 },
  'Cafeteria': { lat: 12.9231, lng: 77.4994 },
  'Hostel': { lat: 12.9221, lng: 77.4975 },
  'Computer Lab': { lat: 12.9242, lng: 77.4981 },
  'Sports Ground': { lat: 12.9215, lng: 77.5015 },
  'Home / Off-Campus': { lat: 12.9280, lng: 77.4950 }
};

const CATEGORY_DEFAULT_ICONS = {
  'Keys & Keychains': './images/keys.svg',
  'Electronics & Laptops': './images/laptop.svg',
  'Wallets & Purses': './images/wallet.svg',
  'Audio & Earphones': './images/headphones.svg',
  'ID Cards & Documents': './images/idcard.svg',
  'Books & Notebooks': './images/book.svg',
  'Bags & Backpacks': './images/bag.svg',
  'Accessories': './images/accessories.svg',
  'Other': './images/item.svg'
};

// Local storage management
function getLocalItems() {
  const stored = localStorage.getItem('last_seen_items_data');
  if (!stored) {
    localStorage.setItem('last_seen_items_data', JSON.stringify(SEED_ITEMS));
    return JSON.parse(JSON.stringify(SEED_ITEMS));
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    localStorage.setItem('last_seen_items_data', JSON.stringify(SEED_ITEMS));
    return JSON.parse(JSON.stringify(SEED_ITEMS));
  }
}

function saveLocalItems(items) {
  localStorage.setItem('last_seen_items_data', JSON.stringify(items));
}

// Global App State
let allItems = [];
let activeStatusFilter = 'all';
let mapInstance = null;
let mapMarkers = [];
let searchDebounceTimeout = null;
let selectedImageFile = null;
let imageBase64Data = null;

// Initialize app on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initDefaultDateTime();
  initDragAndDrop();
  fetchItems();
  fetchInsights();

  // Listen for hash navigation
  const hash = window.location.hash.replace('#', '') || 'home';
  navigateTo(hash, false);
});

function initDefaultDateTime() {
  const today = new Date().toISOString().split('T')[0];
  const timeNow = new Date().toTimeString().slice(0, 5);

  const addDate = document.getElementById('item-date');
  const addTime = document.getElementById('item-time');
  const updateDate = document.getElementById('update-loc-date');
  const updateTime = document.getElementById('update-loc-time');

  if (addDate) addDate.value = today;
  if (addTime) addTime.value = timeNow;
  if (updateDate) updateDate.value = today;
  if (updateTime) updateTime.value = timeNow;
}

function navigateTo(viewId, updateHash = true) {
  const validViews = ['home', 'items', 'add', 'history', 'smart-finder', 'insights'];
  const target = validViews.includes(viewId) ? viewId : 'home';

  document.querySelectorAll('.app-view').forEach(view => {
    view.classList.remove('active');
  });
  const targetEl = document.getElementById(`view-${target}`);
  if (targetEl) targetEl.classList.add('active');

  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-nav') === target);
  });

  if (updateHash) {
    window.location.hash = target;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (target === 'items') {
    fetchItems();
  } else if (target === 'history') {
    fetchHistory();
    setTimeout(initMapIfNeeded, 150);
  } else if (target === 'smart-finder') {
    populateSmartFinderDropdown();
  } else if (target === 'insights') {
    fetchInsights();
  }
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : 'ℹ'}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ======================== ITEMS API & IN-BROWSER STORE ======================== //

function debounceFetchItems() {
  clearTimeout(searchDebounceTimeout);
  searchDebounceTimeout = setTimeout(fetchItems, 200);
}

function setStatusFilter(status) {
  activeStatusFilter = status;
  document.querySelectorAll('.status-tab').forEach(tab => {
    tab.classList.toggle('active', tab.getAttribute('data-status') === status);
  });
  fetchItems();
}

async function fetchItems() {
  const searchInput = document.getElementById('items-search-input');
  const categorySelect = document.getElementById('items-category-filter');

  const search = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const category = categorySelect ? categorySelect.value : 'All';
  const status = activeStatusFilter;

  // Standalone client storage (guarantees 100% operation on GitHub Pages)
  let items = getLocalItems();

  if (search) {
    items = items.filter(i =>
      i.name.toLowerCase().includes(search) ||
      (i.notes && i.notes.toLowerCase().includes(search)) ||
      (i.lastLocation && i.lastLocation.toLowerCase().includes(search)) ||
      (i.category && i.category.toLowerCase().includes(search))
    );
  }

  if (category && category !== 'All') {
    items = items.filter(i => i.category === category);
  }

  if (status && status !== 'all') {
    items = items.filter(i => i.status === status);
  }

  allItems = items;
  renderItemsGrid(allItems, 'items-grid');
  renderRecentHomeItems(allItems.slice(0, 3));
  updateHistoryItemFilter(getLocalItems());
}

function renderItemsGrid(items, gridId) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  if (items.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📦</div>
        <h3>No items found</h3>
        <p>No recorded belongings match your current filter criteria.</p>
        <button class="btn btn-primary" onclick="navigateTo('add')">+ Add an Item Now</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = items.map(item => `
    <div class="item-card" data-item-id="${item.id}">
      <div class="item-card-top">
        <div class="item-thumbnail">
          <img src="${item.imageUrl || './images/item.svg'}" alt="${escapeHtml(item.name)}">
        </div>
        <div class="item-details">
          <h3 class="item-name">${escapeHtml(item.name)}</h3>
          <span class="item-category-tag">${escapeHtml(item.category || 'Personal Item')}</span>
        </div>
        <span class="item-status-badge ${item.status}">
          ${item.status === 'missing' ? '● Missing' : '✓ Found'}
        </span>
      </div>

      <div class="item-location-info">
        <div class="location-row">
          <span class="location-pin-icon">📍</span>
          <span>${escapeHtml(item.lastLocation || 'Unknown')}</span>
        </div>
        <div class="location-time-row">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>Last seen: ${formatDateTime(item.lastSeenDate, item.lastSeenTime)}</span>
        </div>
      </div>

      <p class="item-notes">${escapeHtml(item.notes || 'No extra notes specified.')}</p>

      <div class="item-card-actions">
        <button class="btn-smart-finder" onclick="openSmartFinderForItem('${item.id}')">
          <span>💡 Where Should I Look?</span>
        </button>
        <div class="secondary-actions-row">
          <button class="btn-card-action" onclick="openUpdateLocationModal('${item.id}', '${escapeHtml(item.name)}')">
            Update Spot
          </button>
          ${
            item.status === 'missing'
              ? `<button class="btn-card-action btn-mark-found" onclick="openMarkFoundModal('${item.id}')">Found!</button>`
              : `<button class="btn-card-action btn-mark-lost" onclick="toggleItemStatus('${item.id}', 'missing')">Mark Missing</button>`
          }
          <button class="btn-card-action" onclick="viewItemOnMap('${item.id}')" title="View on map">
            Map
          </button>
          <button class="btn-card-action" onclick="deleteItem('${item.id}', '${escapeHtml(item.name)}')" title="Delete" style="flex: 0; padding: 7px 10px; color: #DC2626;">
            🗑
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderRecentHomeItems(items) {
  renderItemsGrid(items, 'home-recent-items-grid');
}

// ======================== ADD NEW ITEM ======================== //

function setAddLocation(locName) {
  const input = document.getElementById('item-location');
  if (input) input.value = locName;
}

function handleImageSelection(event) {
  const file = event.target.files[0];
  if (!file) return;

  selectedImageFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    imageBase64Data = e.target.result;
    const preview = document.getElementById('image-preview');
    const container = document.getElementById('image-preview-container');
    const dropBox = document.getElementById('drop-upload-box');

    preview.src = imageBase64Data;
    container.style.display = 'block';
    dropBox.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

function removeImagePreview(event) {
  if (event && event.stopPropagation) event.stopPropagation();
  selectedImageFile = null;
  imageBase64Data = null;
  const fileInput = document.getElementById('file-upload-input');
  if (fileInput) fileInput.value = '';
  document.getElementById('image-preview').src = '';
  document.getElementById('image-preview-container').style.display = 'none';
  document.getElementById('drop-upload-box').style.display = 'block';
}

function initDragAndDrop() {
  const dropBox = document.getElementById('drop-upload-box');
  if (!dropBox) return;

  ['dragenter', 'dragover'].forEach(eventName => {
    dropBox.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropBox.style.borderColor = '#2563EB';
      dropBox.style.background = '#EFF6FF';
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropBox.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropBox.style.borderColor = '#CBD5E1';
      dropBox.style.background = '#F8FAFC';
    }, false);
  });

  dropBox.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const file = dt.files[0];
    if (file && file.type.startsWith('image/')) {
      const fileInput = document.getElementById('file-upload-input');
      fileInput.files = dt.files;
      handleImageSelection({ target: { files: [file] } });
    }
  });
}

function handleAddItemSubmit(event) {
  event.preventDefault();
  const btn = document.getElementById('btn-save-item');
  btn.disabled = true;
  btn.innerText = 'Saving Item...';

  const name = document.getElementById('item-name').value.trim();
  const category = document.getElementById('item-category').value;
  const lastLocation = document.getElementById('item-location').value.trim() || 'Classroom';
  const lastSeenDate = document.getElementById('item-date').value || new Date().toISOString().split('T')[0];
  const lastSeenTime = document.getElementById('item-time').value || new Date().toTimeString().slice(0, 5);
  const notes = document.getElementById('item-notes').value.trim();

  const coords = KNOWN_COORDS[lastLocation] || {
    lat: 12.9238 + (Math.random() - 0.5) * 0.003,
    lng: 77.4987 + (Math.random() - 0.5) * 0.003
  };

  const newItem = {
    id: 'item-' + Date.now(),
    name,
    category,
    status: 'missing',
    lastLocation,
    latitude: coords.lat,
    longitude: coords.lng,
    lastSeenDate,
    lastSeenTime,
    notes,
    imageUrl: imageBase64Data || CATEGORY_DEFAULT_ICONS[category] || './images/item.svg',
    createdAt: new Date().toISOString(),
    history: [
      {
        id: 'h-' + Date.now(),
        location: lastLocation,
        date: lastSeenDate,
        time: lastSeenTime,
        notes: notes || 'Initial entry',
        latitude: coords.lat,
        longitude: coords.lng
      }
    ]
  };

  const currentItems = getLocalItems();
  currentItems.unshift(newItem);
  saveLocalItems(currentItems);

  showToast(`"${name}" has been recorded in Last Seen memory!`);
  document.getElementById('add-item-form').reset();
  removeImagePreview();
  initDefaultDateTime();
  btn.disabled = false;
  btn.innerText = 'Save Item';

  navigateTo('items');
}

// ======================== UPDATE LOCATION ======================== //

function openUpdateLocationModal(itemId, itemName) {
  document.getElementById('update-item-id').value = itemId;
  document.getElementById('update-loc-name').value = '';
  document.getElementById('update-loc-notes').value = '';
  initDefaultDateTime();
  openModal('update-location-modal');
}

function setQuickUpdateLoc(loc) {
  document.getElementById('update-loc-name').value = loc;
}

function handleUpdateLocationSubmit(event) {
  event.preventDefault();
  const itemId = document.getElementById('update-item-id').value;
  const location = document.getElementById('update-loc-name').value.trim();
  const date = document.getElementById('update-loc-date').value || new Date().toISOString().split('T')[0];
  const time = document.getElementById('update-loc-time').value || new Date().toTimeString().slice(0, 5);
  const notes = document.getElementById('update-loc-notes').value.trim();

  const coords = KNOWN_COORDS[location] || {
    lat: 12.9238 + (Math.random() - 0.5) * 0.003,
    lng: 77.4987 + (Math.random() - 0.5) * 0.003
  };

  const currentItems = getLocalItems();
  const item = currentItems.find(i => i.id === itemId);
  if (item) {
    if (!item.history) item.history = [];
    item.history.unshift({
      id: 'h-' + Date.now(),
      location,
      date,
      time,
      notes,
      latitude: coords.lat,
      longitude: coords.lng
    });
    item.lastLocation = location;
    item.lastSeenDate = date;
    item.lastSeenTime = time;
    item.latitude = coords.lat;
    item.longitude = coords.lng;

    saveLocalItems(currentItems);
    showToast(`Updated spot to "${location}"!`);
    closeModal('update-location-modal');
    fetchItems();
    fetchHistory();
    fetchInsights();
  }
}

// ======================== STATUS (FOUND / MISSING) ======================== //

function openMarkFoundModal(itemId) {
  document.getElementById('mark-found-item-id').value = itemId;
  const currentItems = getLocalItems();
  const item = currentItems.find(i => i.id === itemId);
  document.getElementById('found-location-input').value = item ? item.lastLocation : 'Classroom';
  document.getElementById('found-notes-input').value = '';
  openModal('mark-found-modal');
}

function handleMarkFoundSubmit(event) {
  event.preventDefault();
  const itemId = document.getElementById('mark-found-item-id').value;
  const foundLocation = document.getElementById('found-location-input').value.trim();
  const notes = document.getElementById('found-notes-input').value.trim();

  const currentItems = getLocalItems();
  const item = currentItems.find(i => i.id === itemId);
  if (item) {
    item.status = 'found';
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().slice(0, 5);
    const coords = KNOWN_COORDS[foundLocation] || { lat: item.latitude, lng: item.longitude };

    if (!item.history) item.history = [];
    item.history.unshift({
      id: 'h-' + Date.now(),
      location: foundLocation,
      date: today,
      time: nowTime,
      notes: notes || `Recovered at ${foundLocation}`,
      latitude: coords.lat,
      longitude: coords.lng,
      isRecovery: true
    });
    item.lastLocation = foundLocation;
    item.lastSeenDate = today;
    item.lastSeenTime = nowTime;

    saveLocalItems(currentItems);
    showToast('🎉 Item marked as found! Location history updated.');
    closeModal('mark-found-modal');
    fetchItems();
    fetchInsights();
  }
}

function toggleItemStatus(itemId, newStatus) {
  const currentItems = getLocalItems();
  const item = currentItems.find(i => i.id === itemId);
  if (item) {
    item.status = newStatus;
    saveLocalItems(currentItems);
    showToast(`Status updated to ${newStatus}`);
    fetchItems();
    fetchInsights();
  }
}

function deleteItem(itemId, itemName) {
  if (!confirm(`Are you sure you want to delete "${itemName}" from your records?`)) return;
  let currentItems = getLocalItems();
  currentItems = currentItems.filter(i => i.id !== itemId);
  saveLocalItems(currentItems);
  showToast(`Deleted "${itemName}"`);
  fetchItems();
  fetchHistory();
  fetchInsights();
}

// ======================== LOCATION HISTORY & LEAFLET MAP ======================== //

function updateHistoryItemFilter(items) {
  const select = document.getElementById('history-item-filter');
  if (!select) return;

  const currentVal = select.value;
  select.innerHTML = `<option value="">All Items History</option>` +
    items.map(item => `<option value="${item.id}">${escapeHtml(item.name)} (${escapeHtml(item.category)})</option>`).join('');
  select.value = currentVal;
}

function fetchHistory() {
  const filterSelect = document.getElementById('history-item-filter');
  const itemId = filterSelect ? filterSelect.value : '';

  let itemsToScan = getLocalItems();
  if (itemId) {
    itemsToScan = itemsToScan.filter(i => i.id === itemId);
  }

  let allHistory = [];
  itemsToScan.forEach(item => {
    if (item.history && Array.isArray(item.history)) {
      item.history.forEach(entry => {
        allHistory.push({
          ...entry,
          itemId: item.id,
          itemName: item.name,
          category: item.category,
          status: item.status,
          imageUrl: item.imageUrl
        });
      });
    }
  });

  allHistory.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
    const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
    return dateB - dateA;
  });

  renderHistoryTimeline(allHistory);
  updateMapMarkers(allHistory);
}

function renderHistoryTimeline(historyList) {
  const container = document.getElementById('history-timeline-list');
  if (!container) return;

  if (historyList.length === 0) {
    container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem;">No location records found.</p>`;
    return;
  }

  container.innerHTML = historyList.map(h => `
    <div class="timeline-item" onclick="flyToMapCoordinate(${h.latitude}, ${h.longitude}, '${escapeHtml(h.location)}')">
      <div class="timeline-dot"></div>
      <div class="timeline-content-card">
        <div class="timeline-top">
          <span class="timeline-location-name">${escapeHtml(h.location)}</span>
          <span class="timeline-item-badge">${escapeHtml(h.itemName)}</span>
        </div>
        <div class="timeline-time">${formatDateTime(h.date, h.time)}</div>
        ${h.notes ? `<p class="timeline-notes">${escapeHtml(h.notes)}</p>` : ''}
      </div>
    </div>
  `).join('');
}

function initMapIfNeeded() {
  const mapEl = document.getElementById('history-map');
  if (!mapEl) return;

  if (!mapInstance) {
    const defaultCoords = [12.9238, 77.4987];
    mapInstance = L.map('history-map').setView(defaultCoords, 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors | RV University'
    }).addTo(mapInstance);
  } else {
    mapInstance.invalidateSize();
  }
}

function updateMapMarkers(historyList) {
  initMapIfNeeded();
  if (!mapInstance) return;

  mapMarkers.forEach(m => mapInstance.removeLayer(m));
  mapMarkers = [];

  const bounds = [];
  const locMap = new Map();

  historyList.forEach(entry => {
    if (entry.latitude && entry.longitude) {
      const key = `${entry.latitude.toFixed(4)},${entry.longitude.toFixed(4)}`;
      if (!locMap.has(key)) locMap.set(key, []);
      locMap.get(key).push(entry);
    }
  });

  locMap.forEach((entries) => {
    const lat = entries[0].latitude;
    const lng = entries[0].longitude;
    const locationName = entries[0].location;

    const popupHtml = `
      <div style="font-family: var(--font-sans); min-width: 180px;">
        <strong style="color: #2563EB; font-size: 1rem; display: block; margin-bottom: 6px;">📍 ${escapeHtml(locationName)}</strong>
        <p style="font-size: 0.8rem; color: #64748B; margin-bottom: 8px;">${entries.length} recorded movements</p>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          ${entries.slice(0, 3).map(e => `
            <div style="font-size: 0.8rem; background: #F1F5F9; padding: 4px 6px; border-radius: 4px;">
              <strong>${escapeHtml(e.itemName)}</strong> — ${formatDateTime(e.date, e.time)}
            </div>
          `).join('')}
        </div>
      </div>
    `;

    const marker = L.marker([lat, lng]).addTo(mapInstance).bindPopup(popupHtml);
    mapMarkers.push(marker);
    bounds.push([lat, lng]);
  });

  if (bounds.length > 0) {
    mapInstance.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });
  }
}

function flyToMapCoordinate(lat, lng, locName) {
  if (!mapInstance || !lat || !lng) return;
  mapInstance.flyTo([lat, lng], 17, { duration: 1.2 });
}

function viewItemOnMap(itemId) {
  navigateTo('history');
  setTimeout(() => {
    const filterSelect = document.getElementById('history-item-filter');
    if (filterSelect) {
      filterSelect.value = itemId;
      fetchHistory();
    }
  }, 100);
}

function useCurrentGpsLocation() {
  if (!navigator.geolocation) {
    showToast('Geolocation is not supported by your browser', 'error');
    return;
  }

  showToast('Fetching your current GPS coordinates...');
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      initMapIfNeeded();
      mapInstance.flyTo([lat, lng], 17);

      const userMarker = L.circleMarker([lat, lng], {
        radius: 9,
        fillColor: '#2563EB',
        color: '#FFFFFF',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.9
      }).addTo(mapInstance).bindPopup('<strong>📍 You are here</strong>').openPopup();

      mapMarkers.push(userMarker);
      showToast('Position pinpointed on map!');
    },
    (err) => {
      showToast('Unable to retrieve location: ' + err.message, 'error');
    }
  );
}

// ======================== "WHERE SHOULD I LOOK FIRST?" ======================== //

function populateSmartFinderDropdown() {
  const select = document.getElementById('smart-finder-item-select');
  if (!select) return;

  const currentItems = getLocalItems();
  const currentVal = select.value;
  select.innerHTML = currentItems.map(item => `
    <option value="${item.id}" ${item.status === 'missing' ? 'style="font-weight: bold; color: #DC2626;"' : ''}>
      ${item.name} (${item.status === 'missing' ? '🔴 Misplaced' : '🟢 Safe'})
    </option>
  `).join('');

  if (currentVal && currentItems.some(i => i.id === currentVal)) {
    select.value = currentVal;
  } else if (currentItems.length > 0) {
    const missing = currentItems.find(i => i.status === 'missing');
    select.value = missing ? missing.id : currentItems[0].id;
  }

  runSmartSuggestions();
}

function openSmartFinderForItem(itemId) {
  navigateTo('smart-finder');
  setTimeout(() => {
    const select = document.getElementById('smart-finder-item-select');
    if (select) {
      select.value = itemId;
      runSmartSuggestions();
    }
  }, 50);
}

function runSmartSuggestions() {
  const select = document.getElementById('smart-finder-item-select');
  const container = document.getElementById('smart-suggestion-results');
  if (!select || !container) return;

  const itemId = select.value;
  const currentItems = getLocalItems();
  const item = currentItems.find(i => i.id === itemId);

  if (!item) {
    container.innerHTML = `<p style="color: var(--text-muted);">Please add items first to run smart suggestions.</p>`;
    return;
  }

  const history = item.history || [];
  const locationCounts = {};
  history.forEach(h => {
    const loc = h.location || 'Everyday Spot';
    locationCounts[loc] = (locationCounts[loc] || 0) + 1;
  });

  const totalEntries = history.length || 1;
  const sortedLocations = Object.entries(locationCounts)
    .map(([loc, count]) => ({
      location: loc,
      count,
      probability: Math.round((count / totalEntries) * 100)
    }))
    .sort((a, b) => b.count - a.count);

  const topRecommendation = sortedLocations[0]?.location || item.lastLocation || 'Classroom';
  const topProb = sortedLocations[0]?.probability || 100;

  const actionChecklist = [
    `Search ${topRecommendation} first: You have logged or recovered this item here in ${topProb}% of past records.`,
    `Check nearby surfaces: Desks, charging stations, and seat gaps in ${topRecommendation}.`,
    `Ask the designated helpdesk or lost-and-found registry at ${topRecommendation}.`,
    `If not at ${topRecommendation}, immediately check your second most frequent spot (${sortedLocations[1]?.location || 'Hostel'}).`
  ];

  const heuristicMessage = `Based on analysis of ${totalEntries} previous location entries, "${item.name}" is statistically most frequently placed at ${topRecommendation}.`;

  container.innerHTML = `
    <div class="smart-analysis-container">
      <div class="spotlight-recommendation">
        <div class="spotlight-badge">★ Highest Probability Spot</div>
        <div class="spotlight-location">${escapeHtml(topRecommendation)}</div>
        <div class="spotlight-prob">${topProb}% of historical instances</div>
        <p class="spotlight-text">${escapeHtml(heuristicMessage)}</p>

        <button class="btn-found-spotlight" onclick="markFoundFromSpotlight('${item.id}', '${escapeHtml(topRecommendation)}')">
          <span>✓ Found It Here!</span>
        </button>
      </div>

      <div class="frequency-breakdown-card">
        <h3 class="breakdown-title">Statistical Place Breakdown</h3>
        <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 16px;">
          Frequency based on your past ${totalEntries} records:
        </p>
        ${sortedLocations.map((s, idx) => `
          <div class="probability-bar-row">
            <div class="prob-labels">
              <span>${idx + 1}. ${escapeHtml(s.location)}</span>
              <span>${s.probability}% (${s.count} logs)</span>
            </div>
            <div class="prob-progress-bg">
              <div class="prob-progress-fill ${idx === 0 ? 'top-rank' : ''}" style="width: ${s.probability}%"></div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="action-checklist-box">
      <h3 class="checklist-title">
        <span>📋 Systematic Search Plan for "${escapeHtml(item.name)}"</span>
      </h3>
      <ul class="checklist-items">
        ${actionChecklist.map(tip => `
          <li class="checklist-item">
            <span class="checklist-check">✓</span>
            <span>${escapeHtml(tip)}</span>
          </li>
        `).join('')}
      </ul>
    </div>
  `;
}

function markFoundFromSpotlight(itemId, location) {
  const currentItems = getLocalItems();
  const item = currentItems.find(i => i.id === itemId);
  if (item) {
    item.status = 'found';
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().slice(0, 5);
    const coords = KNOWN_COORDS[location] || { lat: item.latitude, lng: item.longitude };

    if (!item.history) item.history = [];
    item.history.unshift({
      id: 'h-' + Date.now(),
      location: location,
      date: today,
      time: nowTime,
      notes: `Recovered at predicted spot: ${location}`,
      latitude: coords.lat,
      longitude: coords.lng,
      isRecovery: true
    });
    item.lastLocation = location;
    item.lastSeenDate = today;
    item.lastSeenTime = nowTime;

    saveLocalItems(currentItems);
    showToast(`🎉 High five! Recovered "${item.name}" at ${location}!`);
    fetchItems();
    fetchInsights();
    runSmartSuggestions();
  }
}

// ======================== INSIGHTS & STATS ======================== //

function fetchInsights() {
  const items = getLocalItems();

  const totalItems = items.length;
  const missingItems = items.filter(i => i.status === 'missing').length;
  const foundItems = items.filter(i => i.status === 'found').length;
  const recoveryRate = totalItems > 0 ? Math.round((foundItems / totalItems) * 100) : 0;

  const totalEl = document.getElementById('stat-total-items');
  const missingEl = document.getElementById('stat-missing-items');
  const foundEl = document.getElementById('stat-found-items');
  const rateEl = document.getElementById('stat-recovery-rate');

  if (totalEl) totalEl.innerText = totalItems;
  if (missingEl) missingEl.innerText = missingItems;
  if (foundEl) foundEl.innerText = foundItems;
  if (rateEl) rateEl.innerText = `${recoveryRate}%`;

  const locationOccurrences = {};
  const categoryCount = {};

  items.forEach(item => {
    categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
    if (item.history) {
      item.history.forEach(h => {
        locationOccurrences[h.location] = (locationOccurrences[h.location] || 0) + 1;
      });
    }
  });

  const topLocations = Object.entries(locationOccurrences)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count);

  const categories = Object.entries(categoryCount)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const hotspotsList = document.getElementById('hotspots-list');
  if (hotspotsList) {
    hotspotsList.innerHTML = topLocations.slice(0, 5).map(h => `
      <li class="hotspot-row">
        <span class="hotspot-name">📍 ${escapeHtml(h.location)}</span>
        <span class="hotspot-badge">${h.count} recordings</span>
      </li>
    `).join('') || '<p style="color: var(--text-muted);">No hotspots recorded yet.</p>';
  }

  const catList = document.getElementById('categories-list');
  if (catList) {
    catList.innerHTML = categories.map(c => `
      <li class="hotspot-row">
        <span class="hotspot-name">${escapeHtml(c.category)}</span>
        <span class="hotspot-badge" style="background: #F1F5F9; color: var(--text-main);">${c.count} items</span>
      </li>
    `).join('') || '<p style="color: var(--text-muted);">No categories recorded yet.</p>';
  }
}

// Reset data helper
function resetToInitialData() {
  if (!confirm('Reset all items to original assignment sample data?')) return;
  localStorage.setItem('last_seen_items_data', JSON.stringify(SEED_ITEMS));
  showToast('Database reset to assignment sample data successfully!');
  closeModal('ip-info-modal');
  fetchItems();
  fetchHistory();
  fetchInsights();
}

// ======================== MODAL CONTROLS ======================== //

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
}

function openIpModal() {
  openModal('ip-info-modal');
}

function openProfileModal() {
  openModal('ip-info-modal');
}

document.querySelectorAll('.modal-backdrop').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
});

// ======================== HELPERS ======================== //

function formatDateTime(dateStr, timeStr) {
  if (!dateStr) return 'Just now';
  try {
    const d = new Date(dateStr + (timeStr ? `T${timeStr}` : ''));
    if (isNaN(d.getTime())) return `${dateStr} ${timeStr || ''}`;

    const dateFormatted = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeFormatted = timeStr ? d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
    return `${dateFormatted}${timeFormatted ? ', ' + timeFormatted : ''}`;
  } catch (e) {
    return `${dateStr} ${timeStr || ''}`;
  }
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
