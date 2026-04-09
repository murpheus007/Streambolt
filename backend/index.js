const express = require('express');
const { Telegraf } = require('telegraf');
const path = require('path');

const { DEFAULT_USER_AGENT, createVideoDownloadProcess } = require('./downloader');
const { startWhatsAppBot } = require('./whatsapp');

const app = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;
const BOT_ENABLED = Boolean(BOT_TOKEN);
const WHATSAPP_ENABLED = process.env.WHATSAPP_ENABLED === 'true';

if (BOT_ENABLED) {
    const bot = new Telegraf(BOT_TOKEN);

    bot.on('text', async (ctx) => {
        const url = ctx.message.text;

        if (!url.startsWith('http')) {
            return ctx.reply('Please send a valid video link!');
        }

        await ctx.reply('Preparing your video...');

        const downloader = createVideoDownloadProcess(url, {
            userAgent: DEFAULT_USER_AGENT
        });

        try {
            await ctx.replyWithVideo({
                source: downloader.stdout,
                filename: 'video.mp4'
            });
        } catch (err) {
            await ctx.reply('We could not download that video right now.');
            console.error(err);
        }
    });

    bot.launch();
} else {
    console.warn('BOT_TOKEN is not set. Telegram bot startup skipped.');
}

if (WHATSAPP_ENABLED) {
    startWhatsAppBot().catch((error) => {
        console.error('WhatsApp bot failed to start:', error);
    });
} else {
    console.warn('WHATSAPP_ENABLED is not true. WhatsApp bot startup skipped.');
}

// 1. Serve the React Frontend
// Docker copies the built React files into this 'public' folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// 2. The Streaming API Endpoint for the Website
app.get('/api/download', (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).send('URL is required');
    }

    // Tell the browser to expect a file download
    res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');
    res.setHeader('Content-Type', 'video/mp4');

    console.log(`Starting download for: ${videoUrl}`);

    const ytDlp = createVideoDownloadProcess(videoUrl);

    ytDlp.stdout.pipe(res);

    ytDlp.on('close', (code) => {
        console.log(`yt-dlp process exited with code ${code}`);
        res.end();
    });

    req.on('close', () => {
        console.log('User cancelled download. Killing process.');
        ytDlp.kill();
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
