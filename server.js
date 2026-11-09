const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Ensure data & upload directories exist
const dataDir = path.join(__dirname, 'data');
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const dbPath = path.join(dataDir, 'db.json');
const initialDataPath = path.join(dataDir, 'initial-data.json');

// Helper to read & write DB
function loadDB() {
  if (!fs.existsSync(dbPath)) {
    if (fs.existsSync(initialDataPath)) {
      const initial = fs.readFileSync(initialDataPath, 'utf8');
      fs.writeFileSync(dbPath, initial);
      return JSON.parse(initial);
    }
    const emptyDB = { items: [], knownLocations: [] };
    fs.writeFileSync(dbPath, JSON.stringify(emptyDB, null, 2));
    return emptyDB;
  }
  try {
    const raw = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db.json, recreating from initial-data:', err);
    if (fs.existsSync(initialDataPath)) {
      const initial = fs.readFileSync(initialDataPath, 'utf8');
      fs.writeFileSync(dbPath, initial);
      return JSON.parse(initial);
    }
    return { items: [], knownLocations: [] };
  }
}

function saveDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// Multer storage for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, 'item-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  }
});

// Category to default icon map
const CATEGORY_ICONS = {
  'Keys & Keychains': '/images/keys.svg',
  'Electronics & Laptops': '/images/laptop.svg',
  'Wallets & Purses': '/images/wallet.svg',
  'Audio & Earphones': '/images/headphones.svg',
  'ID Cards & Documents': '/images/idcard.svg',
  'Books & Notebooks': '/images/book.svg',
  'Bags & Backpacks': '/images/bag.svg',
  'Accessories': '/images/accessories.svg',
  'Other': '/images/item.svg'
};

// Known campus location coordinates (RV University Bengaluru campus reference)
const DEFAULT_LOCATIONS = {
  'Classroom': { lat: 12.9238, lng: 77.4987 },
  'Library': { lat: 12.9249, lng: 77.5002 },
  'Cafeteria': { lat: 12.9231, lng: 77.4994 },
  'Hostel': { lat: 12.9221, lng: 77.4975 },
  'Computer Lab': { lat: 12.9242, lng: 77.4981 },
  'Sports Ground': { lat: 12.9215, lng: 77.5015 },
  'Home / Off-Campus': { lat: 12.9280, lng: 77.4950 }
};

// ======================== API ROUTES ======================== //

// 1. Get all items with optional search & filter
app.get('/api/items', (req, res) => {
  const db = loadDB();
  let items = db.items || [];
  const { search, category, status } = req.query;

  if (search) {
    const q = search.toLowerCase();
    items = items.filter(i =>
      i.name.toLowerCase().includes(q) ||
      (i.notes && i.notes.toLowerCase().includes(q)) ||
      (i.lastLocation && i.lastLocation.toLowerCase().includes(q)) ||
      (i.category && i.category.toLowerCase().includes(q))
    );
  }

  if (category && category !== 'All') {
    items = items.filter(i => i.category === category);
  }

  if (status && status !== 'all') {
    items = items.filter(i => i.status === status);
  }

  res.json({ success: true, count: items.length, items });
});

// 2. Get single item by ID
app.get('/api/items/:id', (req, res) => {
  const db = loadDB();
  const item = db.items.find(i => i.id === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Item not found' });
  }
  res.json({ success: true, item });
});

