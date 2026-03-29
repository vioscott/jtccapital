import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
if (supabaseUrl) {
  try {
    const parsed = new URL(supabaseUrl);
    const supabaseHost = parsed.origin;
    const preconnectLink = document.createElement('link');
    preconnectLink.rel = 'preconnect';
    preconnectLink.href = supabaseHost;
    document.head.appendChild(preconnectLink);

    const dnsPrefetchLink = document.createElement('link');
    dnsPrefetchLink.rel = 'dns-prefetch';
    dnsPrefetchLink.href = supabaseHost;
    document.head.appendChild(dnsPrefetchLink);
  } catch (error) {
    console.warn('Invalid VITE_SUPABASE_URL for preconnect:', supabaseUrl);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
