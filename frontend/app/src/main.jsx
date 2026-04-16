import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";

import './index.css'
import App from './App.jsx'
import DashboardAdmin from './components/DashboardAdmin/DashboardAdmin.jsx';
import ProtectedRoute from './components/RutaProtegidas/ProtectedRoute.jsx';
import DashboardMedico from './components/DashboardMedico/DashboardMedico.jsx';
import DashboardPaciente from './components/DashboardPaciente/DashboardPaciente.jsx';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={ <App /> } />
        <Route path='/admin/dashboard' element={ 
          <ProtectedRoute rolRequerido="admin">
            <DashboardAdmin />
          </ProtectedRoute> 
          } />
        <Route path='/medico/dashboard' element={
          <ProtectedRoute rolRequerido="medico">
            <DashboardMedico />
          </ProtectedRoute>
         } />
        <Route path='/paciente/dashboard' element={
          <ProtectedRoute rolRequerido="paciente">
            <DashboardPaciente />
          </ProtectedRoute>
         } />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
