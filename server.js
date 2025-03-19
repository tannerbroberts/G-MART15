require("dotenv").config();
const express = require('express');

// Muh Routes
const redirectRouter = require('./routes/redirect');
const usersRouter = require('./routes/users');
const postDataRouter = require('./routes/postData.js');
const todosRouter = require('./routes/todos');
const app = express();

// Muh Middlewares
app.use(express.json());

// All paths go to this handler
app.get('/', (_req, res) => res.send('Hello World!'));

// Gets and prints data to the console
app.use(postDataRouter);

app.use(todosRouter);

// Sends user data
app.use(usersRouter);

app.use(redirectRouter);

app.listen(3000, () => console.log('Example app listening on port 3000!'));
