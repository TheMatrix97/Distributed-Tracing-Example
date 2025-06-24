import http from 'k6/http';
import { sleep, check } from 'k6';

const API_URL = 'http://nginx/api/v1/kennels';

export let options = {
  stages: [
    { duration: '1m', target: 50 }, // simulate ramp-up of traffic from 0 to 50 users over 1 minute
    { duration: '30m', target: 20 }, // stay at 20 users for 30 minutes
  ],
};

export default function () {
  let response = http.get(API_URL+'?id=0');
  let response2 = http.get(API_URL+'?id=1');
  let response3 = http.get(API_URL+'?id=2');
  sleep(1);
}