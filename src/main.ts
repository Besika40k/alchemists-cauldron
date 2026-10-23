import './styles/main.css';

import { startApp } from './app/start-app';

const root: HTMLElement | null = document.querySelector('#app');

if (root) {
  startApp(root);
}
