require('dotenv').config();
const express = require("express");
const { faker } = require("@faker-js/faker");
const cors = require("cors");
const path = require("path");
const db = require("./db"); // Initializes SQLite and creates tables
const MockRoute = require("./models/MockRoute");
const RequestLog = require("./models/RequestLog");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the frontend build
app.use(express.static(path.join(__dirname, '../frontend/dist')));

console.log(' SQLite database ready — mockflow.db');

// ─── ADMIN ROUTES ────────────────────────────────────────────────────────────

// Create a new mock
app.post('/admin/create', (req, res) => {
    try {
        const newRoute = MockRoute.create(req.body);
        res.status(201).json({ message: "Mock created", data: newRoute });
    } catch (error) {
        console.error("Create error:", error);
        res.status(400).json({ error: error.message || "Invalid data." });
    }
});

// Get all mocks
app.get('/admin/mocks', (req, res) => {
    try {
        const mocks = MockRoute.find();
        res.json(mocks);
    } catch (error) {
        console.error("Fetch mocks error:", error);
        res.status(500).json({ error: "Could not fetch mocks" });
    }
});

// Update a mock
app.put('/admin/update/:id', (req, res) => {
    try {
        const updatedMock = MockRoute.update(req.params.id, req.body);
        if (!updatedMock) return res.status(404).json({ error: "Mock not found" });
        res.json({ message: "Mock updated", data: updatedMock });
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ error: "Could not update mock" });
    }
});

// Delete a mock
app.delete('/admin/delete/:id', (req, res) => {
    try {
        MockRoute.delete(req.params.id);
        res.json({ message: "Mock deleted" });
    } catch (error) {
        res.status(500).json({ error: "Could not delete mock" });
    }
});

// Get all logs
app.get('/admin/logs', (req, res) => {
    try {
        const logs = RequestLog.find(100);
        res.json(logs);
    } catch (error) {
        console.error("Error fetching logs:", error);
        res.status(500).json({ error: "Could not fetch logs" });
    }
});

// Clear all logs
app.delete('/admin/logs', (req, res) => {
    try {
        RequestLog.deleteAll();
        res.json({ message: "History cleared" });
    } catch (error) {
        res.status(500).json({ error: "Could not clear logs" });
    }
});

// Health check
app.get('/admin/health', (req, res) => {
    let dbStatus = 'disconnected';
    try {
        // A simple query to confirm SQLite is alive
        db.prepare('SELECT 1').get();
        dbStatus = 'connected';
    } catch (e) {
        dbStatus = 'error';
    }

    res.json({
        status: dbStatus,
        database: 'SQLite',
        uptime: process.uptime(),
        memory: process.memoryUsage().heapUsed
    });
});

// Export mocks
app.get('/admin/export', (req, res) => {
    try {
        const mocks = MockRoute.find();
        res.json(mocks);
    } catch (error) {
        res.status(500).json({ error: "Export failed" });
    }
});

// Import mocks
app.post('/admin/import', (req, res) => {
    try {
        const { mocks } = req.body;
        if (!Array.isArray(mocks)) return res.status(400).json({ error: "Invalid format" });

        MockRoute.deleteAll();
        MockRoute.insertMany(mocks.map(({ _id, id, createdAt, updatedAt, ...rest }) => rest));

        res.json({ message: `Imported ${mocks.length} mocks successfully` });
    } catch (error) {
        res.status(500).json({ error: "Import failed" });
    }
});

// ─── FAKER HELPER ────────────────────────────────────────────────────────────

function processDynamicData(obj) {
    if (typeof obj === 'string') {
        return obj.replace(/\{\{faker:([^}]+)\}\}/g, (match, fakerPath) => {
            try {
                const parts = fakerPath.trim().split('.');
                let current = faker;
                for (const part of parts) {
                    // Case-insensitive key lookup so fullname === fullName === FullName
                    const key = Object.keys(current).find(
                        k => k.toLowerCase() === part.toLowerCase()
                    );
                    if (!key) return match; // unknown path segment — return tag as-is
                    current = current[key];
                }
                return typeof current === 'function' ? current() : match;
            } catch (e) {
                return match;
            }
        });
    } else if (Array.isArray(obj)) {
        return obj.map(item => processDynamicData(item));
    } else if (typeof obj === 'object' && obj !== null) {
        const newObj = {};
        for (const key in obj) {
            newObj[key] = processDynamicData(obj[key]);
        }
        return newObj;
    }
    return obj;
}

