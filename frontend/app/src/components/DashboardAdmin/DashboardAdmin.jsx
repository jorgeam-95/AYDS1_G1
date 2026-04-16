import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';


import AprobarUsuarios from '../AprobarUsuarios';

const DashboardAdmin = ({ irA }) => {
  const navigate = useNavigate();
  const [seccion, setSeccion] = useState("inicio");

  const renderContenido = () => {
    switch (seccion) {
      case "Inicio":
        return <h2>Listado de Pacientes</h2>;
      case "Lista de Usuarios":
        //return <h2>Listado de Médicos</h2>;
        return <AprobarUsuarios></AprobarUsuarios>
      case "Dar de Baja":
        return <h2>Gestión de Citas</h2>;
      default:
        return <h2>Bienvenido al Dashboard</h2>;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div>
          <h2>SaludPlus</h2>
          <button onClick={() => setSeccion("inicio")}>
            Inicio
          </button>
          <button onClick={() => setSeccion("Lista de Usuarios")}>
            Lista de Usuarios
          </button>
          <button onClick={() => setSeccion("Dar de Baja")}>
            Dar de Baja
          </button>
        </div>
        <button className="logout" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
      <div className="contenido">
        {renderContenido()}
      </div>

    </div>
  );
};

export default DashboardAdmin;