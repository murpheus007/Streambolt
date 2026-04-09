const { spawn } = require('child_process');

const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...';

function createVideoDownloadProcess(url, options = {}) {
    const args = [
        '-o', '-',
        '-f', 'best[ext=mp4]/best'
    ];

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
    createVideoDownloadProcess
};
