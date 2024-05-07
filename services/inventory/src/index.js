const express = require('express');
const axios = require('axios');
//const opentracing = require('opentracing');

//const { createTracer } = require('./tracer.js');

/*const tracer = createTracer(
  'inventory-service',
  'http://collector:14268/api/traces'
);*/

const app = express();

app.use('/', async (req, res) => {
  const id = req.query.kennelId;
  const ids = await getInventoryByKennelId(id);
  res.send(ids);
});

app.listen('8080', '0.0.0.0');

async function getInventoryByKennelId(id) {
  const inventory = [[0], [1, 2], [3, 4, 5]];
  await new Promise((resolve) => setTimeout(resolve, 100));
  return inventory[id];
}