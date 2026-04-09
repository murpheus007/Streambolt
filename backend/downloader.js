const { spawn } = require('child_process');

const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...';
const DEFAULT_MAX_FILE_SIZE = process.env.MAX_DOWNLOAD_SIZE || '30M';

function createVideoDownloadProcess(url, options = {}) {
    const maxFileSize = options.maxFileSize || DEFAULT_MAX_FILE_SIZE;
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
    createVideoDownloadProcess
};
