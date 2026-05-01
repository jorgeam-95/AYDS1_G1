import { useState } from 'react';
import { Link } from "react-router-dom";
export const API_URL = import.meta.env.VITE_URL_BASE;

function RegistroPaciente() {
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', dpi: '', genero: '', direccion: '',
    telefono: '', fechaNacimiento: '', fotografia: null,
    dpiPdf: null, correo: '', contrasena: ''
  });
  const [errorPassword, setErrorPassword] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };

  const validarContrasena = (password) => {
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

    let fotografiaBase64 = null;
    if (formData.fotografia) {
      fotografiaBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(formData.fotografia);
      });
    }

    let dpiPdfBase64 = null;
    if (formData.dpiPdf) {
      dpiPdfBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(formData.dpiPdf);
      });
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/register-patient`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          dpi: formData.dpi,
          genero: formData.genero,
          direccion: formData.direccion,
          telefono: formData.telefono,
          fecha_nacimiento: formData.fechaNacimiento,
          fotografia: fotografiaBase64,
          dpi_pdf: dpiPdfBase64,
          correo: formData.correo,
          password: formData.contrasena
        })
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorPassword(data.detail || 'Error al registrar');
        return;
      }
      setRegistroExitoso(true);
    } catch (error) {
      setErrorPassword('No se pudo conectar con el servidor.');
    }
  };

  if (registroExitoso) {
    return (
      <div className="formulario-contenedor">
        <h2>Registro exitoso</h2>
        <p style={{ marginTop: '15px', color: '#555' }}>
          Tu cuenta ha sido enviada al administrador para su aprobación.
        </p>
        <Link to="/" style={{ display: "inline-block", marginTop: "20px", color: "#0056b3", textDecoration: "underline", cursor: "pointer" }}>
          Volver al inicio
        </Link>
      </div>
    );
  }

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
        
        <label>Fotografía Reciente (Obligatoria):</label>
        <input type="file" name="fotografia" accept="image/*" onChange={handleChange} required />
        
        <label>DPI Escaneado en PDF (Obligatorio):</label>
        <input type="file" name="dpiPdf" accept="application/pdf" onChange={handleChange} required />
        
        <input type="email" name="correo" placeholder="Correo Electrónico" onChange={handleChange} required />
        <input type="password" name="contrasena" placeholder="Contraseña" onChange={handleChange} required />
        {errorPassword && <p style={{color: 'red', fontSize: '12px'}}>{errorPassword}</p>}
        
        <button type="submit">Registrar Paciente</button>
      </form>
    </div>
  );
}

export default RegistroPaciente;