const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...';
const DEFAULT_MAX_FILE_SIZE = process.env.MAX_DOWNLOAD_SIZE || '30M';
const DEFAULT_COOKIES_TEXT = process.env.YTDLP_COOKIES || '';
const DEFAULT_COOKIES_B64 = process.env.YTDLP_COOKIES_B64 || '';
const DEFAULT_COOKIES_PATH = process.env.YTDLP_COOKIES_PATH || '';
const TEMP_COOKIES_PATH = path.join(os.tmpdir(), 'yt-dlp-cookies.txt');

function ensureCookiesFile() {
    if (DEFAULT_COOKIES_PATH) {
        return DEFAULT_COOKIES_PATH;
    }

    let cookiesText = DEFAULT_COOKIES_TEXT;

    if (!cookiesText && DEFAULT_COOKIES_B64) {
        cookiesText = Buffer.from(DEFAULT_COOKIES_B64, 'base64').toString('utf8');
    }

    if (!cookiesText) {
        return null;
    }

    fs.writeFileSync(TEMP_COOKIES_PATH, cookiesText, 'utf8');
    return TEMP_COOKIES_PATH;
}

function createVideoDownloadProcess(url, options = {}) {
    const maxFileSize = options.maxFileSize || DEFAULT_MAX_FILE_SIZE;
    const cookiesPath = options.cookiesPath || ensureCookiesFile();
    const args = [
        '-o', '-',
        '-f', 'best[ext=mp4]/best'
    ];

    if (maxFileSize) {
        args.push('--max-filesize', maxFileSize);
    }

    if (options.userAgent) {
        args.push('--user-agent', options.userAgent);
    }

    if (cookiesPath) {
        args.push('--cookies', cookiesPath);
    }

    args.push(url);

    const process = spawn('yt-dlp', args, {
        stdio: ['ignore', 'pipe', 'pipe']
    });

    process.stderr.on('data', (data) => {
        console.log(`yt-dlp log: ${data}`);
    });

    return process;
}

module.exports = {
    DEFAULT_USER_AGENT,
    DEFAULT_MAX_FILE_SIZE,
    DEFAULT_COOKIES_PATH,
    createVideoDownloadProcess
};
