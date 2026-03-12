import { useState } from 'react';

function RegistroPaciente() {
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', dpi: '', genero: '', direccion: '',
    telefono: '', fechaNacimiento: '', fotografia: null,
    correo: '', contrasena: ''
  });
  const [errorPassword, setErrorPassword] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value
    });
  };

  const validarContrasena = (password) => {
    // Regex: Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validarContrasena(formData.contrasena)) {
      setErrorPassword('La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número.');
      return;
    }
    setErrorPassword('');
    console.log("Datos a enviar del Paciente:", formData);
    // Aquí irá tu conexión al backend (fetch o axios)
  };

  return (
    <div className="formulario-contenedor">
      <h2>Registro de Paciente</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="nombre" placeholder="Nombre" onChange={handleChange} required />
        <input type="text" name="apellido" placeholder="Apellido" onChange={handleChange} required />
        <input type="text" name="dpi" placeholder="DPI" onChange={handleChange} required />
        
        <select name="genero" onChange={handleChange} required>
          <option value="">Seleccione Género</option>
          <option value="masculino">Masculino</option>
          <option value="femenino">Femenino</option>
        </select>

        <input type="text" name="direccion" placeholder="Dirección" onChange={handleChange} required />
        <input type="tel" name="telefono" placeholder="Teléfono" onChange={handleChange} required />
        
        <label>Fecha de Nacimiento:</label>
        <input type="date" name="fechaNacimiento" onChange={handleChange} required />
        
        <label>Fotografía (Opcional):</label>
        <input type="file" name="fotografia" accept="image/*" onChange={handleChange} />
        
        <input type="email" name="correo" placeholder="Correo Electrónico" onChange={handleChange} required />
        
        <input type="password" name="contrasena" placeholder="Contraseña" onChange={handleChange} required />
        {errorPassword && <p style={{color: 'red', fontSize: '12px'}}>{errorPassword}</p>}
        
        <button type="submit">Registrar Paciente</button>
      </form>
    </div>
  );
}

export default RegistroPaciente;