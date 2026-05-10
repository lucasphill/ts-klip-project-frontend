import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LoadingProvider } from './contexts/LoadingContext.tsx'
import { Auth0Provider } from '@auth0/auth0-react'
import { ThemeProvider } from './contexts/ThemeContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <LoadingProvider>
        <Auth0Provider
          domain={import.meta.env.VITE_AUTH0_DOMAIN}
          clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
          authorizationParams={{
            redirect_uri: window.location.origin,
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
            scope: "openid profile email"
          }}
          cacheLocation="localstorage"
        >
          <App />
        </Auth0Provider>
      </LoadingProvider>
    </ThemeProvider>
  </StrictMode>
)
