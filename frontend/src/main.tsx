import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import 'react-quill-new/dist/quill.snow.css';
import { ToastProvider } from './contexts/ToastContext';
import { FontSizeProvider } from './contexts/FontSizeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RetryBanner } from './components/RetryBanner';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <FontSizeProvider>
        <ToastProvider>
          <App />
          <RetryBanner />
        </ToastProvider>
      </FontSizeProvider>
    </ErrorBoundary>
  </StrictMode>,
);

