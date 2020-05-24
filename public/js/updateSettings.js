// For updating user details
import axios from 'axios';
import { setAlert } from './alert';

// data = request body and type = password | settings
export const updateDetails = async (data, type) => {
  const url = type === 'password' ? 'updatePassword' : 'updateMe';
  try {
    const res = await axios({
      method: 'PATCH',
      url: `http://localhost:3000/api/v1/users/${url}`,
      data,
    });
    if (res.data.status === 'success') {
      setAlert('success', 'Updated details!');
      setTimeout(() => {
        location.reload(true);
      }, 1500);
    }
  } catch (err) {
    console.log(err.response);
    setAlert('error', err.response.data.message);
  }
};
