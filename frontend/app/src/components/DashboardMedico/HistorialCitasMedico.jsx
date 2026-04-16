import React, { useEffect, useState } from "react";
import "./HistorialCitasMedico.css";

export const API_URL = import.meta.env.VITE_URL_BASE;

const HistorialCitasMedico = () => {
    const [citas, setCitas] = useState([]);
    const [filtro, setFiltro] = useState("");
    const [modalAbierto, setModalAbierto] = useState(false);
    const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);
    const [tipoDetalle, setTipoDetalle] = useState("");

    const token = localStorage.getItem("token");

    const obtenerCorreoMedico = () => {
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.user;
        } catch {
            return null;
        }
    };

    const correoMedico = obtenerCorreoMedico();

    useEffect(() => {
     obtenerHistorial();
    }, []);

    const obtenerHistorial = async () => {
        try {
            const response = await fetch(
                `${API_URL}/medico/get/historial-citas`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ "tipo" : "medico" , correo: correoMedico })
                }
            );

            const data = await response.json();
            console.log(data);
            setCitas(data);
        } catch (error) {
            console.error("Error al obtener el historial:", error);
        }
    };

    const abrirModal = (cita, tipo) => {
        setDetalleSeleccionado(cita);
        setTipoDetalle(tipo);
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setDetalleSeleccionado(null);
    };

    const citasFiltradas = citas.filter((cita) =>
        `${cita.paciente_nombre} ${cita.paciente_apellido}`
            .toLowerCase()
            .includes(filtro.toLowerCase())
    );

    return (
        <div className="historial-container">
            <h2>Historial de Citas</h2>

            <input
                type="text"
                placeholder="Buscar por nombre del paciente..."
                className="input-busqueda"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
            />

            <table className="tabla-historial">
                <thead>
                    <tr>
                        <th>Paciente</th>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Estado</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {citasFiltradas.length > 0 ? (
                        citasFiltradas.map((cita) => (
                            <tr key={cita.id}>
                                <td>
                                    {cita.paciente_nombre} {cita.paciente_apellido}
                                </td>
                                <td>{cita.fecha}</td>
                                <td>{cita.hora}</td>
                                <td>
                                    <span
                                        className={`estado ${cita.estado.toLowerCase()}`}
                                    >
                                        {cita.estado}
                                    </span>
                                </td>
                                <td>
                                    {cita.estado.toLowerCase() === "atendida" && (
                                        <button
                                            className="btn-receta"
                                            onClick={() =>
                                                abrirModal(cita, "receta")
                                            }
                                        >
                                            Ver Receta
                                        </button>
                                    )}

                                    {cita.estado.toLowerCase() === "cancelada" && (
                                        <button
                                            className="btn-cancelada"
                                            onClick={() =>
                                                abrirModal(cita, "cancelacion")
                                            }
                                        >
                                            Ver Motivo
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5">No hay citas en el historial.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {modalAbierto && detalleSeleccionado && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>
                            {tipoDetalle === "receta"
                                ? "Receta Médica"
                                : "Motivo de Cancelación"}
                        </h3>

                        {tipoDetalle === "receta" ? (
                            <div>
                                <p>
                                    <strong>Observaciones:</strong>{" "}
                                    {detalleSeleccionado.observaciones ||
                                        "No disponibles"}
                                </p>

                                {detalleSeleccionado.detalles?.length > 0 && (
                                    <table className="tabla-detalle">
                                        <thead>
                                            <tr>
                                                <th>Medicamento</th>
                                                <th>Dosis</th>
                                                <th>Indicaciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {detalleSeleccionado.detalles.map(
                                                (detalle, index) => (
                                                    <tr key={index}>
                                                        <td>{detalle.medicamento}</td>
                                                        <td>{detalle.dosis}</td>
                                                        <td>{detalle.indicaciones}</td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        ) : (
                            <p>
                                {detalleSeleccionado.motivo_cancelacion ||
                                    "No se especificó un motivo."}
                            </p>
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

export default HistorialCitasMedico;