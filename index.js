const express = require("express");
const bodyparser = require("body-parser");
app = express();
app.use(bodyparser.json())
const { MongoClient } = require("mongodb");
// Connection URI
let collection
const uri = process.env.MONGO_URI || "mongodb://localhost:27017";
// Create a new MongoClient
const connection = new MongoClient(uri);
(async () => {
    try {
        await connection.connect();
        console.log('Connected successfully to server');
        const db = connection.db('mydb');
        try {
            await db.createCollection('todos');
        }
        catch (e)
        {
            console.log("collections already exists")
        }
        collection = db.collection('todos');
    } catch (e) {
        console.log('e', e);
    }
})();

app.get('/todos/', async (req, res) => {
    res.send(await collection.find({}).toArray());
})

app.get('/todos/:id', async (req, res) => {
    res.send(await collection.findOne({ _id: +req.params.id }));
})
app.post('/todos', async (req, res) => {

    const { _id: maxId } = await collection
        .find({})
        .sort({ _id: -1 })
        .next();
    const { title, completed } = req.body;
    try {
        await collection.insertOne({ _id: maxId + 1, title, completed });
        res.status(200).json('OK!');
    } catch (e) {
        res.send(e);
    }
});

app.put('/todos/:id', async (req, res) => {
    const { title, completed } = req.body;
    await collection.updateOne(
        { _id: +req.params.id },
        { $set: { title, completed } }
    );
    res.status(200).json('OK!');
});

app.delete('/todos/:id', async (req, res) => {
    try {
        await collection.deleteOne({ _id: +req.params.id });
        res.status(200).json('OK!');
    } catch (e) {
        res.send(e);
    } 
});

app.get('/resetDB', async (req, res) => {
    try {
        await collection.deleteMany({});
        const initialTodos = [
            {
                _id: 1,
                title: 'Throw garbage',
                completed: false
            },
            {
                _id: 2,
                title: 'Wash the dishes',
                completed: false
            }
        ];
        await collection.insertMany(initialTodos);
        res.status(200).json('RESET DONE!');
    } catch (e) {
        res.json(e);
    }
})

app.listen(process.env.PORT || 3000,()=>{
    console.log("kfir atiaaa")
})