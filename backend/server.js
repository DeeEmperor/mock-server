const express = require("express");
const mongoose =  require("mongoose");
const cors = require("cors");
const MockRoute = require("./models/MockRoute"); // the schema

const app = express();
app.use(cors());
app.use(express.json());

//connectio to mongo.
mongoose.connect('mongodb://127.0.0.1:27017/mock-server')
.then(() => console.log("Connected to mongodb"))
.catch(err => console.log("Mongo connection error: ",err));

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

// delete a mock
app.delete('/admin/delete/:id', async (req, res) => {
    try {
        await MockRoute.findByIdAndDelete(req.params.id);
        res.json({message: "Mock deleted"});
    } catch (error) {
        res.status(500).json({error: "Could not delete mock"})
    }
})

app.all('/mock/*path', async (req, res) => {
    const requestedPath = req.params.path;
    const requestedMethod = req.method;

    //this will search for a rule that matches this path + http method
    const mock = await MockRoute.findOne({path: requestedPath, method: requestedMethod})

    if (mock) {

        setTimeout(() => {
            res.status(mock.statusCode).json(mock.responseBody);
        }, mock.delay);
    } else {
        res.status(404).json({error: "No mock rule found for this path."})
    }
});

// start server.

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Mock server running on http://localhost:${PORT}`);
});
