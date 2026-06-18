import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider }      from './contexts/AuthContext'
import { AdminAuthProvider } from './contexts/AdminAuthContext'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Student auth — Supabase (unchanged) */}
      <AuthProvider>
        {/* Admin auth — Custom JWT (separate system) */}
        <AdminAuthProvider>
          <App />
        </AdminAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
