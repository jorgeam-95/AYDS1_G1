import { useState } from 'react';
import RegistroPaciente from './components/RegistroPaciente';
import RegistroMedico from './components/RegistroMedico';
import './App.css';

function App() {
  const [tipoRegistro, setTipoRegistro] = useState('paciente');

  return (
    <div className="app-container">
      <h1>SaludPlus</h1>
      <div className="botones-seleccion">
        <button onClick={() => setTipoRegistro('paciente')}>Soy Paciente</button>
        <button onClick={() => setTipoRegistro('medico')}>Soy Médico</button>
      </div>

      <div className="formularios-render">
        {tipoRegistro === 'paciente' ? <RegistroPaciente /> : <RegistroMedico />}
      </div>
    </div>
  );
}

export default App;