# StreamBolt ⚡

**StreamBolt** is an open-source social video downloader. Paste any link — YouTube, Instagram, TikTok, Twitter/X, Facebook, and more — and download the video directly to your device. It can also run as a **Telegram bot** or a **WhatsApp bot**, powered by [yt-dlp](https://github.com/yt-dlp/yt-dlp) under the hood.

---

## Features

- 🌐 **Web UI** — Clean React frontend for drag-and-paste video downloads
- 🤖 **Telegram Bot** — Send a link, get back a video
- 💬 **WhatsApp Bot** — Same magic directly in WhatsApp chats
- 🍪 **Cookie support** — Pass authenticated cookies for age-restricted or private content
- 🐳 **Docker-first** — Single image, single compose command to run everything

---

## Tech Stack

| Layer      | Technology                             |
|------------|----------------------------------------|
| Frontend   | React + Vite + TailwindCSS             |
| Backend    | Node.js + Express                      |
| Downloader | [yt-dlp](https://github.com/yt-dlp/yt-dlp) |
| Telegram   | [Telegraf](https://telegraf.js.org/)   |
| WhatsApp   | [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys) |
| Container  | Docker + Docker Compose                |

---

## Quick Start (Docker Compose)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/streambolt.git
cd streambolt
```

### 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Then open `.env` and set your credentials (see the [Environment Variables](#environment-variables) section below).

### 3. Build and run

```bash
docker compose up --build
```

The app will be available at **http://localhost:3000**.

To run in the background:

```bash
docker compose up --build -d
```

To stop:

```bash
docker compose down
```

---

## Manual Docker Build (without Compose)

If you prefer to build and run the image manually:

```bash
# Build
docker build -t streambolt .

# Run
docker run -p 3000:3000 --env-file .env streambolt
```

---

## Local Development (without Docker)

You need **Node.js ≥ 20**, **Python 3**, **ffmpeg**, and **yt-dlp** installed on your machine.

```bash
# Install all dependencies (root + frontend + backend)
npm install
npm --prefix frontend install
npm --prefix backend install

# Start both frontend dev server and backend in watch mode
npm run dev
```

The frontend hot-reload server runs on **http://localhost:5173**, and the backend on **http://localhost:3000**.

---

## Environment Variables

Create a `.env` file in the project root (or pass variables directly to Docker). Below are all supported variables:

| Variable              | Required | Default  | Description |
|-----------------------|----------|----------|-------------|
| `PORT`                | No       | `3000`   | Port the backend HTTP server listens on |
| `TELEGRAM_ENABLED`    | No       | `false`  | Set to `true` to enable the Telegram bot |
| `BOT_TOKEN`           | If Telegram | —     | Your Telegram bot token from [@BotFather](https://t.me/BotFather) |
| `WHATSAPP_ENABLED`    | No       | `false`  | Set to `true` to enable the WhatsApp bot |
| `MAX_DOWNLOAD_SIZE`   | No       | `30M`    | Maximum file size yt-dlp will download (e.g. `50M`, `100M`) |
| `YTDLP_COOKIES`       | No       | —        | Raw Netscape cookie file contents as a single environment variable string |
| `YTDLP_COOKIES_B64`   | No       | —        | Base64-encoded version of a Netscape cookie file (useful for secrets managers) |
| `YTDLP_COOKIES_PATH`  | No       | —        | Absolute path to a mounted cookie file inside the container |
| `VITE_TELEGRAM_BOT_URL` | No     | —        | Your bot's `https://t.me/your_bot` URL, shown in the frontend UI |

### Minimal `.env` example (web only)

```env
PORT=3000
TELEGRAM_ENABLED=false
WHATSAPP_ENABLED=false
MAX_DOWNLOAD_SIZE=50M
```

### With Telegram bot enabled

```env
PORT=3000
BOT_TOKEN=1234567890:ABCDefghIJKlmnoPQRstuVWXyz
TELEGRAM_ENABLED=true
WHATSAPP_ENABLED=false
MAX_DOWNLOAD_SIZE=50M
VITE_TELEGRAM_BOT_URL=https://t.me/your_bot_username
```

### With WhatsApp bot enabled

```env
PORT=3000
TELEGRAM_ENABLED=false
WHATSAPP_ENABLED=true
MAX_DOWNLOAD_SIZE=50M
```

> **WhatsApp pairing note:** On first run with `WHATSAPP_ENABLED=true`, a QR code will be printed in the container logs. Scan it once from **WhatsApp → Linked Devices**. The session is saved to `backend/baileys_auth/` (mounted as a volume) so you only need to do this once.

---

## Cookies (for YouTube and restricted content)

Some platforms (especially YouTube) block downloads without valid browser cookies. You have three options for passing cookies to yt-dlp:

### Option A — File path (recommended for local / server use)

Export your cookies from the browser using the [Get cookies.txt LOCALLY](https://chrome.google.com/webstore/detail/get-cookiestxt-locally) extension, save the file as `cookies.txt` in the project root, then set:

```env
YTDLP_COOKIES_PATH=/app/cookies.txt
```

And mount the file in `docker-compose.yml`:

```yaml
volumes:
  - ./cookies.txt:/app/cookies.txt:ro
  - ./backend/baileys_auth:/app/baileys_auth
```

### Option B — Inline cookie string

Paste the raw content of your Netscape cookie file into the env variable (useful for short cookie files):

```env
YTDLP_COOKIES=# Netscape HTTP Cookie File
.youtube.com  TRUE  /  FALSE  0  COOKIE_NAME  value
```

### Option C — Base64-encoded (recommended for secrets managers / CI)

```bash
# Encode your cookie file
base64 -w 0 cookies.txt
```

Then paste the output into:

```env
YTDLP_COOKIES_B64=<your base64 string here>
```

---

## Project Structure

```
streambolt/
├── backend/               # Node.js + Express backend
│   ├── index.js           # Entry point, HTTP server + bot init
│   ├── downloader.js      # yt-dlp process wrapper
│   ├── whatsapp.js        # WhatsApp bot (Baileys)
│   ├── logger.js          # Simple file + console logger
│   └── package.json
├── frontend/              # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx        # Main app component
│   │   └── index.css
│   └── package.json
├── Dockerfile             # Multi-stage build (React → Node)
├── docker-compose.yml     # One-command deployment
├── .env.example           # Template for environment variables
└── README.md
```

---

## Community & Feedback

Have a question, found a bug, or want to suggest a feature? Reach out through any of the channels below:

| Channel | Link |
|---------|------|
| 💬 **Telegram Community** | [t.me/streambolt_community](https://t.me/streambolt_community) — chat with the dev and other users |
| 📧 **Email** | [dreamgotwings@gmail.com](mailto:dreamgotwings@gmail.com) — for detailed reports or private matters |
| 🐛 **GitHub Issues** | [Open an issue](../../issues) — for bug reports and feature requests |

---

## Contributing

Contributions are welcome! Feel free to open issues or pull requests. Please keep PRs focused and include a clear description of the change.

---

## License

MIT — free to use, modify, and distribute.
