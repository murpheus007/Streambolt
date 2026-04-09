const express = require('express');
const { Telegraf } = require('telegraf');
const path = require('path');

const { DEFAULT_USER_AGENT, createVideoDownloadProcess } = require('./downloader');
const { LOG_PATH, logError, logInfo, logWarn } = require('./logger');
const { startWhatsAppBot } = require('./whatsapp');

const app = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_ENABLED = process.env.TELEGRAM_ENABLED === 'true' && Boolean(BOT_TOKEN);
const WHATSAPP_ENABLED = process.env.WHATSAPP_ENABLED === 'true';

logInfo('Bootstrapping StreamBolt backend.', {
    port: PORT,
    telegramEnabled: TELEGRAM_ENABLED,
    whatsappEnabled: WHATSAPP_ENABLED,
    hasBotToken: Boolean(BOT_TOKEN),
    debugLogPath: LOG_PATH
});

process.on('uncaughtException', (error) => {
    logError('Uncaught exception crashed the backend.', error);
});

process.on('unhandledRejection', (reason) => {
    logError('Unhandled promise rejection detected.', reason);
});

if (TELEGRAM_ENABLED) {
    const bot = new Telegraf(BOT_TOKEN);
    logInfo('Telegram bot startup enabled.');

    bot.on('text', async (ctx) => {
        const url = ctx.message.text;
        const chatId = ctx.chat?.id;

        logInfo('Received Telegram text message.', {
            chatId,
            textLength: url.length
        });

        if (!url.startsWith('http')) {
            logWarn('Rejected Telegram message without a valid URL.', {
                chatId
            });
            return ctx.reply('Please send a valid video link!');
        }

        await ctx.reply('Preparing your video...');
        logInfo('Telegram download acknowledged.', {
            chatId,
            url
        });

        const downloader = createVideoDownloadProcess(url, {
            userAgent: DEFAULT_USER_AGENT
        });

        try {
            await ctx.replyWithVideo({
                source: downloader.stdout,
                filename: 'video.mp4'
            });
            logInfo('Telegram video response sent.', {
                chatId,
                url
            });
        } catch (err) {
            await ctx.reply('We could not download that video right now.');
            logError('Telegram replyWithVideo failed.', {
                chatId,
                url,
                error: err
            });
        }
    });

    bot.launch({
        dropPendingUpdates: true
    }).catch((error) => {
        logError('Telegram bot failed to start.', error);
    });

    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
} else {
    logWarn('TELEGRAM_ENABLED is not true or BOT_TOKEN is missing. Telegram bot startup skipped.');
}

if (WHATSAPP_ENABLED) {
    startWhatsAppBot().catch((error) => {
        logError('WhatsApp bot failed to start.', error);
    });
} else {
    logWarn('WHATSAPP_ENABLED is not true. WhatsApp bot startup skipped.');
}

// 1. Serve the React Frontend
// Docker copies the built React files into this 'public' folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// 2. The Streaming API Endpoint for the Website
app.get('/api/download', (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        logWarn('Rejected website download request without URL.');
        return res.status(400).send('URL is required');
    }

    // Tell the browser to expect a file download
    res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');
    res.setHeader('Content-Type', 'video/mp4');

    logInfo('Starting website download.', {
        url: videoUrl,
        ip: req.ip
    });

    const ytDlp = createVideoDownloadProcess(videoUrl);

    ytDlp.stdout.pipe(res);

    ytDlp.on('close', (code) => {
        logInfo('Website yt-dlp stream closed.', {
            url: videoUrl,
            code
        });
        res.end();
    });

    req.on('close', () => {
        logWarn('User cancelled website download. Killing yt-dlp process.', {
            url: videoUrl,
            ip: req.ip
        });
        ytDlp.kill();
    });
});

app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    logInfo(`Server running on port ${PORT}`);
});
