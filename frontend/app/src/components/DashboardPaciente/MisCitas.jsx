import React, { useEffect, useState } from "react";
import "./MisCitas.css";

export const API_URL = import.meta.env.VITE_URL_BASE;

const MisCitas = () => {
    const [citas, setCitas] = useState([]);
    const [citaSeleccionada, setCitaSeleccionada] = useState(null);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [mensaje, setMensaje] = useState("");

    const token = localStorage.getItem("token");

    const obtenerCorreoPaciente = () => {
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.user;
        } catch {
            return null;
        }
    };

    const correoPaciente = obtenerCorreoPaciente();

    const obtenerCitas = async () => {
        try {
            const response = await fetch(`${API_URL}/paciente/get/horario`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ "tipo": "paciente",
                     "correo": correoPaciente })
            });

            const data = await response.json();

            if (response.ok) {
                setCitas(data);
            } else {
                setMensaje(data.detail);
            }
        } catch (error) {
            setMensaje("Error al cargar las citas.");
        }
    };

    useEffect(() => {
        obtenerCitas();
    }, []);

    const abrirModal = (cita) => {
        setCitaSeleccionada(cita);
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setCitaSeleccionada(null);
    };

    const obtenerClaseEstado = (estado) => {
        switch (estado.toLowerCase()) {
            case "pendiente":
                return "estado pendiente";
            case "confirmada":
                return "estado confirmada";
            case "cancelada":
                return "estado cancelada";
            case "completada":
                return "estado completada";
            default:
                return "estado";
        }
    };

    return (
        <div className="mis-citas-container">
            <h2>Mis Citas</h2>

            {mensaje && <p className="mensaje-error">{mensaje}</p>}

            {citas.length === 0 ? (
                <p>No tienes citas registradas.</p>
            ) : (
                <table className="tabla-citas">
                    <thead>
                        <tr>
                            <th>Médico</th>
                            <th>Especialidad</th>
                            <th>Fecha</th>
                            <th>Hora</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {citas.map((cita) => (
                            <tr key={cita.id}>
                                <td>Dr. {cita.medico_nombre} {cita.medico_apellido}</td>
                                <td>{cita.especialidad}</td>
                                <td>{cita.fecha}</td>
                                <td>{cita.hora}</td>
                                <td>
                                    <span className={obtenerClaseEstado(cita.estado)}>
                                        {cita.estado}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        className="btn-detalles"
                                        onClick={() => abrirModal(cita)}
                                    >
                                        Ver Detalles
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Modal de Detalles */}
            {modalAbierto && citaSeleccionada && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Detalles de la Cita</h3>
                        <p><strong>Médico:</strong> Dr. {citaSeleccionada.medico_nombre} {citaSeleccionada.medico_apellido}</p>
                        <p><strong>Especialidad:</strong> {citaSeleccionada.especialidad}</p>
                        <p><strong>Fecha:</strong> {citaSeleccionada.fecha}</p>
                        <p><strong>Hora:</strong> {citaSeleccionada.hora}</p>
                        <p><strong>Estado:</strong> {citaSeleccionada.estado}</p>

                        {citaSeleccionada.receta && (
                            <div className="detalle-receta">
                                <h4>Receta Médica</h4>
                                <p>{citaSeleccionada.receta}</p>
                            </div>
                        )}

                        {citaSeleccionada.motivo_cancelacion && (
                            <div className="detalle-cancelacion">
                                <h4>Motivo de Cancelación</h4>
                                <p>{citaSeleccionada.motivo_cancelacion}</p>
                            </div>
                        )}

                        <button className="btn-cerrar" onClick={cerrarModal}>
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MisCitas;