require("dotenv").config();
const express = require('express');

// Muh Routes
const redirectRouter = require('./routes/redirect');
const giffyRouter = require('./routes/giffy.js');
const app = express();

// Muh Middlewares
app.use(express.json());

// All paths go to this handler
// Eventually serves the app code for the Giffy app
app.get('/', (_req, res) => res.send('Hello World!'));

// Handles CRUD opperations for the Giffy app
app.all('/giffy', giffyRouter);

// Stops people form being idiots
app.use(redirectRouter);

app.listen(3000, () => console.log('Example app listening on port 3000!'));
