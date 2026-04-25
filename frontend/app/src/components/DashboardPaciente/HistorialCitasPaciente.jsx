import React, { useEffect, useState } from "react";
import "./HistorialCitasPaciente.css";

export const API_URL = import.meta.env.VITE_URL_BASE;

const HistorialCitasPaciente = () => {
    const [citas, setCitas] = useState([]);
    const [filtro, setFiltro] = useState("");
    const [modalAbierto, setModalAbierto] = useState(false);
    const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);
    const [tipoDetalle, setTipoDetalle] = useState("");

    const [tratamiento, setTratamiento] = useState(null);
    const [mostrarTratamiento, setMostrarTratamiento] = useState(false);

    const [citaCalificacion, setCitaCalificacion] = useState(null);
    const [estrellas, setEstrellas] = useState(5);
    const [comentario, setComentario] = useState("");

    const [citaReporte, setCitaReporte] = useState(null);
    const [categoria, setCategoria] = useState("");
    const [motivo, setMotivo] = useState("");

    const token = localStorage.getItem("token");

    const obtenerCorreoPaciente = () => {
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.user;
        } catch (error) {
            console.error("Error al decodificar el token:", error);
            return null;
        }
    };

    const correoPaciente = obtenerCorreoPaciente();

    useEffect(() => {
        if (correoPaciente) {
            obtenerHistorial();
        }
    }, [correoPaciente]);

    const obtenerHistorial = async () => {
        try {
            const response = await fetch(`${API_URL}/paciente/get/historial-citas`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    tipo: "paciente",
                    correo: correoPaciente,
                }),
            });

            const data = await response.json();
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

    const verTratamiento = async (citaId) => {
        try {
            const response = await fetch(`${API_URL}/paciente/tratamiento/${citaId}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "No se pudo obtener el tratamiento");
            }

            setTratamiento(data);
            setMostrarTratamiento(true);
        } catch (error) {
            alert(error.message);
        }
    };

    const imprimirPDF = (citaId) => {
        window.open(`${API_URL}/paciente/receta/pdf/${citaId}`, "_blank");
    };

    const enviarCalificacion = async () => {
        if (estrellas < 0 || estrellas > 5) {
            alert("La calificación debe estar entre 0 y 5");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/paciente/calificar-medico`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    cita_id: citaCalificacion.id,
                    correo: correoPaciente,
                    estrellas,
                    comentario,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "No se pudo enviar la calificación");
            }

            alert("Calificación enviada correctamente");
            setCitaCalificacion(null);
            setEstrellas(5);
            setComentario("");
        } catch (error) {
            alert(error.message);
        }
    };

    const enviarReporte = async () => {
        if (!categoria || !motivo.trim()) {
            alert("Debe seleccionar una categoría y escribir el motivo");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/paciente/reportar-medico`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    cita_id: citaReporte.id,
                    correo: correoPaciente,
                    categoria,
                    motivo,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "No se pudo enviar el reporte");
            }

            alert("Reporte enviado correctamente");
            setCitaReporte(null);
            setCategoria("");
            setMotivo("");
        } catch (error) {
            alert(error.message);
        }
    };

    const citasFiltradas = citas.filter((cita) =>
        `${cita.medico_nombre} ${cita.medico_apellido}`
            .toLowerCase()
            .includes(filtro.toLowerCase())
    );

    return (
        <div className="historial-container">
            <h2>Mi Historial de Citas</h2>

            <input
                type="text"
                placeholder="Buscar por nombre del médico..."
                className="input-busqueda"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
            />

            <table className="tabla-historial">
                <thead>
                    <tr>
                        <th>Médico</th>
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
                                    Dr. {cita.medico_nombre} {cita.medico_apellido}
                                </td>
                                <td>{cita.fecha}</td>
                                <td>{cita.hora}</td>
                                <td>
                                    <span className={`estado ${cita.estado.toLowerCase()}`}>
                                        {cita.estado}
                                    </span>
                                </td>
                                <td>
                                    {cita.estado.toLowerCase() === "atendida" && (
                                        <>
                                            <button
                                                className="btn-receta"
                                                onClick={() => abrirModal(cita, "receta")}
                                            >
                                                Ver Receta
                                            </button>

                                            <button
                                                className="btn-receta"
                                                onClick={() => verTratamiento(cita.id)}
                                            >
                                                Tratamiento
                                            </button>

                                            <button
                                                className="btn-receta"
                                                onClick={() => imprimirPDF(cita.id)}
                                            >
                                                PDF
                                            </button>

                                            <button
                                                className="btn-receta"
                                                onClick={() => setCitaCalificacion(cita)}
                                            >
                                                Calificar
                                            </button>

                                            <button
                                                className="btn-cancelada"
                                                onClick={() => setCitaReporte(cita)}
                                            >
                                                Reportar
                                            </button>
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
                            {tipoDetalle === "receta"
                                ? "Receta Médica"
                                : "Motivo de Cancelación"}
                        </h3>

                        {tipoDetalle === "receta" ? (
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
                                            {detalleSeleccionado.detalles.map((detalle, index) => (
                                                <tr key={index}>
                                                    <td>{detalle.medicamento}</td>
                                                    <td>{detalle.dosis}</td>
                                                    <td>{detalle.indicaciones}</td>
                                                </tr>
                                            ))}
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

            {mostrarTratamiento && tratamiento && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Tratamiento</h3>

                        <p>
                            <strong>Fecha:</strong> {tratamiento.fecha}
                        </p>
                        <p>
                            <strong>Médico:</strong> {tratamiento.medico_nombre}{" "}
                            {tratamiento.medico_apellido}
                        </p>
                        <p>
                            <strong>Especialidad:</strong> {tratamiento.especialidad}
                        </p>
                        <p>
                            <strong>No. colegiado:</strong>{" "}
                            {tratamiento.numero_colegiado || "No disponible"}
                        </p>

                        <p>
                            <strong>Diagnóstico:</strong>
                        </p>
                        <p>{tratamiento.diagnostico || "No disponible"}</p>

                        <h4>Medicamentos</h4>

                        {tratamiento.medicamentos?.length > 0 ? (
                            <table className="tabla-detalle">
                                <thead>
                                    <tr>
                                        <th>Medicamento</th>
                                        <th>Dosis</th>
                                        <th>Indicaciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tratamiento.medicamentos.map((med, index) => (
                                        <tr key={index}>
                                            <td>{med.medicamento}</td>
                                            <td>{med.dosis}</td>
                                            <td>{med.indicaciones}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>No hay medicamentos registrados.</p>
                        )}

                        <button
                            className="btn-cerrar"
                            onClick={() => setMostrarTratamiento(false)}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            {citaCalificacion && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Calificar Atención Médica</h3>

                        <p>
                            Médico: Dr. {citaCalificacion.medico_nombre}{" "}
                            {citaCalificacion.medico_apellido}
                        </p>

                        <label>Estrellas</label>
                        <input
                            type="number"
                            min="0"
                            max="5"
                            value={estrellas}
                            onChange={(e) => setEstrellas(Number(e.target.value))}
                        />

                        <label>Comentario</label>
                        <textarea
                            placeholder="Comentario opcional"
                            value={comentario}
                            onChange={(e) => setComentario(e.target.value)}
                        />

                        <button className="btn-receta" onClick={enviarCalificacion}>
                            Enviar Calificación
                        </button>

                        <button
                            className="btn-cerrar"
                            onClick={() => setCitaCalificacion(null)}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {citaReporte && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Reportar Médico</h3>

                        <p>
                            Médico: Dr. {citaReporte.medico_nombre}{" "}
                            {citaReporte.medico_apellido}
                        </p>

                        <label>Categoría</label>
                        <select
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value)}
                        >
                            <option value="">Seleccione una categoría</option>
                            <option value="Ética y profesionalismo">
                                Ética y profesionalismo
                            </option>
                            <option value="Negligencia médica">Negligencia médica</option>
                            <option value="Abuso o conducta inapropiada">
                                Abuso o conducta inapropiada
                            </option>
                            <option value="Falsificación de información">
                                Falsificación de información
                            </option>
                        </select>

                        <label>Motivo</label>
                        <textarea
                            placeholder="Explique el motivo del reporte"
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                        />

                        <button className="btn-cancelada" onClick={enviarReporte}>
                            Enviar Reporte
                        </button>

                        <button className="btn-cerrar" onClick={() => setCitaReporte(null)}>
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistorialCitasPaciente;