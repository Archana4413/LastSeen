/**
 * LAST SEEN - Client Application JavaScript
 * Academic Project: TraceMates (Archana BS & Gedila Bimala)
 * RV University - 2026
 */

let allItems = [];
let activeStatusFilter = 'all';
let mapInstance = null;
let mapMarkers = [];
let searchDebounceTimeout = null;
let selectedImageFile = null;

// Initialize app on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initDefaultDateTime();
  initDragAndDrop();
  fetchItems();
  fetchInsights();

  // Listen for browser popstate or hash
  const hash = window.location.hash.replace('#', '') || 'home';
  navigateTo(hash, false);
});

// Set current date & time as defaults in inputs
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

// Navigation between views
function navigateTo(viewId, updateHash = true) {
  const validViews = ['home', 'items', 'add', 'history', 'smart-finder', 'insights'];
  const target = validViews.includes(viewId) ? viewId : 'home';

  // Toggle view visibility
  document.querySelectorAll('.app-view').forEach(view => {
    view.classList.remove('active');
  });
  const targetEl = document.getElementById(`view-${target}`);
  if (targetEl) targetEl.classList.add('active');

  // Update active nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-nav') === target);
  });

  if (updateHash) {
    window.location.hash = target;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // View specific triggers
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

// Toast notification helper
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
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

// ======================== ITEMS API & RENDERING ======================== //

function debounceFetchItems() {
  clearTimeout(searchDebounceTimeout);
  searchDebounceTimeout = setTimeout(fetchItems, 250);
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

  const search = searchInput ? searchInput.value.trim() : '';
  const category = categorySelect ? categorySelect.value : 'All';
  const status = activeStatusFilter;

  let url = `/api/items?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}&status=${encodeURIComponent(status)}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.success) {
      allItems = data.items;
      renderItemsGrid(allItems, 'items-grid');
      renderRecentHomeItems(allItems.slice(0, 3));
      updateHistoryItemFilter(allItems);
    }
  } catch (err) {
    console.error('Failed to fetch items:', err);
  }
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
          <img src="${item.imageUrl || '/images/item.svg'}" alt="${escapeHtml(item.name)}">
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
    const preview = document.getElementById('image-preview');
    const container = document.getElementById('image-preview-container');
    const dropBox = document.getElementById('drop-upload-box');

    preview.src = e.target.result;
    container.style.display = 'block';
    dropBox.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

function removeImagePreview(event) {
  event.stopPropagation();
  selectedImageFile = null;
  document.getElementById('file-upload-input').value = '';
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

async function handleAddItemSubmit(event) {
  event.preventDefault();
  const btn = document.getElementById('btn-save-item');
  btn.disabled = true;
  btn.innerText = 'Saving Item...';

  const name = document.getElementById('item-name').value.trim();
  const category = document.getElementById('item-category').value;
  const lastLocation = document.getElementById('item-location').value.trim();
  const lastSeenDate = document.getElementById('item-date').value;
  const lastSeenTime = document.getElementById('item-time').value;
  const notes = document.getElementById('item-notes').value.trim();

  const formData = new FormData();
  formData.append('name', name);
  formData.append('category', category);
  formData.append('lastLocation', lastLocation || 'Classroom');
  formData.append('lastSeenDate', lastSeenDate);
  formData.append('lastSeenTime', lastSeenTime);
  formData.append('notes', notes);

  if (selectedImageFile) {
    formData.append('image', selectedImageFile);
  }

  try {
    const res = await fetch('/api/items', {
      method: 'POST',
      body: formData
    });
    const result = await res.json();

    if (result.success) {
      showToast(`"${name}" has been recorded in Last Seen memory!`);
      // Reset form
      document.getElementById('add-item-form').reset();
      removeImagePreview({ stopPropagation: () => {} });
      initDefaultDateTime();
      navigateTo('items');
    } else {
      showToast(result.message || 'Error saving item', 'error');
    }
  } catch (err) {
    console.error('Add item error:', err);
    showToast('Failed to connect to server', 'error');
  } finally {
    btn.disabled = false;
    btn.innerText = 'Save Item';
  }
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

async function handleUpdateLocationSubmit(event) {
  event.preventDefault();
  const itemId = document.getElementById('update-item-id').value;
  const location = document.getElementById('update-loc-name').value.trim();
  const date = document.getElementById('update-loc-date').value;
  const time = document.getElementById('update-loc-time').value;
  const notes = document.getElementById('update-loc-notes').value.trim();

  try {
    const res = await fetch(`/api/items/${itemId}/location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location, date, time, notes })
    });
    const result = await res.json();

    if (result.success) {
      showToast(`Updated spot to "${location}"!`);
      closeModal('update-location-modal');
      fetchItems();
      fetchHistory();
      fetchInsights();
    } else {
      showToast(result.message || 'Failed to update spot', 'error');
    }
  } catch (err) {
    showToast('Network error', 'error');
  }
}

