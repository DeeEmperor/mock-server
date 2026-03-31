const mongoose = require("mongoose");

const requestLogSchema = new mongoose.Schema({
    path: { type: String, required: true },
    method: { type: String, required: true },
    headers: { type: Object },
    body: { type: Object },
    query: { type: Object },
    statusCode: { type: Number },
    timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("RequestLog", requestLogSchema);
