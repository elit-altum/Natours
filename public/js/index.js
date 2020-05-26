import '@babel/polyfill';
import { login } from './login';
import { logout } from './logout';
import { displayMap } from './mapbox';
import { updateDetails } from './updateDetails';

const loginForm = document.querySelector('.form--login');
const logoutButton = document.querySelector('.nav__el--logout');
const map = document.getElementById('map');
const settingsForm = document.querySelector('.form-user-data');
const passwordUpdateForm = document.querySelector('.form-user-settings');

if (map) {
  const locations = JSON.parse(map.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });
}

if (logoutButton) {
  logoutButton.addEventListener('click', logout);
}

if (settingsForm) {
  settingsForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const form = new FormData();

    form.append('email', document.getElementById('email').value);
    form.append('name', document.getElementById('name').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateDetails(form, 'settings');
  });
}

if (passwordUpdateForm) {
  passwordUpdateForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Notify user that password is updating
    document.querySelector('.password-save-button').textContent = 'Updating...';

    const oldPassword = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const newPasswordConfirm = document.getElementById('password-confirm')
      .value;

    await updateDetails(
      { oldPassword, newPassword, newPasswordConfirm },
      'password'
    );

    // Empty the fields having the data used for updation
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';

    // Set button text back to default
    document.querySelector('.password-save-button').textContent =
      'Save Password';
  });
}
