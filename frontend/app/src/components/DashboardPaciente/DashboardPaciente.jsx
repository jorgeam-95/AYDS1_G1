import React, { act } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPaciente.css';

import BuscarMedico from './BuscarMedico';
import MisCitas from './MisCitas';
import HistorialCitasPaciente from './HistorialCitasPaciente';

const DashboardPaciente = () => {
    const navigate = useNavigate();
    const [seccion, setSeccion] = useState("inicio");

    const token =  localStorage.getItem("token");
    let aprobado = false;
    let activo = false;

    if ( token ){
        try{
            const payload = JSON.parse(atob(token.split('.')[1]));
            aprobado = payload.aprobado;
            activo = payload.activo;
        }catch ( error ){
            console.log("Token Invalido");
        }
    }

    const renderContenido = () => {
        switch (seccion) {
        case "Agendar Cita":
            return <BuscarMedico />
        case "Mis Cistas Pendientes":
            return <MisCitas></MisCitas>;
        case "Historial de Citas":
            return <HistorialCitasPaciente></HistorialCitasPaciente>;    
        case "Datos":
            return <h2>Datos </h2>;
        default:
            return <h2>Bienvenido al Dashboard</h2>;
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

     if (!aprobado || !activo) {
        return (
        <div className="dashboard-container">
            <div className="contenido" style={{ width: "100%" }}>
            <h2>Cuenta pendiente</h2>
            <p>
                Ponerse en contacto con el administrador. Su usuario todavía está pendiente.
            </p>

            <button onClick={handleLogout} className="logout">
                Cerrar sesión
            </button>
            </div>
        </div>
        );
    }

    return (
        <div className="dashboard-container">
        <div className="sidebar">
            <div>
            <h2>SaludPlus</h2>
            <button className={seccion === "Horarios" ? "active" : ""} onClick={() => setSeccion("Agendar Cita")}>
                Agendar Cita
            </button>
            <button className={seccion === "Mis Cistas Pendientes" ? "active" : ""} onClick={() => setSeccion("Mis Cistas Pendientes")}>
                Mis Cistas Pendientes
            </button>
            <button className={seccion === "Historial de Citas" ? "active" : ""} onClick={() => setSeccion("Historial de Citas")}>
                Historial de Citas
            </button>
            <button className={seccion === "Datos Personales" ? "active" : ""} onClick={() => setSeccion("Datos")}>
                Datos
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

export default DashboardPaciente;