import { useState } from 'react';
import Login from './components/Login';
import LoginAdmin from './components/LoginAdmin';
import AprobarUsuarios from './components/AprobarUsuarios';
import RegistroPaciente from './components/RegistroPaciente';
import RegistroMedico from './components/RegistroMedico';
import './App.css';

function App() {
  // Ahora la aplicación inicia en una pantalla de menú general
  const [vista, setVista] = useState('inicio'); 

  return (
    <div className="app-container">
      <h1>SaludPlus</h1>
      
      {/* Menú Principal */}
      {vista === 'inicio' && (
        <div className="botones-seleccion" style={{ flexDirection: 'column', alignItems: 'center' }}>
          <p style={{marginBottom: '15px', color: '#555', fontSize: '1.2rem'}}>¿Cómo deseas ingresar?</p>
          <button onClick={() => setVista('loginNormal')} style={{ width: '250px' }}>Pacientes y Médicos</button>
          
          <button onClick={() => setVista('loginAdmin')} style={{ width: '250px', backgroundColor: '#333', borderColor: '#333', color: 'white' }}>Administrador</button>
          {/* BOTÓN TEMPORAL PARA VER TU NUEVA PANTALLA */}
          {/* <button onClick={() => setVista('aprobarUsuarios')} style={{ width: '300px', backgroundColor: '#28a745', borderColor: '#28a745', color: 'white', marginTop: '20px' }}>
            [Test] Ver Panel de Aprobación
          </button> */}
        </div>
      )}

      {/* Botones de navegación (solo visibles en vistas normales de pacientes/médicos) */}
      {(vista === 'paciente' || vista === 'medico' || vista === 'loginNormal') && (
        <div className="botones-seleccion">
          <button onClick={() => setVista('loginNormal')}>Iniciar Sesión</button> 
          <button onClick={() => setVista('paciente')}>Soy Paciente</button>
          <button onClick={() => setVista('medico')}>Soy Médico</button>
          
          
          <button 
            onClick={() => setVista('inicio')} 
            style={{ backgroundColor: '#e0e0e0', color: '#333', borderColor: '#cccccc' }}
          >
            Volver al Menú
          </button>
        </div>
      )}

      {/* Renderizado de las pantallas según la selección del usuario */}
      <div className="formularios-render">
        {vista === 'loginNormal' && <Login irARegistro={() => setVista('paciente')} />}
        {vista === 'aprobarUsuarios' && <AprobarUsuarios />}
        
        {vista === 'loginAdmin' && (
          <>
            <LoginAdmin />
            <button 
              onClick={() => setVista('inicio')} 
              style={{ display: 'block', margin: '20px auto', padding: '10px 20px', backgroundColor: 'transparent', border: 'none', color: '#0056b3', textDecoration: 'underline', cursor: 'pointer' }}
            >
              Cancelar y volver al Menú
            </button>
          </>
        )}
        
        {vista === 'paciente' && <RegistroPaciente />}
        {vista === 'medico' && <RegistroMedico />}
      </div>
    </div>
  );
}

export default App;