# 📍 Last Seen – A Personal Lost-Item Memory Website

> **"Find What Matters — Keep track of your belongings, check their last seen location and get smart suggestions on where to look first."**

An intelligent, personal lost-item tracking and memory website designed to solve the everyday problem of misplacing belongings (keys, laptop, wallet, earphones, ID cards, books) on campus or at home.

---

## 🎓 Academic & IP Details

- **Course:** IP in Design
- **Team Name:** TraceMates
- **Team Members:**
  - **Archana BS** (USN: `1RUA24SCS0011`) — *Website Development, Functionality & Research*
  - **Gedila Bimala** (USN: `1RUA24SCS0037`) — *UI/UX Design, Content & Documentation*
- **Institution:** RV University (RVU), Bengaluru
- **Academic Year:** 2026
- **Primary IP Protection:** **Copyright** (UI/UX design, visual dashboard layout, original graphics, software source code, interactive location history, and the proprietary *"Where Should I Look First?"* algorithmic recommendation interface under Indian Copyright Office / WIPO guidelines).

---

## ✨ Key Features

1. **Item Catalog & Tracking:**
   - Record item name, category, last-seen location, notes, and photos.
   - Status indicators: `Missing` (Amber/Red) vs `Found` (Green).
2. **Interactive Location History & Campus Map:**
   - Chronological timeline with location tags and timestamps (Library, Classroom, Cafeteria, Hostel).
   - Interactive Leaflet.js / OpenStreetMap map centered at campus coordinates with custom map pins and popups.
   - Integrated with HTML5 / MDN Geolocation API for device GPS lookup.
3. **✨ "Where Should I Look First?" (Novel Smart Feature):**
   - Statistical recommendation engine calculating location frequency probabilities.
   - Generates actionable search checklists and highlights the highest-likelihood spot.
   - One-click *"Found It Here!"* recovery button that logs memory to refine future predictions.
4. **Insights & Hotspot Analytics:**
   - Real-time recovery rates, item misplacement distribution, and campus hotspot breakdown.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### 2. Install & Run
```bash
# Clone or navigate to the project directory
cd "c:\Users\Lenovo\Downloads\Last Seen"

# Install dependencies
npm install

# Start the web server
npm start
```

Open your browser at:
```
http://localhost:3000
```

---

## 🌐 Deploy to Render (Step-by-Step Guide)

You can deploy this application on [Render](https://render.com) for **100% free** in less than 3 minutes.

### Method 1: Deploy via GitHub (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Last Seen website"
   git branch -M main
   # Create a new repository on https://github.com/new and link it:
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git
   git push -u origin main
   ```

2. **Create a Free Web Service on Render:**
   - Log in to your [Render Dashboard](https://dashboard.render.com).
   - Click **"New +"** in the top right corner and select **"Web Service"**.
   - Select **"Build and deploy from a Git repository"** and connect your GitHub repository.
   - Configure the following settings (most will be autofilled):
     - **Name:** `last-seen-memory` (or any name you choose)
     - **Region:** Any (e.g. *Oregon, US* or *Singapore*)
     - **Branch:** `main` (or `master`)
     - **Runtime:** `Node`
     - **Build Command:** `npm install`
     - **Start Command:** `node server.js`
     - **Instance Type:** `Free`
   - Click **"Deploy Web Service"**.

3. **Your Live Website:**
   Render will automatically build and publish your web app. Within 1–2 minutes, you will receive a free live HTTPS URL:
   ```
   https://last-seen-memory.onrender.com
   ```

---

### Method 2: Deploy using Render Blueprint (`render.yaml`)

This repository already includes a pre-configured `render.yaml` blueprint.

1. Push this repository to GitHub.
2. In the Render Dashboard, click **"New +"** → **"Blueprint"**.
3. Select your repository.
4. Render will read `render.yaml` and configure everything automatically. Click **"Apply"**.

---

## 📁 Project Architecture

```
Last Seen/
├── package.json               # Node.js dependencies & run scripts
├── server.js                  # Express.js REST API & suggestions engine
├── render.yaml                # Render Infrastructure-as-Code Blueprint
├── .gitignore                 # Files excluded from Git version control
├── README.md                  # Complete documentation & deployment guide
├── data/
│   ├── initial-data.json      # Assignment benchmark seed dataset
│   └── db.json                # Live file-backed database storage
└── public/
    ├── index.html             # Single-Page App with all 6 assignment views
    ├── css/
    │   └── style.css          # Modern SaaS CSS design system
    ├── js/
    │   └── app.js             # Client state, Leaflet map & smart finder
    └── images/
        ├── logo.svg           # Brand logo icon
        ├── hero-scene.svg     # Hero desk illustration matching mockup
        ├── keys.svg           # Keys icon
        ├── laptop.svg         # Laptop icon
        ├── wallet.svg         # Wallet icon
        ├── headphones.svg     # Audio earphones icon
        ├── idcard.svg         # ID card icon
        ├── book.svg           # Books icon
        ├── bag.svg            # Backpack icon
        └── item.svg           # Generic item icon
```

---

## 🛡️ License & Copyright

Developed by **TraceMates** for the RV University academic assignment in *Identifying and Protecting Intellectual Property* (2026). All original UI designs, algorithms, and illustrations are protected under copyright.