// ======================== STATUS (FOUND / MISSING) ======================== //

function openMarkFoundModal(itemId) {
  document.getElementById('mark-found-item-id').value = itemId;
  const item = allItems.find(i => i.id === itemId);
  document.getElementById('found-location-input').value = item ? item.lastLocation : 'Classroom';
  document.getElementById('found-notes-input').value = '';
  openModal('mark-found-modal');
}

async function handleMarkFoundSubmit(event) {
  event.preventDefault();
  const itemId = document.getElementById('mark-found-item-id').value;
  const foundLocation = document.getElementById('found-location-input').value.trim();
  const notes = document.getElementById('found-notes-input').value.trim();

  try {
    const res = await fetch(`/api/items/${itemId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'found', foundLocation, notes })
    });
    const data = await res.json();
    if (data.success) {
      showToast('🎉 Item marked as found! Location history updated.');
      closeModal('mark-found-modal');
      fetchItems();
      fetchInsights();
    }
  } catch (err) {
    showToast('Failed to update status', 'error');
  }
}

async function toggleItemStatus(itemId, newStatus) {
  try {
    const res = await fetch(`/api/items/${itemId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Status updated to ${newStatus}`);
      fetchItems();
      fetchInsights();
    }
  } catch (err) {
    showToast('Failed to update status', 'error');
  }
}

async function deleteItem(itemId, itemName) {
  if (!confirm(`Are you sure you want to delete "${itemName}" from your records?`)) return;

  try {
    const res = await fetch(`/api/items/${itemId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast(`Deleted "${itemName}"`);
      fetchItems();
      fetchHistory();
      fetchInsights();
    }
  } catch (err) {
    showToast('Failed to delete item', 'error');
  }
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

async function fetchHistory() {
  const filterSelect = document.getElementById('history-item-filter');
  const itemId = filterSelect ? filterSelect.value : '';

  try {
    const res = await fetch(`/api/locations/history?itemId=${itemId}`);
    const data = await res.json();
    if (data.success) {
      renderHistoryTimeline(data.history);
      updateMapMarkers(data.history);
    }
  } catch (err) {
    console.error('History fetch error:', err);
  }
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
    // RV University campus coordinates
    const defaultCoords = [12.9238, 77.4987];
    mapInstance = L.map('history-map').setView(defaultCoords, 16);

    // OpenStreetMap tiles
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

  // Clear existing markers
  mapMarkers.forEach(m => mapInstance.removeLayer(m));
  mapMarkers = [];

  const bounds = [];

  // Group by coordinates to avoid overlapping
  const locMap = new Map();
  historyList.forEach(entry => {
    if (entry.latitude && entry.longitude) {
      const key = `${entry.latitude.toFixed(4)},${entry.longitude.toFixed(4)}`;
      if (!locMap.has(key)) locMap.set(key, []);
      locMap.get(key).push(entry);
    }
  });

  locMap.forEach((entries, key) => {
    const lat = entries[0].latitude;
    const lng = entries[0].longitude;
    const locationName = entries[0].location;

    const popupHtml = `
      <div style="font-family: var(--font-sans); min-width: 180px;">
        <strong style="color: #2563EB; font-size: 1rem; display: block; margin-bottom: 6px;">📍 ${escapeHtml(locationName)}</strong>
        <p style="font-size: 0.8rem; color: #64748B; margin-bottom: 8px;">${entries.length} recorded visits</p>
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

// MDN Web Docs Geolocation API integration (as mentioned in section 11 of document)
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
      showToast('Unable to retrieve your location: ' + err.message, 'error');
    }
  );
}

// ======================== "WHERE SHOULD I LOOK FIRST?" ======================== //

function populateSmartFinderDropdown() {
  const select = document.getElementById('smart-finder-item-select');
  if (!select) return;

  const currentVal = select.value;
  select.innerHTML = allItems.map(item => `
    <option value="${item.id}" ${item.status === 'missing' ? 'style="font-weight: bold; color: #DC2626;"' : ''}>
      ${item.name} (${item.status === 'missing' ? '🔴 Misplaced' : '🟢 Safe'})
    </option>
  `).join('');

  if (currentVal && allItems.some(i => i.id === currentVal)) {
    select.value = currentVal;
  } else if (allItems.length > 0) {
    // Prefer selecting the first missing item
    const missing = allItems.find(i => i.status === 'missing');
    select.value = missing ? missing.id : allItems[0].id;
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

async function runSmartSuggestions() {
  const select = document.getElementById('smart-finder-item-select');
  const container = document.getElementById('smart-suggestion-results');
  if (!select || !container) return;

  const itemId = select.value;
  if (!itemId) {
    container.innerHTML = `<p style="color: var(--text-muted);">Please add items first to run smart suggestions.</p>`;
    return;
  }

  try {
    const res = await fetch(`/api/suggestions/${itemId}`);
    const data = await res.json();
    if (!data.success) {
      container.innerHTML = `<p style="color: var(--danger);">Failed to calculate suggestions.</p>`;
      return;
    }

    const { item, suggestions, topRecommendation, actionChecklist, heuristicMessage } = data;

    container.innerHTML = `
      <div class="smart-analysis-container">
        <!-- Left: Spotlight recommendation -->
        <div class="spotlight-recommendation">
          <div class="spotlight-badge">★ Highest Probability Spot</div>
          <div class="spotlight-location">${escapeHtml(topRecommendation)}</div>
          <div class="spotlight-prob">${suggestions[0]?.probability || 100}% of historical instances</div>
          <p class="spotlight-text">${escapeHtml(heuristicMessage)}</p>

          <button class="btn-found-spotlight" onclick="markFoundFromSpotlight('${item.id}', '${escapeHtml(topRecommendation)}')">
            <span>✓ Found It Here!</span>
          </button>
        </div>

        <!-- Right: Probability Breakdown -->
        <div class="frequency-breakdown-card">
          <h3 class="breakdown-title">Statistical Place Breakdown</h3>
          <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 16px;">
            Frequency based on your past ${item.history ? item.history.length : 1} records:
          </p>
          ${suggestions.map((s, idx) => `
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

      <!-- Action Checklist for Lost Item Recovery -->
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
  } catch (err) {
    console.error('Smart suggestion error:', err);
  }
}

async function markFoundFromSpotlight(itemId, location) {
  try {
    const res = await fetch(`/api/items/${itemId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'found', foundLocation: location, notes: `Found at predicted spot: ${location}` })
    });
    const data = await res.json();
    if (data.success) {
      showToast(`🎉 High five! Recovered "${data.item.name}" at ${location}!`);
      fetchItems();
      fetchInsights();
      runSmartSuggestions();
    }
  } catch (err) {
    showToast('Failed to mark found', 'error');
  }
}

// ======================== INSIGHTS & STATS ======================== //

async function fetchInsights() {
  try {
    const res = await fetch('/api/insights');
    const data = await res.json();
    if (data.success) {
      const { stats, topLocations, categories } = data;

      document.getElementById('stat-total-items').innerText = stats.totalItems;
      document.getElementById('stat-missing-items').innerText = stats.missingItems;
      document.getElementById('stat-found-items').innerText = stats.foundItems;
      document.getElementById('stat-recovery-rate').innerText = `${stats.recoveryRate}%`;

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
  } catch (err) {
    console.error('Insights fetch error:', err);
  }
}

// Reset data helper
async function resetToInitialData() {
  if (!confirm('Reset all items to original assignment sample data?')) return;
  try {
    const res = await fetch('/api/reset-data', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      showToast(data.message);
      closeModal('ip-info-modal');
      fetchItems();
      fetchHistory();
      fetchInsights();
    }
  } catch (err) {
    showToast('Reset failed', 'error');
  }
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

// Close modals on clicking backdrop
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
