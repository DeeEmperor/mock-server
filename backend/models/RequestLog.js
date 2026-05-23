const db = require('../db');

const LOG_ROTATION_CAP = 500;

// Helper: parse JSON fields coming out of SQLite
function parseLog(row) {
    if (!row) return null;
    return {
        ...row,
        _id: row.id,
        headers: row.headers ? JSON.parse(row.headers) : {},
        body: row.body ? JSON.parse(row.body) : {},
        query: row.query ? JSON.parse(row.query) : {},
    };
}

const RequestLog = {
    // Create a new log entry and rotate if needed
    create(data) {
        db.prepare(`
            INSERT INTO request_logs (path, method, headers, body, query, statusCode)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            data.path,
            data.method,
            JSON.stringify(data.headers || {}),
            JSON.stringify(data.body || {}),
            JSON.stringify(data.query || {}),
            data.statusCode
        );

        // Auto-rotate: keep only the newest LOG_ROTATION_CAP entries
        const count = db.prepare(`SELECT COUNT(*) as c FROM request_logs`).get().c;
        if (count > LOG_ROTATION_CAP) {
            const overflow = count - LOG_ROTATION_CAP;
            db.prepare(`
                DELETE FROM request_logs
                WHERE id IN (
                    SELECT id FROM request_logs ORDER BY createdAt ASC LIMIT ?
                )
            `).run(overflow);
        }
    },

    // Get the most recent logs (up to limit)
    find(limit = 100) {
        const rows = db.prepare(`
            SELECT * FROM request_logs ORDER BY createdAt DESC LIMIT ?
        `).all(limit);
        return rows.map(parseLog);
    },

    // Clear all logs
    deleteAll() {
        db.prepare(`DELETE FROM request_logs`).run();
    }
};

module.exports = RequestLog;
