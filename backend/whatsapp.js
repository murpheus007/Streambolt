const path = require('path');
const qrcode = require('qrcode-terminal');

const { DEFAULT_USER_AGENT, createVideoDownloadProcess } = require('./downloader');

const AUTH_FOLDER = path.join(__dirname, 'baileys_auth');
const URL_PATTERN = /(https?:\/\/[^\s]+)/i;
const COMPOSING_DELAY_MS = 3000;

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function getMessageText(message) {
    if (!message) {
        return '';
    }

    if (message.ephemeralMessage?.message) {
        return getMessageText(message.ephemeralMessage.message);
    }

    if (message.viewOnceMessage?.message) {
        return getMessageText(message.viewOnceMessage.message);
    }

    if (message.viewOnceMessageV2?.message) {
        return getMessageText(message.viewOnceMessageV2.message);
    }

    return (
        message.conversation ||
        message.extendedTextMessage?.text ||
        message.imageMessage?.caption ||
        message.videoMessage?.caption ||
        message.documentMessage?.caption ||
        ''
    );
}

function extractFirstUrl(text) {
    return text.match(URL_PATTERN)?.[1] || null;
}

function shouldIgnoreMessage(message) {
    const remoteJid = message.key?.remoteJid;

    return (
        !message.message ||
        !remoteJid ||
        message.key?.fromMe ||
        remoteJid === 'status@broadcast' ||
        remoteJid.endsWith('@g.us')
    );
}

async function sendDownloadedVideo(sock, jid, url) {
    const downloader = createVideoDownloadProcess(url, {
        userAgent: DEFAULT_USER_AGENT
    });

    try {
        await sock.sendMessage(jid, {
            video: {
                stream: downloader.stdout
            },
            mimetype: 'video/mp4',
            fileName: 'streambolt.mp4',
            caption: 'Downloaded with StreamBolt'
        });
    } catch (error) {
        downloader.kill('SIGKILL');
        throw error;
    }
}

async function handleIncomingMessage(sock, message) {
    if (shouldIgnoreMessage(message)) {
        return;
    }

    const remoteJid = message.key.remoteJid;
    const url = extractFirstUrl(getMessageText(message.message));

    if (!url) {
        return;
    }

    try {
        await sock.readMessages([message.key]);
        await sock.presenceSubscribe(remoteJid);
        await sock.sendPresenceUpdate('composing', remoteJid);
        await wait(COMPOSING_DELAY_MS);
        await sock.sendPresenceUpdate('paused', remoteJid);

        await sendDownloadedVideo(sock, remoteJid, url);
    } catch (error) {
        console.error('WhatsApp processing error:', error);

        try {
            await sock.sendPresenceUpdate('paused', remoteJid);
            await sock.sendMessage(remoteJid, {
                text: 'We could not download that video right now.'
            });
        } catch (sendError) {
            console.error('WhatsApp error response failed:', sendError);
        }
    }
}

async function startWhatsAppBot() {
    const baileys = await import('@whiskeysockets/baileys');
    const makeWASocket = baileys.default || baileys.makeWASocket;
    const {
        Browsers,
        DisconnectReason,
        useMultiFileAuthState
    } = baileys;

    const connect = async () => {
        const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);

        const sock = makeWASocket({
            auth: state,
            browser: Browsers.ubuntu('StreamBolt'),
            markOnlineOnConnect: false
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
            if (qr) {
                console.log('Scan this WhatsApp QR code from Linked Devices:');
                qrcode.generate(qr, { small: true });
            }

            if (connection === 'open') {
                console.log('WhatsApp bot connected.');
            }

            if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

                console.log('WhatsApp connection closed.', {
                    statusCode,
                    shouldReconnect
                });

                if (shouldReconnect) {
                    setTimeout(() => {
                        connect().catch((error) => {
                            console.error('WhatsApp reconnect failed:', error);
                        });
                    }, 3000);
                } else {
                    console.error('WhatsApp bot logged out. Delete baileys_auth and re-link the device.');
                }
            }
        });

        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify') {
                return;
            }

            for (const message of messages) {
                await handleIncomingMessage(sock, message);
            }
        });
    };

    await connect();
}

module.exports = {
    startWhatsAppBot
};
