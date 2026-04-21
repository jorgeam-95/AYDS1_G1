import React, { useEffect, useState } from "react";
import "./HistorialCitasMedico.css";

export const API_URL = import.meta.env.VITE_URL_BASE;

const HistorialCitasMedico = () => {
    const [citas, setCitas] = useState([]);
    const [filtro, setFiltro] = useState("");
    const [modalAbierto, setModalAbierto] = useState(false);
    const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);
    const [tipoDetalle, setTipoDetalle] = useState("");
    const [puntuacion, setPuntuacion] = useState(1);
    const [comentario, setComentario] = useState("");
    const [motivoReporte, setMotivoReporte] = useState("");

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
                    body: JSON.stringify({
                        tipo: "medico",
                        correo: correoMedico
                    })
                }
            );

            const data = await response.json();
            setCitas(data);
        } catch (error) {
            console.error("Error al obtener el historial:", error);
        }
    };

    const abrirModal = (cita, tipo) => {
        alert(tipo);
        setDetalleSeleccionado(cita);
        setTipoDetalle(tipo);
        setModalAbierto(true);

        setPuntuacion(1);
        setComentario("");
        setMotivoReporte("");
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setDetalleSeleccionado(null);
    };

    const confirmarAccion = async () => {
        try {
            let endpoint = "";
            let payload = {};

            if (tipoDetalle === "calificar") {
                endpoint = `${API_URL}/medico/calificar-paciente`;
                payload = {
                    cita_id: detalleSeleccionado.id,
                    puntuacion: Number(puntuacion),
                    comentario: comentario
                };
            }

            if (tipoDetalle === "reportar") {
                endpoint = `${API_URL}/medico/reportar-paciente`;
                payload = {
                    cita_id: detalleSeleccionado.id,
                    motivo: motivoReporte
                };
            }

            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                alert("Acción realizada correctamente");
                obtenerHistorial();
                cerrarModal();
            } else {
                alert(data.detail);
            }

        } catch (error) {
            console.error(error);
            alert("Error al procesar la solicitud");
        }
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
                                    <span className={`estado ${cita.estado.toLowerCase()}`}>
                                        {cita.estado}
                                    </span>
                                </td>

                                <td>
                                    {["atendida", "completada"].includes(cita.estado.toLowerCase()) && (
                                        <>
                                            <button
                                                className="btn-receta"
                                                onClick={() => abrirModal(cita, "receta")}
                                            >
                                                Ver Receta
                                            </button>

                                            {!cita.ya_calificado && (
                                                <button
                                                    className="btn-calificar"
                                                    onClick={() => abrirModal(cita, "calificar")}
                                                >
                                                    Calificar Paciente
                                                </button>
                                            )}

                                            {!cita.ya_reportado && (
                                                <button
                                                    className="btn-reportar"
                                                    onClick={() => abrirModal(cita, "reportar")}
                                                >
                                                    Reportar Paciente
                                                </button>
                                            )}
                                        </>
                                    )}

                                    {cita.estado.toLowerCase() === "cancelada" && (
                                        <button
                                            className="btn-cancelada"
                                            onClick={() => abrirModal(cita, "cancelacion")}
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
                            {{
                                receta: "Receta Médica",
                                cancelacion: "Motivo de Cancelación",
                                calificar: "Calificar Paciente",
                                reportar: "Reportar Paciente"
                            }[tipoDetalle]}
                        </h3>

                        {(() => {
                            switch (tipoDetalle) {

                                case "receta":
                                    return (
                                        <div>
                                            <p>
                                                <strong>Observaciones:</strong>{" "}
                                                {detalleSeleccionado.observaciones || "No disponibles"}
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
                                                        {detalleSeleccionado.detalles.map((d, i) => (
                                                            <tr key={i}>
                                                                <td>{d.medicamento}</td>
                                                                <td>{d.dosis}</td>
                                                                <td>{d.indicaciones}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    );

                                case "cancelacion":
                                    return (
                                        <p>
                                            {detalleSeleccionado.motivo_cancelacion ||
                                                "No se especificó un motivo."}
                                        </p>
                                    );

                                case "calificar":
                                    return (
                                        <div>
                                            <p>¿Cómo fue el comportamiento del paciente?</p>

                                            <select
                                                className="input-busqueda"
                                                value={puntuacion}
                                                onChange={(e) => setPuntuacion(e.target.value)}
                                            >
                                                <option value="1">1 - Muy malo</option>
                                                <option value="2">2 - Malo</option>
                                                <option value="3">3 - Regular</option>
                                                <option value="4">4 - Bueno</option>
                                                <option value="5">5 - Excelente</option>
                                            </select>

                                            <textarea
                                                placeholder="Comentario..."
                                                className="input-busqueda"
                                                value={comentario}
                                                onChange={(e) => setComentario(e.target.value)}
                                            />
                                        </div>
                                    );

                                case "reportar":
                                    return (
                                        <textarea
                                            placeholder="Describe el problema con el paciente..."
                                            className="input-busqueda"
                                            value={motivoReporte}
                                            onChange={(e) => setMotivoReporte(e.target.value)}
                                        />
                                    );

                                default:
                                    return null;
                            }
                        })()}

                        <div className="modal-buttons">

                            {(tipoDetalle === "calificar" || tipoDetalle === "reportar") && (
                                <button
                                    className="btn-receta"
                                    onClick={confirmarAccion}
                                >
                                    Confirmar
                                </button>
                            )}

                            <button className="btn-cerrar" onClick={cerrarModal}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistorialCitasMedico;