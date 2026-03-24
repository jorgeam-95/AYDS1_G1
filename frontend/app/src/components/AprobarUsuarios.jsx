import { useState } from 'react';

function AprobarUsuarios() {
  // Datos simulados (Mock data) de pacientes pendientes
  const [pacientes, setPacientes] = useState([
    { id: 1, nombre: 'Juan Pérez', dpi: '1234567890101', genero: 'Masculino', fechaNac: '1990-05-15', correo: 'juan@email.com', foto: 'https://via.placeholder.com/50' }
  ]);

  // Datos simulados (Mock data) de médicos pendientes
  const [medicos, setMedicos] = useState([
    { id: 1, nombre: 'Dra. María Gómez', dpi: '9876543210101', genero: 'Femenino', especialidad: 'Cardiología', colegiado: '12345', correo: 'maria@email.com', foto: 'https://via.placeholder.com/50' }
  ]);

  const manejarAccionPaciente = (id, accion) => {
    // Aquí irá la petición al backend para cambiar el estado en la base de datos
    console.log(`Paciente ${id} ha sido ${accion}`);
    // Quitamos al usuario de la lista visualmente
    setPacientes(pacientes.filter(paciente => paciente.id !== id));
    alert(`Paciente ${accion} exitosamente.`);
  };

  const manejarAccionMedico = (id, accion) => {
    // Aquí irá la petición al backend para cambiar el estado en la base de datos
    console.log(`Médico ${id} ha sido ${accion}`);
    // Quitamos al usuario de la lista visualmente
    setMedicos(medicos.filter(medico => medico.id !== id));
    alert(`Médico ${accion} exitosamente.`);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ color: '#0056b3', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px' }}>
        Aprobación de Usuarios
      </h2>

      {/* SECCIÓN DE PACIENTES */}
      <div style={{ marginTop: '30px' }}>
        <h3 style={{ color: '#333' }}>Pacientes Pendientes</h3>
        {pacientes.length === 0 ? (
          <p>No hay pacientes pendientes de aprobación.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {pacientes.map(paciente => (
              <div key={paciente.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <img src={paciente.foto} alt="Foto" style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
                  <div>
                    <p style={{ margin: '0', fontWeight: 'bold' }}>{paciente.nombre} (DPI: {paciente.dpi})</p>
                    <p style={{ margin: '0', fontSize: '0.9rem', color: '#666' }}>{paciente.genero} | Nacimiento: {paciente.fechaNac} | {paciente.correo}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => manejarAccionPaciente(paciente.id, 'Aceptado')} style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Aceptar</button>
                  <button onClick={() => manejarAccionPaciente(paciente.id, 'Rechazado')} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Rechazar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECCIÓN DE MÉDICOS */}
      <div style={{ marginTop: '40px' }}>
        <h3 style={{ color: '#333' }}>Médicos Pendientes</h3>
        {medicos.length === 0 ? (
          <p>No hay médicos pendientes de aprobación.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {medicos.map(medico => (
              <div key={medico.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <img src={medico.foto} alt="Foto" style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
                  <div>
                    <p style={{ margin: '0', fontWeight: 'bold' }}>{medico.nombre} (Col: {medico.colegiado})</p>
                    <p style={{ margin: '0', fontSize: '0.9rem', color: '#666' }}>{medico.especialidad} | DPI: {medico.dpi} | {medico.correo}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => manejarAccionMedico(medico.id, 'Aceptado')} style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Aceptar</button>
                  <button onClick={() => manejarAccionMedico(medico.id, 'Rechazado')} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Rechazar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AprobarUsuarios;