// 3. Create new item
app.post('/api/items', upload.single('image'), (req, res) => {
  const db = loadDB();
  const { name, category, lastLocation, notes, lastSeenDate, lastSeenTime, latitude, longitude } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Item name is required' });
  }

  const itemId = 'item-' + Date.now();
  const cat = category || 'Other';
  const loc = (lastLocation && lastLocation.trim()) ? lastLocation.trim() : 'Unknown';

  let imgUrl = CATEGORY_ICONS[cat] || '/images/item.svg';
  if (req.file) {
    imgUrl = `/uploads/${req.file.filename}`;
  } else if (req.body.imageUrl) {
    imgUrl = req.body.imageUrl;
  }

  // Location coordinates
  let lat = latitude ? parseFloat(latitude) : null;
  let lng = longitude ? parseFloat(longitude) : null;
  if (!lat && DEFAULT_LOCATIONS[loc]) {
    lat = DEFAULT_LOCATIONS[loc].lat;
    lng = DEFAULT_LOCATIONS[loc].lng;
  } else if (!lat) {
    // RV University default coordinate with slight jitter for visual distinction
    lat = 12.9238 + (Math.random() - 0.5) * 0.003;
    lng = 77.4987 + (Math.random() - 0.5) * 0.003;
  }

  const today = new Date().toISOString().split('T')[0];
  const nowTime = new Date().toTimeString().slice(0, 5);
  const recordDate = lastSeenDate || today;
  const recordTime = lastSeenTime || nowTime;

  const newItem = {
    id: itemId,
    name: name.trim(),
    category: cat,
    status: 'missing',
    lastLocation: loc,
    latitude: lat,
    longitude: lng,
    lastSeenDate: recordDate,
    lastSeenTime: recordTime,
    notes: notes ? notes.trim() : '',
    imageUrl: imgUrl,
    createdAt: new Date().toISOString(),
    history: [
      {
        id: 'h-' + Date.now(),
        location: loc,
        date: recordDate,
        time: recordTime,
        notes: notes ? notes.trim() : 'Initial recorded location',
        latitude: lat,
        longitude: lng
      }
    ]
  };

  db.items.unshift(newItem);
  saveDB(db);

  res.status(201).json({ success: true, item: newItem, message: 'Item added successfully' });
});

// 4. Update item status (missing / found)
app.patch('/api/items/:id/status', (req, res) => {
  const db = loadDB();
  const itemIndex = db.items.findIndex(i => i.id === req.params.id);
  if (itemIndex === -1) {
    return res.status(404).json({ success: false, message: 'Item not found' });
  }

  const { status, foundLocation, notes } = req.body;
  if (!status || !['missing', 'found'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  const item = db.items[itemIndex];
  item.status = status;

  // If found, append to history where it was actually found to refine the "Where Should I Look First" algorithm!
  if (status === 'found' && (foundLocation || notes)) {
    const loc = foundLocation || item.lastLocation;
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().slice(0, 5);

    let lat = DEFAULT_LOCATIONS[loc]?.lat || item.latitude;
    let lng = DEFAULT_LOCATIONS[loc]?.lng || item.longitude;

    item.history.unshift({
      id: 'h-' + Date.now(),
      location: loc,
      date: today,
      time: nowTime,
      notes: notes || `Recovered / Found at ${loc}`,
      latitude: lat,
      longitude: lng,
      isRecovery: true
    });
    item.lastLocation = loc;
    item.lastSeenDate = today;
    item.lastSeenTime = nowTime;
  }

  saveDB(db);
  res.json({ success: true, item, message: `Item marked as ${status}` });
});

// 5. Add new location update to an item
app.post('/api/items/:id/location', (req, res) => {
  const db = loadDB();
  const itemIndex = db.items.findIndex(i => i.id === req.params.id);
  if (itemIndex === -1) {
    return res.status(404).json({ success: false, message: 'Item not found' });
  }

  const { location, date, time, notes, latitude, longitude } = req.body;
  if (!location || !location.trim()) {
    return res.status(400).json({ success: false, message: 'Location is required' });
  }

  const loc = location.trim();
  const today = date || new Date().toISOString().split('T')[0];
  const nowTime = time || new Date().toTimeString().slice(0, 5);

  let lat = latitude ? parseFloat(latitude) : (DEFAULT_LOCATIONS[loc]?.lat || 12.9238 + (Math.random() - 0.5) * 0.003);
  let lng = longitude ? parseFloat(longitude) : (DEFAULT_LOCATIONS[loc]?.lng || 77.4987 + (Math.random() - 0.5) * 0.003);

  const historyEntry = {
    id: 'h-' + Date.now(),
    location: loc,
    date: today,
    time: nowTime,
    notes: notes ? notes.trim() : '',
    latitude: lat,
    longitude: lng
  };

  const item = db.items[itemIndex];
  if (!item.history) item.history = [];
  item.history.unshift(historyEntry);

  item.lastLocation = loc;
  item.lastSeenDate = today;
  item.lastSeenTime = nowTime;
  item.latitude = lat;
  item.longitude = lng;

  saveDB(db);
  res.json({ success: true, item, message: 'Location updated successfully' });
});

// 6. Delete item
app.delete('/api/items/:id', (req, res) => {
  const db = loadDB();
  const itemIndex = db.items.findIndex(i => i.id === req.params.id);
  if (itemIndex === -1) {
    return res.status(404).json({ success: false, message: 'Item not found' });
  }

  const deleted = db.items.splice(itemIndex, 1);
  saveDB(db);
  res.json({ success: true, message: 'Item deleted', item: deleted[0] });
});

// 7. Aggregate location history across all items or single item
app.get('/api/locations/history', (req, res) => {
  const db = loadDB();
  const { itemId, search } = req.query;

  let allHistory = [];
  let itemsToScan = db.items || [];

  if (itemId) {
    itemsToScan = itemsToScan.filter(i => i.id === itemId);
  }

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

  if (search) {
    const q = search.toLowerCase();
    allHistory = allHistory.filter(h =>
      h.location.toLowerCase().includes(q) ||
      h.itemName.toLowerCase().includes(q) ||
      (h.notes && h.notes.toLowerCase().includes(q))
    );
  }

  // Sort newest first
  allHistory.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
    const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
    return dateB - dateA;
  });

  res.json({ success: true, count: allHistory.length, history: allHistory });
});

