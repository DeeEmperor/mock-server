const mongoose = require("mongoose");

const mockRouteSchema = new mongoose.Schema({
    path: {type: String, required: true},
    method: {type: String, default: "GET"},
    statusCode: {type: Number, default: 200},
    responseBody: {type: Object, required: true},
    delay: {type: Number, default: 0},
    matchRules: [{
        type: { type: String, enum: ['header', 'query'] },
        key: { type: String },
        value: { type: String }
    }]
}, {timestamps: true});

module.exports = mongoose.model("MockRoute", mockRouteSchema);