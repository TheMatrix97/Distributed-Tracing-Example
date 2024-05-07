const express = require('express');
const axios = require('axios');

const app = express();

app.use('/', async (req, res) => {
  const id = req.query.id;
  const name = await getDogName(id);
  res.send(name);
});

app.listen('8080', '0.0.0.0');

async function getDogName(id) {
  const names = ['Rufus', 'Rex', 'Dobby', 'Möhre', 'Jack', 'Charlie'];
  await new Promise((resolve) => setTimeout(resolve, 100));
  return names[id];
}