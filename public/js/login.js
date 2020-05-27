// Client side js for making calls to login endpoint
import axios from 'axios';
import { setAlert } from './alert';

export const login = async (email, password) => {
  // Use axios to send http requests to server
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      setAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/'); // Redirects to home page
      }, 1500);
    }
  } catch (err) {
    setAlert('error', err.response.data.message);
  }
};
