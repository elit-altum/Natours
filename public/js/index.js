import '@babel/polyfill';
import { login } from './login';
import { logout } from './logout';
import { displayMap } from './mapbox';

const loginForm = document.querySelector('.form');
const logoutButton = document.querySelector('.nav__el--logout');
const map = document.getElementById('map');

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
