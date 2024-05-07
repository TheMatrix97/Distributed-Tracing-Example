const express = require('express');
const data = require('./data');
const app = express();

app.use('/', async (req, res) => {
  const id = req.query.id;
  const name = await data.getKennelName(id);

  if (!name) {
    res.status(404);
    res.send();
    //span.finish();
    return;
  }

  const inventory = await data.getInventory(id);

  let dogs = await Promise.all(
    inventory.map(async (x) => {
      const name = await data.getDogDetails(x);
      return {
        id: x,
        name,
      };
    })
  );

  res.send({ name, dogs });
  //span.finish();
});

app.listen('8080', '0.0.0.0');