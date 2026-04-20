import { useState, useEffect } from 'react';
export const API_URL = import.meta.env.VITE_URL_BASE;

function AprobarUsuarios() {
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);

  useEffect(() => {
      obtenerPacientes();
      obtenerMedicos();
  }, []);

  const obtenerPacientes = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/pacientes/pendientes`);
      const data = await res.json();

      setPacientes(data);
    } catch (error) {
      console.error("Error al obtener pacientes:", error);
    }
  };

  const obtenerMedicos = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/medicos/pendientes`);
      const data = await res.json();

      setMedicos(data);
    } catch (error) {
      console.error("Error al obtener pacientes:", error);
    }
  };

  const manejarAccionPaciente = async (id, accion) => {
    const response  = await fetch(`${API_URL}/admin/aprobar/usuario`,{
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        "correo": id,
        "tipo": "paciente"
      })
    })

    if (response.status == 200) {
      obtenerMedicos();
    } else {
      console.log( response );  
    }
  };

  const manejarAccionMedico = async (id, accion) => {
    const response  = await fetch(`${API_URL}/admin/aprobar/usuario`,{
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        "correo": id,
        "tipo": "medico"
      })
    })

    if (response.status == 200) {
      obtenerMedicos();
    } else {
      console.log( response );  
    }

  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center ', gap: '30px' }}>
        <h2 style={{ color: '#0056b3', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px' }}>
          Aprobación de Usuarios
        </h2>
        <button className="boton-actualizar"> Actualizar </button>
      </div>

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
                  <button onClick={() => manejarAccionPaciente(paciente.correo, 'Aceptado')} style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Aceptar</button>
                  <button onClick={() => manejarAccionPaciente(paciente.correo, 'Rechazado')} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Rechazar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '40px' }}>
        <h3 style={{ color: '#333' }}>Médicos Pendientes</h3>
        {medicos.length === 0 ? (
          <p>No hay médicos pendientes de aprobación.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {medicos.map(medico => (
              <div key={medico.dpi} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <img src={medico.foto} alt="Foto" style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
                  <div>
                    <p style={{ margin: '0', fontWeight: 'bold' }}>{medico.nombre} (Col: {medico.colegiado})</p>
                    <p style={{ margin: '0', fontSize: '0.9rem', color: '#666' }}>{medico.especialidad} | DPI: {medico.dpi} | {medico.correo}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => manejarAccionMedico(medico.correo, 'Aceptado')} style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Aceptar</button>
                  <button onClick={() => manejarAccionMedico(medico.correo, 'Rechazado')} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Rechazar</button>
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