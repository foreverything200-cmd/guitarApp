# 🎸 GuitarApp

A full-featured guitar chord & lyrics app built for iPad (works on any device with a browser). Manage your song library, view chords with lyrics, transpose keys, use a built-in tuner, create playlists, and more.

---

## ✅ What You Need Before Starting

1. **A computer** (Mac, Windows, or Linux)
2. **Node.js** installed (version 18 or higher)
3. **A web browser** (Chrome, Safari, Firefox, etc.)

That's it!

---

## 📥 Step 1: Install Node.js

Node.js is the engine that runs this app. You only need to do this once.

### On Mac:
1. Open **Safari** and go to: https://nodejs.org
2. Click the big green button that says **"LTS"** (recommended version)
3. Open the downloaded file and follow the installer steps
4. Click **Next → Next → Install → Done**

### On Windows:
1. Open your browser and go to: https://nodejs.org
2. Click the big green button that says **"LTS"**
3. Open the downloaded `.msi` file
4. Click **Next → Next → Next → Install → Finish**

### Check it worked:
1. Open **Terminal** (Mac) or **Command Prompt** (Windows)
   - **Mac:** Press `Cmd + Space`, type `Terminal`, press Enter
   - **Windows:** Press `Win + R`, type `cmd`, press Enter
2. Type this and press Enter:
   ```
   node --version
   ```
3. You should see something like `v22.14.0`. If you see a version number, you're good!

---

## 📥 Step 2: Download the App

### Option A: Download as ZIP (easiest)
1. Go to: https://github.com/foreverything200-cmd/guitarApp
2. Click the green **"Code"** button
3. Click **"Download ZIP"**
4. Find the downloaded ZIP file and **double-click** it to unzip
5. You'll get a folder called `guitarApp-main` — move it to your **Desktop** (or anywhere you like)

### Option B: Using Git (if you have it)
Open Terminal and run:
```
cd ~/Desktop
git clone https://github.com/foreverything200-cmd/guitarApp.git
```

---

## 📥 Step 3: Install the App

1. Open **Terminal** (Mac) or **Command Prompt** (Windows)

2. Navigate to the app folder. Type this and press Enter:
   ```
   cd ~/Desktop/guitarApp
   ```
   > **Note:** If you downloaded the ZIP, the folder might be called `guitarApp-main`. In that case use:
   > ```
   > cd ~/Desktop/guitarApp-main
   > ```

3. Install everything the app needs (this takes 1-2 minutes):
   ```
   npm install
   ```

4. Install the server dependencies:
   ```
   cd server && npm install && cd ..
   ```

5. Install the client dependencies:
   ```
   cd client && npm install && cd ..
   ```

   > **Or do it all at once:**
   > ```
   > npm run install:all
   > ```

---

## 📥 Step 4: Set Up the Database

The app stores your songs in a local database. Set it up with:

```
npm run db:setup
```

Then load the starter songs (20 songs pre-loaded):

```
npm run db:seed
```

You should see:
```
🌱 Seeding database...

  ✅ Artists created
  ✅ 20 songs created
  ✅ Playlists created
  ✅ Chord statuses initialized

🎸 Seed complete!
```

---

## 🚀 Step 5: Start the App

Run this command:

```
npm run dev
```

You should see:
```
🎸 Guitar App API running at http://localhost:3001
VITE ready in 400 ms
➜  Local: http://localhost:5173/
```

**Now open your browser and go to:**

### 👉 http://localhost:5173

That's it! The app is running! 🎉

---

## 📱 Using on iPad

To use the app on your iPad (or any other device on the same WiFi):

1. On your **computer**, find your local IP address:
   - **Mac:** Open Terminal, type: `ipconfig getifaddr en0`
   - **Windows:** Open Command Prompt, type: `ipconfig` and look for "IPv4 Address"
   - It will be something like `192.168.1.42`

2. On your **iPad**, open Safari and go to:
   ```
   http://192.168.1.42:5173
   ```
   (Replace `192.168.1.42` with your actual IP)

3. **Add to Home Screen** for a full-screen app experience:
   - Tap the **Share** button (square with arrow) in Safari
   - Scroll down and tap **"Add to Home Screen"**
   - Tap **"Add"**
   - Now you have a GuitarApp icon on your home screen!

> **Important:** Your computer needs to be running (`npm run dev`) for the app to work on iPad. They must be on the same WiFi network.

---

## 🛑 How to Stop the App

In Terminal, press `Ctrl + C` to stop the app.

---

## 🔄 How to Start the App Again (After First Setup)

Every time you want to use the app, just:

1. Open Terminal
2. Run:
   ```
   cd ~/Desktop/guitarApp
   npm run dev
   ```
3. Open http://localhost:5173 in your browser (or use your iPad)

---

## 🎯 Features

| Feature | Description |
|---------|-------------|
| **Song Library** | Browse songs by name, artist, known chords, or learning chords |
| **Two Categories** | Jewish Music and Non-Jewish Music, each with their own library |
| **Chord Display** | Chords in red above lyrics in black, properly positioned |
| **Transpose** | Change capo position (0-14) and all chords transpose in real-time |
| **Chord Diagrams** | Tap any chord to see finger diagrams with multiple voicings |
| **YouTube Player** | Embedded YouTube videos for each song (ad-free with Premium) |
| **Auto-Scroll** | Automatic lyrics scrolling with adjustable speed |
| **Guitar Tuner** | Built-in chromatic tuner using your device's microphone |
| **Playlists** | Create unlimited playlists with shuffle mode |
| **Known Chords** | Track which chords you know, filter songs by your skill level |
| **Search** | Search by song name or artist name |
| **Print** | Print chord sheets (chords + lyrics only) |
| **Add Songs** | Upload album covers, enter chords & lyrics, add YouTube links |
| **Font Size** | Adjustable text size (A- / A+ buttons) |
| **Shuffle** | Random song within a category or playlist |

---

## 🆘 Troubleshooting

### "command not found: npm"
Node.js isn't installed. Go back to Step 1.

### "EACCES permission denied"
On Mac, try adding `sudo` before the command:
```
sudo npm install
```

### App won't load on iPad
- Make sure your computer and iPad are on the **same WiFi network**
- Make sure the app is running on your computer (`npm run dev`)
- Make sure you're using the correct IP address
- Try `http://YOUR_IP:5173` (not https)

### "Port 3001 already in use"
Another app is using that port. Either close it, or wait a minute and try again.

### Database errors
Reset the database:
```
cd server
rm prisma/dev.db
npx prisma db push
npx tsx prisma/seed.ts
cd ..
```

---

## 📁 Project Structure

```
guitarApp/
├── client/          ← Frontend (what you see in the browser)
│   └── src/
│       ├── pages/       ← Each screen (Home, Category, Song, etc.)
│       ├── components/  ← Reusable UI pieces
│       ├── services/    ← Talks to the server
│       ├── hooks/       ← React logic helpers
│       └── utils/       ← Chord data, transpose, sorting
├── server/          ← Backend (stores your data)
│   ├── prisma/      ← Database setup
│   └── src/
│       ├── routes/       ← API endpoints
│       ├── controllers/  ← Business logic
│       ├── middleware/    ← File uploads, error handling
│       └── utils/        ← Transpose engine
└── package.json     ← Start script
```

---

Made with ❤️ and 🎸
