// Middleware to log payment requests for debugging
const fs = require('fs');
const path = require('path');

const logPaymentRequest = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const logData = {
        timestamp,
        method: req.method,
        url: req.url,
        query: req.query,
        body: req.body,
        headers: {
            'user-agent': req.headers['user-agent'],
            'content-type': req.headers['content-type']
        }
    };

    // Log to console
    console.log('📊 Payment Request Log:', JSON.stringify(logData, null, 2));

    // Also log to file for persistent debugging
    const logPath = path.join(__dirname, 'payment-logs.json');

    try {
        let logs = [];
        if (fs.existsSync(logPath)) {
            const existingLogs = fs.readFileSync(logPath, 'utf8');
            logs = JSON.parse(existingLogs);
        }

        logs.push(logData);

        // Keep only last 100 logs to prevent file from growing too large
        if (logs.length > 100) {
            logs = logs.slice(-100);
        }

        fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
    } catch (error) {
        console.error('Error writing to payment log file:', error);
    }

    next();
};

module.exports = { logPaymentRequest };
