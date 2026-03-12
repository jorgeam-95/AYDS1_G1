import { useState } from 'react';
import Login from './components/Login';
import RegistroPaciente from './components/RegistroPaciente';
import RegistroMedico from './components/RegistroMedico';
import './App.css';

function App() {
  // El estado inicial ahora es 'login'
  const [vista, setVista] = useState('login'); 

  return (
    <div className="app-container">
      <h1>SaludPlus</h1>
      
      {/* Solo mostramos los botones de selección si estamos en la vista de registro */}
      {vista !== 'login' && (
        <div className="botones-seleccion">
          <button onClick={() => setVista('paciente')}>Soy Paciente</button>
          <button onClick={() => setVista('medico')}>Soy Médico</button>
          <button 
            onClick={() => setVista('login')} 
            style={{ backgroundColor: '#e0e0e0', color: '#333', borderColor: '#cccccc' }}
          >
            Volver al Login
          </button>
        </div>
      )}

      <div className="formularios-render">
        {vista === 'login' && <Login irARegistro={() => setVista('paciente')} />}
        {vista === 'paciente' && <RegistroPaciente />}
        {vista === 'medico' && <RegistroMedico />}
      </div>
    </div>
  );
}

export default App;