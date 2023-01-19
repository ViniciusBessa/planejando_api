import app from './app';

const url = process.env.URL || 'http://localhost';
const port = process.env.PORT || 5000;

app.listen(port, () =>
  console.log(`The server is listening on ${url}:${port}`)
);
