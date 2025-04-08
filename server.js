import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../../client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port 3000`);
});

// Muh Middlewares
app.use(express.json());

// All paths go to this handler
// Eventually serves the app code for the Giffy app
app.get('/', (_req, res) => res.send('Hello World!'));

// Handles CRUD opperations for the Giffy app
app.use('/giffy', giffyRouter);

// Stops people form being idiots
app.use(redirectRouter);

app.listen(3000, () => console.log('Example app listening on port 3000!'));
