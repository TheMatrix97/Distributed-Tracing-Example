const axios = require('axios');

function getKennelName(id) {
  const name = ['awesome kennel', 'not as awesome kennel', 'some other kennel'][
    id
  ];
  return name;
}

async function getDogDetails(id) {
  let name;
  try {
    let headers = {};
    const res = await axios.get(`http://dogs:8080/?id=${id}`, { headers });
    name = res.data;
  } catch (e) {
    console.log(e);
  }
  return name || 'Nameless Dog';
}

async function getInventory(id) {
  let result;

  try {
    let headers = {};
    const response = await axios.get(`http://inventory:8080/?kennelId=${id}`, {
      headers,
    });
    result = response.data;
  } catch (e) {
    console.log(e);
    result = [];
  }

  return result;
}

module.exports = {
  getKennelName,
  getDogDetails,
  getInventory,
};