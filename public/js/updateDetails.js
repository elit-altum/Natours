// For updating user details
import axios from 'axios';
import { setAlert } from './alert';

// data = request body and type = password | settings
export const updateDetails = async (data, type) => {
  const url = type === 'password' ? 'updatePassword' : 'updateMe';
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/${url}`,
      data,
    });
    if (res.data.status === 'success') {
      setAlert('success', 'Updated details!');
      setTimeout(() => {
        location.reload(true);
      }, 1500);
    }
  } catch (err) {
    setAlert('error', err.response.data.message);
  }
};
