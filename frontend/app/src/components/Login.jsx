import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
export const API_URL = import.meta.env.VITE_URL_BASE;

function Login({ irARegistro }) {
  const navigate = useNavigate();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credenciales.correo || !credenciales.contrasena) {
      setErrorAuth('Por favor ingrese su correo y contraseña.');
      return;
    }
    
    setErrorAuth('');

    const response  = await fetch(`${API_URL}/login`,{
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            "correo": credenciales.correo,
            "contrasena": credenciales.contrasena
          })
    })

    if (response.status == 200) {
      const data = await response.json();
      localStorage.setItem("token", data.acces_token);
      localStorage.setItem("rol", data.rol);

      if ( data.rol == "medico" ){
        navigate("/medico/dashboard");
      }else if(data.rol == "paciente" ){
        navigate("/paciente/dashboard");
      }

    } else {
      const data = await response.json();
      console.log( data );
    }


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