// ─── RULE MATCHING HELPER ────────────────────────────────────────────────────

// Returns true if ALL rules in a mock's matchRules are satisfied by the request
function rulesMatch(mock, req) {
    if (!mock.matchRules || mock.matchRules.length === 0) return false;
    return mock.matchRules.every(rule => {
        if (rule.type === 'header') {
            return req.headers[rule.key.toLowerCase()] === rule.value;
        }
        if (rule.type === 'query') {
            return req.query[rule.key] === rule.value;
        }
        if (rule.type === 'body') {
            return String(req.body?.[rule.key]) === rule.value;
        }
        return false;
    });
}

// ─── MOCK RESOLUTION (two-pass: exact → wildcard) ────────────────────────────

function resolveMock(requestedPath, requestedMethod, req) {
    // ── Pass 1: Exact path match ──────────────────────────────────────────
    const exactMocks = MockRoute.find({ path: requestedPath, method: requestedMethod });

    if (exactMocks.length > 0) {
        // Prefer a mock whose rules all match
        const ruleMatch = exactMocks.find(m => rulesMatch(m, req));
        if (ruleMatch) return ruleMatch;

        // Fall back to a mock with no rules
        const fallback = exactMocks.find(m => !m.matchRules || m.matchRules.length === 0);
        if (fallback) return fallback;
    }

    // ── Pass 2: Wildcard match ────────────────────────────────────────────
    // Fetch all mocks where path ends with /*
    const wildcardMocks = MockRoute.findWildcards(requestedMethod);

    // Filter to those whose prefix matches the requested path
    const matching = wildcardMocks.filter(m => {
        const prefix = m.path.slice(0, -2); // strip trailing /*
        return requestedPath === prefix || requestedPath.startsWith(prefix + '/');
    });

    if (matching.length > 0) {
        // Prefer a wildcard mock whose rules all match
        const ruleMatch = matching.find(m => rulesMatch(m, req));
        if (ruleMatch) return ruleMatch;

        // Fall back to one with no rules
        const fallback = matching.find(m => !m.matchRules || m.matchRules.length === 0);
        if (fallback) return fallback;
    }

    return null;
}

// ─── MOCK ENGINE ──────────────────────────────────────────────────────────────

app.all('/mock/*path', (req, res) => {
    let requestedPath = req.params.path;
    if (Array.isArray(requestedPath)) requestedPath = requestedPath.join('/');
    requestedPath = requestedPath || "";
    if (requestedPath.startsWith('/')) requestedPath = requestedPath.substring(1);

    const requestedMethod = req.method;
    console.log(`Incoming request: ${requestedMethod} /mock/${requestedPath}`);

    const mock = resolveMock(requestedPath, requestedMethod, req);

    if (mock) {
        console.log(`✅ Matched: ${requestedPath} → status ${mock.statusCode}, delay ${mock.delay}ms`);

        // Log the hit (rotation handled inside RequestLog.create)
        RequestLog.create({
            path: requestedPath,
            method: requestedMethod,
            headers: req.headers,
            body: req.body,
            query: req.query,
            statusCode: mock.statusCode
        });

        setTimeout(() => {
            const processedBody = processDynamicData(mock.responseBody);
            res.status(Number(mock.statusCode)).json(processedBody);
        }, Number(mock.delay));

    } else {
        console.log(`No mock found: ${requestedMethod} /mock/${requestedPath}`);

        // Log the miss
        RequestLog.create({
            path: requestedPath,
            method: requestedMethod,
            headers: req.headers,
            body: req.body,
            query: req.query,
            statusCode: 404
        });

        res.status(404).json({ error: "No mock rule found for this path." });
    }
});

// ─── SPA FALLBACK ─────────────────────────────────────────────────────────────

app.get('/*any', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(` MockFlow running on http://localhost:${PORT}`);
});
