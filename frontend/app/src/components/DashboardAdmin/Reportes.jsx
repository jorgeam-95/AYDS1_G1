import { useState, useEffect } from 'react';
export const API_URL = import.meta.env.VITE_URL_BASE;

function Reportes() {
  const [topMedicos, setTopMedicos] = useState([]);
  const [citasPorEspecialidad, setCitasPorEspecialidad] = useState([]);

  useEffect(() => {
    obtenerTopMedicos();
    obtenerCitasPorEspecialidad();
  }, []);

  const obtenerTopMedicos = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/reportes/top-medicos`);
      const data = await res.json();
      setTopMedicos(data);
    } catch (error) {
      console.error(error);
    }
  };

  const obtenerCitasPorEspecialidad = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/reportes/citas-especialidad`);
      const data = await res.json();
      setCitasPorEspecialidad(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: '#0056b3' }}>Reportes Analíticos</h2>

      {/* Reporte 1: Top médicos con más citas atendidas */}
      <div style={{ marginBottom: '40px' }}>
        <h3>Top Médicos con más Citas Atendidas</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#0056b3', color: 'white' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>#</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Médico</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Especialidad</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Citas Atendidas</th>
            </tr>
          </thead>
          <tbody>
            {topMedicos.map((m, i) => (
              <tr key={m.id} style={{ backgroundColor: i % 2 === 0 ? '#f4f7f6' : 'white' }}>
                <td style={{ padding: '10px' }}>{i + 1}</td>
                <td style={{ padding: '10px' }}>{m.nombre} {m.apellido}</td>
                <td style={{ padding: '10px' }}>{m.especialidad}</td>
                <td style={{ padding: '10px', fontWeight: 'bold', color: '#0056b3' }}>{m.total_citas}</td>
              </tr>
            ))}
            {topMedicos.length === 0 && (
              <tr><td colSpan="4" style={{ padding: '10px', textAlign: 'center' }}>No hay datos</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Reporte 2: Citas por especialidad */}
      <div>
        <h3>Citas por Especialidad</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#0056b3', color: 'white' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>Especialidad</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Total Citas</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Atendidas</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Canceladas</th>
            </tr>
          </thead>
          <tbody>
            {citasPorEspecialidad.map((e, i) => (
              <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#f4f7f6' : 'white' }}>
                <td style={{ padding: '10px' }}>{e.especialidad}</td>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>{e.total}</td>
                <td style={{ padding: '10px', color: 'green' }}>{e.atendidas}</td>
                <td style={{ padding: '10px', color: 'red' }}>{e.canceladas}</td>
              </tr>
            ))}
            {citasPorEspecialidad.length === 0 && (
              <tr><td colSpan="4" style={{ padding: '10px', textAlign: 'center' }}>No hay datos</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Reportes;