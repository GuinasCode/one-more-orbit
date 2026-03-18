import './style.css';
import { OneMoreOrbitApp } from './app/OneMoreOrbitApp';

const root = document.querySelector<HTMLDivElement>('#app');

if (!root) {
  throw new Error('Missing #app root element.');
}

const app = new OneMoreOrbitApp(root);
app.mount();
