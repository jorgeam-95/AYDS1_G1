import { useState } from 'react';

function Login({ irARegistro }) {
  const [credenciales, setCredenciales] = useState({
    correo: '',
    contrasena: ''
  });
  const [errorAuth, setErrorAuth] = useState('');

  const handleChange = (e) => {
    setCredenciales({
      ...credenciales,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simulación de validación inicial
    if (!credenciales.correo || !credenciales.contrasena) {
      setErrorAuth('Por favor ingrese su correo y contraseña.');
      return;
    }
    
    setErrorAuth('');
    console.log("Intentando iniciar sesión con:", credenciales);
    
    // Aquí irá tu petición al backend. 
    // Recuerda: el backend debe validar si el usuario ya fue aprobado por el administrador.
  };

  return (
    <div className="formulario-contenedor">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          name="correo" 
          placeholder="Correo Electrónico" 
          onChange={handleChange} 
          required 
        />
        <input 
          type="password" 
          name="contrasena" 
          placeholder="Contraseña" 
          onChange={handleChange} 
          required 
        />
        
        {/* Aquí se mostrarán los errores de autenticación requeridos por la rúbrica */}
        {errorAuth && <p style={{color: 'red', fontSize: '12px', fontWeight: 'bold'}}>{errorAuth}</p>}
        
        <button type="submit">Ingresar</button>
      </form>
      
      {/* Enlace obligatorio para usuarios no registrados */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '5px' }}>¿Aún no tienes cuenta?</p>
        <button 
          type="button" 
          onClick={irARegistro}
          style={{
            background: 'none',
            border: 'none',
            color: '#0056b3',
            textDecoration: 'underline',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.95rem'
          }}
        >
          Regístrate aquí
        </button>
      </div>
    </div>
  );
}

export default Login;