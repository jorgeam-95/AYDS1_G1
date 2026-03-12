import { useState } from 'react';

function RegistroMedico() {
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', dpi: '', fechaNacimiento: '', genero: '',
    direccion: '', telefono: '', fotografia: null, numeroColegiado: '',
    especialidad: '', direccionClinica: '', correo: '', contrasena: ''
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Datos del Médico:", formData);
    // Validación y envío
  };

  return (
    <div className="formulario-contenedor">
      <h2>Registro de Médico</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="nombre" placeholder="Nombre" onChange={handleChange} required />
        <input type="text" name="apellido" placeholder="Apellido" onChange={handleChange} required />
        <input type="text" name="dpi" placeholder="DPI" onChange={handleChange} required />
        <input type="date" name="fechaNacimiento" onChange={handleChange} required />
        
        <select name="genero" onChange={handleChange} required>
          <option value="">Seleccione Género</option>
          <option value="masculino">Masculino</option>
          <option value="femenino">Femenino</option>
        </select>

        <input type="text" name="direccion" placeholder="Dirección Personal" onChange={handleChange} required />
        <input type="tel" name="telefono" placeholder="Teléfono" onChange={handleChange} required />
        
        <label>Fotografía (Obligatoria):</label>
        <input type="file" name="fotografia" accept="image/*" onChange={handleChange} required />
        
        <input type="text" name="numeroColegiado" placeholder="Número de Colegiado" onChange={handleChange} required />
        <input type="text" name="especialidad" placeholder="Especialidad" onChange={handleChange} required />
        <input type="text" name="direccionClinica" placeholder="Dirección de la Clínica" onChange={handleChange} required />
        
        <input type="email" name="correo" placeholder="Correo Electrónico" onChange={handleChange} required />
        <input type="password" name="contrasena" placeholder="Contraseña" onChange={handleChange} required />
        
        <button type="submit">Registrar Médico</button>
      </form>
    </div>
  );
}

export default RegistroMedico;