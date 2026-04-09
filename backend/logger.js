const fs = require('fs');
const path = require('path');

const LOG_PATH = process.env.DEBUG_LOG_PATH || path.join(process.cwd(), 'debug.log');

function serialize(value) {
    if (value instanceof Error) {
        return JSON.stringify({
            name: value.name,
            message: value.message,
            stack: value.stack
        });
    }

    if (typeof value === 'object' && value !== null) {
        try {
            return JSON.stringify(value);
        } catch (error) {
            return `[unserializable-object:${error.message}]`;
        }
    }

    return String(value);
}

function write(level, message, meta) {
    const timestamp = new Date().toISOString();
    const suffix = meta === undefined ? '' : ` ${serialize(meta)}`;
    const line = `[${timestamp}] [${level}] ${message}${suffix}`;

    try {
        fs.appendFileSync(LOG_PATH, `${line}\n`);
    } catch (error) {
        console.error(`[logger] Failed to write debug log: ${error.message}`);
    }

    if (level === 'ERROR') {
        console.error(line);
        return;
    }

    if (level === 'WARN') {
        console.warn(line);
        return;
    }

    console.log(line);
}

function logInfo(message, meta) {
    write('INFO', message, meta);
}

function logWarn(message, meta) {
    write('WARN', message, meta);
}

function logError(message, meta) {
    write('ERROR', message, meta);
}

module.exports = {
    LOG_PATH,
    logError,
    logInfo,
    logWarn
};
