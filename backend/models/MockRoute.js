const db = require('../db');

// Helper: parse JSON fields coming out of SQLite
function parseRoute(row) {
    if (!row) return null;
    return {
        ...row,
        _id: row.id,
        responseBody: JSON.parse(row.responseBody),
        matchRules: JSON.parse(row.matchRules || '[]'),
    };
}

const MockRoute = {
    // Create a new mock route
    create(data) {
        const stmt = db.prepare(`
            INSERT INTO mock_routes (path, method, statusCode, responseBody, delay, matchRules)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        const info = stmt.run(
            data.path,
            data.method || 'GET',
            data.statusCode || 200,
            JSON.stringify(data.responseBody),
            data.delay || 0,
            JSON.stringify(data.matchRules || [])
        );
        return MockRoute.findById(info.lastInsertRowid);
    },

    // Get all routes, newest first
    find(where = {}) {
        if (where.path !== undefined && where.method !== undefined) {
            // Specific path + method lookup (used by the mock engine)
            const rows = db.prepare(`
                SELECT * FROM mock_routes WHERE path = ? AND method = ? ORDER BY createdAt DESC
            `).all(where.path, where.method);
            return rows.map(parseRoute);
        }
        const rows = db.prepare(`SELECT * FROM mock_routes ORDER BY createdAt DESC`).all();
        return rows.map(parseRoute);
    },

    // Find all wildcard routes for a given method
    findWildcards(method) {
        const rows = db.prepare(`
            SELECT * FROM mock_routes WHERE path LIKE '%/*' AND method = ? ORDER BY createdAt DESC
        `).all(method);
        return rows.map(parseRoute);
    },

    // Find by ID
    findById(id) {
        const row = db.prepare(`SELECT * FROM mock_routes WHERE id = ?`).get(id);
        return parseRoute(row);
    },

    // Update a route
    update(id, data) {
        const existing = MockRoute.findById(id);
        if (!existing) return null;

        const merged = { ...existing, ...data };
        db.prepare(`
            UPDATE mock_routes
            SET path = ?, method = ?, statusCode = ?, responseBody = ?, delay = ?, matchRules = ?, updatedAt = datetime('now')
            WHERE id = ?
        `).run(
            merged.path,
            merged.method,
            merged.statusCode,
            JSON.stringify(merged.responseBody),
            merged.delay,
            JSON.stringify(merged.matchRules || []),
            id
        );
        return MockRoute.findById(id);
    },

    // Delete a single route
    delete(id) {
        db.prepare(`DELETE FROM mock_routes WHERE id = ?`).run(id);
    },

    // Delete all routes (used by import)
    deleteAll() {
        db.prepare(`DELETE FROM mock_routes`).run();
    },

    // Insert many routes (used by import)
    insertMany(mocks) {
        const stmt = db.prepare(`
            INSERT INTO mock_routes (path, method, statusCode, responseBody, delay, matchRules)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        const insertAll = db.transaction((items) => {
            for (const m of items) {
                stmt.run(
                    m.path,
                    m.method || 'GET',
                    m.statusCode || 200,
                    JSON.stringify(m.responseBody),
                    m.delay || 0,
                    JSON.stringify(m.matchRules || [])
                );
            }
        });
        insertAll(mocks);
    }
};

module.exports = MockRoute;