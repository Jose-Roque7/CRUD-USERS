import axios from 'axios';

const api = axios.create({
  baseURL: 'https://roquesoft.com:5000/Api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
