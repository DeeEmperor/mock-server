const mongoose = require("mongoose");

const mockRouteSchema = new mongoose.Schema({
    path: {type: String, required: true, unique: true},
    method: {type: String, default: "GET"},
    statusCode: {type: Number, default: 200},
    responseBody: {type: Object, required: true},
    delay: {type: Number, default: 0}
}, {timestamps: true});

module.exports = mongoose.model("MockRoute", mockRouteSchema);