// For logging out a user
import axios from 'axios';
import { setAlert } from './alert';

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });

    if (res.data.status === 'success') {
      setAlert('success', 'Logged out successfully!');
      location.assign('/');
    }
  } catch (err) {
    setAlert('error', 'Could not log out. Try again!');
  }
};
