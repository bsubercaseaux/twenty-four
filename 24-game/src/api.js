import axios from 'axios';
axios.defaults.withCredentials = true;

const api = 'https://bsub.cl/api/';

export async function post(path, data = {}) {
  const jsonString = JSON.stringify(data);
  try {
    const response = await axios.post(api + path, jsonString, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
    });
    console.log('response:', response);
    return response.data;
  } catch (error) {
    return { ERROR: error };
  }
}

