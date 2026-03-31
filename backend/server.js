require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const cors = require("cors");
const path = require("path");
const MockRoute = require("./models/MockRoute"); // the schema
const RequestLog = require("./models/RequestLog"); // the log schema

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mock-server';

app.use(cors());
app.use(express.json());

// Serve static files from the frontend build
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// MongoDB connection
mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

//create a new mock
// this is what the form will call to save a new API rule.

app.post('/admin/create', async (req, res) => {
    try {
        const newRoute = await MockRoute.create(req.body);
        res.status(201).json({ message: "Mock created", data: newRoute});
    } catch (error) {
        res.status(400).json({error: "path already exists or invalid data."});
    }
});

// get all mocks 
app.get('/admin/mocks', async (req, res) => {
    try {
        const mocks = await MockRoute.find().sort({createdAt: -1});
        res.json(mocks);
    } catch (error) {
        res.status(500).json({error: "Could not fetch mocks"})
    }
});

// update a mock
app.put('/admin/update/:id', async (req, res) => {
    try {
        const updatedMock = await MockRoute.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        );
        res.json({ message: "Mock updated", data: updatedMock });
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ error: "Could not update mock" });
    }
});

// delete a mock
app.delete('/admin/delete/:id', async (req, res) => {
    try {
        await MockRoute.findByIdAndDelete(req.params.id);
        res.json({message: "Mock deleted"});
    } catch (error) {
        res.status(500).json({error: "Could not delete mock"})
    }
})

// get all logs
app.get('/admin/logs', async (req, res) => {
    try {
        const logs = await RequestLog.find().sort({createdAt: -1}).limit(100);
        res.json(logs);
    } catch (error) {
        console.error("Error fetching logs:", error);
        res.status(500).json({error: "Could not fetch logs"})
    }
});

// clear all logs
app.delete('/admin/logs', async (req, res) => {
    try {
        await RequestLog.deleteMany({});
        res.json({message: "History cleared"});
    } catch (error) {
        res.status(500).json({error: "Could not clear logs"})
    }
});

// health check
app.get('/admin/health', (req, res) => {
    const status = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.json({ 
        status, 
        database: 'MongoDB',
        uptime: process.uptime(),
        memory: process.memoryUsage().heapUsed
    });
});

// export mocks
app.get('/admin/export', async (req, res) => {
    try {
        const mocks = await MockRoute.find();
        res.json(mocks);
    } catch (error) {
        res.status(500).json({error: "Export failed"});
    }
});

// import mocks
app.post('/admin/import', async (req, res) => {
    try {
        const { mocks } = req.body;
        if (!Array.isArray(mocks)) return res.status(400).json({error: "Invalid format"});
        
        // Basic cleanup and re-insert
        await MockRoute.deleteMany({});
        await MockRoute.insertMany(mocks.map(m => {
            const { _id, ...rest } = m; // Remove old IDs
            return rest;
        }));
        
        res.json({message: `Imported ${mocks.length} mocks successfully`});
    } catch (error) {
        res.status(500).json({error: "Import failed"});
    }
});

// Helper to process dynamic fake data
function processDynamicData(obj) {
    if (typeof obj === 'string') {
        return obj.replace(/\{\{faker:([^}]+)\}\}/g, (match, path) => {
            try {
                // path like 'name.fullName' or 'internet.email'
                const parts = path.split('.');
                let current = faker;
                for (const part of parts) {
                    current = current[part];
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

app.all('/mock/:path*', async (req, res) => {
    let requestedPath = req.params.path;
    if (Array.isArray(requestedPath)) requestedPath = requestedPath.join('/');
    requestedPath = requestedPath || "";
    const requestedMethod = req.method;

    console.log(`Incoming request: ${requestedMethod} /mock/${JSON.stringify(requestedPath)}`);

    if (requestedPath.startsWith('/')) requestedPath = requestedPath.substring(1);

    //this will search for a rule that matches this path + http method
    const mocks = await MockRoute.find({path: requestedPath, method: requestedMethod})

    let mock = null;
    if (mocks.length > 0) {
        // Try to find a specific match first
        mock = mocks.find(m => {
            if (!m.matchRules || m.matchRules.length === 0) return false;
            return m.matchRules.every(rule => {
                if (rule.type === 'header') {
                    // normalize header key from request
                    const reqVal = req.headers[rule.key.toLowerCase()];
                    return reqVal === rule.value;
                }
                if (rule.type === 'query') {
                    return req.query[rule.key] === rule.value;
                }
                return false;
            });
        });

        // If no specific match, pick the one with NO rules (fallback)
        if (!mock) {
            mock = mocks.find(m => !m.matchRules || m.matchRules.length === 0);
        }
    }

    if (mock) {
        console.log(`Found mock for ${requestedPath}: status ${mock.statusCode}, delay ${mock.delay}`);
        
        // Log the request
        await RequestLog.create({
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
        console.log(`No mock found for ${requestedPath} (${requestedMethod})`);
        
        // Log the failed request
        await RequestLog.create({
            path: requestedPath,
            method: requestedMethod,
            headers: req.headers,
            body: req.body,
            query: req.query,
            statusCode: 404
        });

        res.status(404).json({error: "No mock rule found for this path."})
    }
});

// Catch-all route to serve the frontend index.html for SPA routing
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
