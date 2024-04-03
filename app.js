
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const bodyParser = require("body-parser");
const PORT = process.env.port || 3000;


app.use(cors())
app.use(bodyParser.urlencoded({ limit: "5mb", extended: true }));
app.use(bodyParser.json({ limit: "5mb" }));

const login = require('./routes/login');
const signup = require('./routes/signup');
const user = require('./routes/user');
const task = require('./routes/task');

app.use('/login', login);
app.use('/signup', signup);
app.use('/user', user);
app.use('/task', task);

app.listen(PORT, () => {
    console.log("Listening On Port ", PORT);
});

mongoose.Promise = global.Promise;
var mongodburl = 'mongodb://127.0.0.1:27017/upmetrics'

mongoose.connect(mongodburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
}).then(() => {
    console.log("Connected to MongoDB!");
}).catch((e) => {
    console.log("Error While Connecting the Server!");
    console.log(e);
});