import { useState } from 'react';
export const API_URL = import.meta.env.VITE_URL_BASE;

function RegistroMedico() {
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', dpi: '', fechaNacimiento: '', genero: '',
    direccion: '', telefono: '', fotografia: null, numeroColegiado: '',
    especialidad: '', direccionClinica: '', correo: '', contrasena: ''
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarContrasena(formData.contrasena)) {
      setErrorPassword('La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número.');
      return;
    }
    setErrorPassword('');
    console.log("Datos a enviar del Médico:", formData);

    let fotografiaBase64 = null;
    if (formData.fotografia) {
      fotografiaBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(formData.fotografia);
      });
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/register-medico`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nombre: formData.nombre ,
              apellido: formData.apellido,
              dpi: formData.dpi,
              fecha_nacimiento: formData.fechaNacimiento,
              genero: formData.genero,
              direccion: formData.direccion ,
              telefono: formData.telefono,
              fotografia: fotografiaBase64,
              numero_colegiado: formData.numeroColegiado,
              especialidad: formData.especialidad,
              direccion_clinica: formData.direccionClinica,
              correo: formData.correo,
              password: formData.contrasena
            })
          });

          const data = await response.json();
          console.log(formData.fotografia);

          if (!response.ok) {
            setErrorPassword('Error al registrar');
            return;
          }
    
          alert('Paciente registrado correctamente! Tu cuenta está pendiente de aprobación.');
        
        } catch (error) {
          console.log(error);
        }

  };

  return (
    <div className="formulario-contenedor">
      <h2>Registro de Médico</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="nombre" placeholder="Nombre" onChange={handleChange} required />
        <input type="text" name="apellido" placeholder="Apellido" onChange={handleChange} required />
        <input type="text" name="dpi" placeholder="DPI" onChange={handleChange} required />
        
        <label>Fecha de Nacimiento:</label>
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
        {errorPassword && <p style={{color: 'red', fontSize: '12px'}}>{errorPassword}</p>}
        
        <button type="submit">Registrar Médico</button>
      </form>
    </div>
  );
}

export default RegistroMedico;