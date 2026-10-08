import '@fontsource-variable/rubik';
import './index.css';
import './stores/configure-mobx';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app';
import { syncDocumentLanguage } from './services/document-language';
import { watchLayout } from './services/layout';
import { createRootStore } from './stores';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Missing #root element in index.html');
}

const store = createRootStore();

// Development only: the root store as `window.wildTable`, for poking at it from the console.
if (import.meta.env.DEV) {
  Object.assign(window, { wildTable: store });
}

syncDocumentLanguage(store.locale);
watchLayout(store.ui.layout);
store.art.load();
store.room.open();

createRoot(rootElement).render(
  <StrictMode>
    <App store={store} />
  </StrictMode>,
);
