# Trinex Systems &mdash; Dedicated Admin Frontend Portal

A standalone React 19 + Vite frontend application designed specifically to run on the **`admin.trinexsystems.com`** subdomain. Completely decoupled from the client-facing corporate website (`trinex_fe`).

---

## 🏛️ Ecosystem Overview

```
trinix/
├── trinex_fe/         # Client-facing portal (trinexsystems.com) ──▶ Port 5173
├── trinex_admin_fe/   # Standalone Admin Portal (admin.trinexsystems.com) ──▶ Port 5174
└── trinex_admin/      # Node.js/Express Backend & Database ──▶ Port 5000
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd trinex_admin_fe
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

The admin portal will start immediately on **Port 5174**:
- **Local Access:** [http://localhost:5174](http://localhost:5174)
- **Local Subdomain Access:** [http://admin.localhost:5174](http://admin.localhost:5174)

---

## 🛠️ Features Included

1. **Complete Product CRUD:**
   - Create, edit, and delete aerospace and defence components.
   - Dual view modes: Engineering Grid Cards vs. High-density Table.
   - Real-time search across Part Numbers (SKU), specs, categories, and SEO tags.
   - Category filtering (Transformers, Resistors, Capacitors, ICs, Transistors, Connectors, Motors, Switches).
   - "Delhi Stock" rapid filter for local warehouse dispatch.

2. **Component Image Management:**
   - Direct file upload (via backend `POST /api/upload` with Base64 fallback).
   - Image URL input.
   - 8 pre-packaged high-precision defence visual presets.
   - Live aspect-ratio image preview.

3. **Complete SEO & Social Metadata Suite:**
   - **Meta Title:** With real-time 50–60 character limit counter.
   - **Meta Description:** With real-time 140–160 character limit counter.
   - **Meta Keywords:** Comma-separated search indexing tags.
   - **URL Slug:** Canonical permalink with auto-slugifier.
   - **Canonical URL:** Preventing duplicate content penalties.
   - **Robots Directives:** `index, follow`, `noindex, follow`, `index, nofollow`, `noindex, nofollow`.
   - **OpenGraph Social Preview:** Title, description, and image card for LinkedIn & Twitter.
   - **Live Google Search Snippet (SERP) Preview:** Authentic Google Desktop/Mobile search card.
   - **Live Schema.org Product (JSON-LD) Output:** Syntax-highlighted code block.
   - **"Auto-Populate SEO Fields" Button:** Generates all SEO fields in one click from product specifications.

4. **Resilient Dual-Mode Data Architecture:**
   - Connects to backend API (`http://localhost:5000/api`) when running.
   - Seamlessly falls back to persistent `localStorage` when backend is offline, ensuring 100% uptime for local testing.

---

## 🌐 Production Subdomain Setup (`admin.trinexsystems.com`)

### DNS Record (Cloudflare / GoDaddy / Route 53):
- **Type:** `CNAME`
- **Name:** `admin`
- **Target:** `trinexsystems.com` (or your server/Vercel IP)

### Nginx Virtual Host:
```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name admin.trinexsystems.com;

    root /var/www/trinix/trinex_admin_fe/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend server
    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
    }
}
```
