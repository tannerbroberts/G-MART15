const express = require('express');

// Muh Routes
const redirectRouter = require('./routes/redirect');
const usersRouter = require('./routes/users');
const postDataRouter = require('./routes/postData.js');
const app = express();

// Muh Middlewares
app.use(express.json());

// All paths go to this handler
app.get('/', (_req, res) => res.send('Hello World!'));

// Redirects to base path
app.use(redirectRouter);

// Gets and prints data to the console
app.use(postDataRouter);

// Sends user data
app.use(usersRouter);

app.listen(3000, () => console.log('Example app listening on port 3000!'));