// 8. Core Distinctive Feature: "Where Should I Look First?" Algorithm
app.get('/api/suggestions/:id', (req, res) => {
  const db = loadDB();
  const item = db.items.find(i => i.id === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Item not found' });
  }

  const history = item.history || [];
  if (history.length === 0) {
    return res.json({
      success: true,
      item,
      suggestions: [
        {
          location: item.lastLocation || 'Everyday Spot',
          probability: 100,
          count: 1,
          tip: 'This is the only recorded location for this item. Begin your search right here.'
        }
      ],
      heuristicMessage: 'Based on your initial entry.'
    });
  }

  // 1. Calculate occurrence frequency
  const locationCounts = {};
  history.forEach(h => {
    const loc = h.location || 'Unknown';
    locationCounts[loc] = (locationCounts[loc] || 0) + 1;
  });

  const totalEntries = history.length;
  const sortedLocations = Object.entries(locationCounts)
    .map(([loc, count]) => {
      const percentage = Math.round((count / totalEntries) * 100);
      return {
        location: loc,
        count,
        probability: percentage,
        latitude: DEFAULT_LOCATIONS[loc]?.lat || item.latitude,
        longitude: DEFAULT_LOCATIONS[loc]?.lng || item.longitude
      };
    })
    .sort((a, b) => b.count - a.count);

  // 2. Generate smart contextual tips and advice based on item type & top spot
  const topLocation = sortedLocations[0]?.location || 'Classroom';
  const tips = [
    `Search ${topLocation} first: You have logged or recovered this item here in ${sortedLocations[0]?.probability}% of your past records.`,
    `Check nearby surfaces: Desks, charging stations, and seat gaps in ${topLocation}.`,
    `Ask the designated helpdesk or lost-and-found registry at ${topLocation}.`,
    `If not at ${topLocation}, immediately check your second most frequent spot (${sortedLocations[1]?.location || 'Hostel'}).`
  ];

  res.json({
    success: true,
    item,
    totalRecordsAnalyzed: totalEntries,
    suggestions: sortedLocations,
    topRecommendation: topLocation,
    actionChecklist: tips,
    heuristicMessage: `Based on analysis of ${totalEntries} previous location entries, "${item.name}" is statistically most frequently placed at ${topLocation}.`
  });
});

// 9. Insights and analytics
app.get('/api/insights', (req, res) => {
  const db = loadDB();
  const items = db.items || [];

  const totalItems = items.length;
  const missingItems = items.filter(i => i.status === 'missing').length;
  const foundItems = items.filter(i => i.status === 'found').length;
  const recoveryRate = totalItems > 0 ? Math.round((foundItems / totalItems) * 100) : 0;

  // Misplacement hotspots
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

  res.json({
    success: true,
    stats: {
      totalItems,
      missingItems,
      foundItems,
      recoveryRate
    },
    topLocations,
    categories
  });
});

// 10. Reset DB endpoint for easy testing
app.post('/api/reset-data', (req, res) => {
  if (fs.existsSync(initialDataPath)) {
    const initial = fs.readFileSync(initialDataPath, 'utf8');
    fs.writeFileSync(dbPath, initial);
    return res.json({ success: true, message: 'Database reset to initial sample data successfully!' });
  }
  res.status(500).json({ success: false, message: 'Initial data file missing' });
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`📍 Last Seen - A Personal Lost-Item Memory Website`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🎓 Team TraceMates | RV University (2026)`);
  console.log(`====================================================`);
});
