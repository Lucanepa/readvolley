import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { api } from './services/api'

// Fetch (or read from cache) the whole dataset at first load so every section
// is ready, and usable offline, before the user opens it.
api.preload().catch(() => {})

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
