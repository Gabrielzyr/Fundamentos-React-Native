import axios from 'axios';

const api = axios.create({
  baseURL:
    'http://192.168.1.4:3333' ||
    // process.env.APP_API_URL ||
    'http://localhost:3333',
});

export default api;
