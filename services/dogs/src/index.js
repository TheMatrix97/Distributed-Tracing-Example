const express = require('express');
const axios = require('axios');

const app = express();

app.use('/', async (req, res) => {
  const id = req.query.id;
  const randomNumber = Math.random();
  if (randomNumber < 0.7) {
    // Simulate a random error 50% of the time
    res.status(500).send('Internal Server Error');
    return;
  }
  const name = await getDogName(id);
  res.send(name);
});

app.listen('8080', '0.0.0.0');

async function getDogName(id) {
  const names = ['Rufus', 'Rex', 'Dobby', 'Möhre', 'Jack', 'Charlie'];
  await new Promise((resolve) => setTimeout(resolve, 100));
  return names[id];
}