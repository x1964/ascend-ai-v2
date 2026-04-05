# ⚡ ASCEND AI V2 — Setup Guide

## 🆕 What's New in V2
- **Landing Page** — Cinematic hero, feature bento grid, stats counter, testimonials, pricing, CTA
- **Custom cursor** with volt neon ring
- **Particle canvas** background with connection lines
- **Volt neon** color system (replaces purple/blue)
- **Clash Display + Bricolage Grotesque** typography
- **JetBrains Mono** for data/labels
- **Bento grid** feature layout
- **Animated counters** on stats section
- **Scroll reveal** animations
- **Marquee ticker** between hero and features
- Upgraded all 5 app pages with new design system

---

## 📁 Structure

```
ascend-ai-v2/
├── frontend/
│   ├── landing.html        ← 🆕 Landing Page (start here)
│   ├── index.html          ← Login / Register
│   ├── dashboard.html
│   ├── tasks.html
│   ├── chat.html
│   ├── profile.html
│   ├── css/style.css
│   └── js/app.js
├── backend/
│   ├── db.php
│   ├── register.php
│   ├── login.php
│   ├── logout.php
│   ├── getUser.php
│   ├── getTasks.php
│   ├── addTask.php
│   ├── updateTask.php
│   ├── deleteTask.php
│   ├── chat.php
│   ├── updateProfile.php
│   ├── saveApiKey.php
│   └── deleteAccount.php
└── database/
    └── schema.sql
```

---

## 🚀 Setup (4 steps)

### 1. Import Database
```bash
mysql -u root -p < database/schema.sql
```

### 2. Configure DB credentials
Edit `backend/db.php`:
```php
define('DB_USER', 'root');   // your username
define('DB_PASS', '');       // your password
```

### 3. Start PHP server (from project ROOT)
```bash
cd ascend-ai-v2
php -S localhost:8000
```

### 4. Open in browser
```
http://localhost:8000/frontend/landing.html
```

> The landing page has **Get Started** and **Sign In** buttons that link to the auth page.

---

## 🔑 Enable AI Chat
1. Register → go to **Profile**
2. Paste your OpenAI API key
3. Click **Save Key**
4. Go to **AI Chat** → start coaching

---

## Windows PowerShell (all-in-one)
```powershell
cd C:\Projects
mkdir ascend-ai-v2
cd ascend-ai-v2
mkdir frontend\css, frontend\js, backend, database
# copy all files...
mysql -u root -p -e "source database/schema.sql"
php -S localhost:8000
Start-Process "http://localhost:8000/frontend/landing.html"
```

## Mac / Linux
```bash
cd ~/Projects
mkdir -p ascend-ai-v2/{frontend/{css,js},backend,database}
cd ascend-ai-v2
# copy all files...
mysql -u root -p < database/schema.sql
php -S localhost:8000
open http://localhost:8000/frontend/landing.html
```
