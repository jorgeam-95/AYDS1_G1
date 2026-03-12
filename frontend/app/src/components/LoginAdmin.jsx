import { useState } from 'react';

function LoginAdmin() {
  // Controla en qué paso de la autenticación estamos (1 o 2)
  const [paso, setPaso] = useState(1);
  
  // Estado para el Paso 1
  const [credenciales, setCredenciales] = useState({ usuario: '', contrasena: '' });
  
  // Estado para el Paso 2
  const [archivoAuth, setArchivoAuth] = useState(null);
  
  // Estado para manejar errores en pantalla
  const [error, setError] = useState('');

  // Maneja los inputs de texto del Paso 1
  const handleChangePaso1 = (e) => {
    setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
  };

  // Maneja la subida del archivo en el Paso 2
  const handleFileChange = (e) => {
    setArchivoAuth(e.target.files[0]);
    setError(''); // Limpiamos errores al seleccionar un nuevo archivo
  };

  // Simula el envío del Paso 1
  const handleSubmitPaso1 = (e) => {
    e.preventDefault();
    if (!credenciales.usuario || !credenciales.contrasena) {
      setError('Por favor ingrese usuario y contraseña.');
      return;
    }
    
    setError('');
    console.log("Validando credenciales en backend:", credenciales);
    
    // AQUÍ IRÁ TU PETICIÓN AL BACKEND
    // Si el backend responde que el usuario/pass son correctos, pasamos al Paso 2:
    setPaso(2); 
  };

  // Simula el envío del Paso 2 (Validación del archivo)
  const handleSubmitPaso2 = (e) => {
    e.preventDefault();
    
    if (!archivoAuth) {
      setError('Debe subir el archivo de autenticación.');
      return;
    }

    // Validación estricta del nombre del archivo según la rúbrica
    if (archivoAuth.name !== 'auth2-ayd1.txt') {
      setError('El archivo debe llamarse exactamente "auth2-ayd1.txt"');
      return;
    }

    // Leer el contenido del archivo de texto
    const reader = new FileReader();
    reader.onload = (evento) => {
      const contenidoEncriptado = evento.target.result;
      console.log("Contenido leído del archivo:", contenidoEncriptado);
      
      setError('');
      
      // AQUÍ IRÁ TU SEGUNDA PETICIÓN AL BACKEND
      // Debes enviar "contenidoEncriptado" a tu API para que lo compare 
      // con la segunda contraseña guardada en la base de datos.
      alert("¡Autenticación de 2 pasos completada con éxito en el Frontend!");
    };
    
    // Le indicamos al lector que procese el archivo como texto
    reader.readAsText(archivoAuth);
  };

  return (
    <div className="formulario-contenedor">
      {paso === 1 ? (
        // INTERFAZ DEL PASO 1: USUARIO Y CONTRASEÑA
        <>
          <h2>Acceso Administrativo</h2>
          <p style={{textAlign: 'center', color: '#555', marginBottom: '20px'}}>Paso 1: Ingrese sus credenciales</p>
          <form onSubmit={handleSubmitPaso1}>
            <input 
              type="text" 
              name="usuario" 
              placeholder="Usuario Administrador" 
              onChange={handleChangePaso1} 
              required 
            />
            <input 
              type="password" 
              name="contrasena" 
              placeholder="Contraseña" 
              onChange={handleChangePaso1} 
              required 
            />
            
            {error && <p style={{color: 'red', fontSize: '12px', fontWeight: 'bold'}}>{error}</p>}
            
            <button type="submit">Continuar</button>
          </form>
        </>
      ) : (
        // INTERFAZ DEL PASO 2: ARCHIVO DE AUTENTICACIÓN
        <>
          <h2>Autenticación en 2 Pasos</h2>
          <p style={{textAlign: 'center', color: '#555', marginBottom: '20px'}}>
            Paso 2: Suba el archivo <strong>auth2-ayd1.txt</strong>
          </p>
          <form onSubmit={handleSubmitPaso2}>
            <input 
              type="file" 
              accept=".txt"
              onChange={handleFileChange} 
              required 
              style={{ padding: '10px 0' }}
            />
            
            {error && <p style={{color: 'red', fontSize: '12px', fontWeight: 'bold'}}>{error}</p>}
            
            <button type="submit">Verificar y Entrar</button>
            
            <button 
              type="button" 
              onClick={() => setPaso(1)}
              style={{ backgroundColor: '#e0e0e0', color: '#333', marginTop: '10px' }}
            >
              Regresar
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default LoginAdmin;