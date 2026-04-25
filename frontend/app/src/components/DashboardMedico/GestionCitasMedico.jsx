import React, { useEffect, useState } from "react";
import "./GestionCitasMedico.css";

export const API_URL = import.meta.env.VITE_URL_BASE;

const GestionCitasMedico = () => {
    const [citasEnAtencion, setCitasEnAtencion] = useState([]);
    const [citas, setCitas] = useState([]);
    const [filtro, setFiltro] = useState("");
    const [modalAbierto, setModalAbierto] = useState(false);
    const [citaSeleccionada, setCitaSeleccionada] = useState(null);
    const [observaciones, setObservaciones] = useState("");
    const [motivoCancelacion, setMotivoCancelacion] = useState("");
    const [accion, setAccion] = useState("");
    const [mensaje, setMensaje] = useState("");

    const [detallesReceta, setDetallesReceta] = useState([
        { medicamento: "", dosis: "", indicaciones: "" }
    ]);

    const iniciarAtencion = (cita) => {
        setCitasEnAtencion([...citasEnAtencion, cita.id]);
    };

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
        obtenerCitas();
    }, []);

    const obtenerCitas = async () => {
        try {
            const response = await fetch(`${API_URL}/medico/get/citas`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tipo: "medico", correo: correoMedico })
            });

            const data = await response.json();
            setCitas(data);
        } catch (error) {
            console.error("Error al obtener citas:", error);
        }
    };

    const abrirModal = (cita, tipoAccion) => {
        setCitaSeleccionada(cita);
        setAccion(tipoAccion);
        setModalAbierto(true);
        setObservaciones("");
        setMotivoCancelacion("");
        setDetallesReceta([
            { medicamento: "", dosis: "", indicaciones: "" }
        ]);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setCitaSeleccionada(null);
    };

    const agregarMedicamento = () => {
        setDetallesReceta([
            ...detallesReceta,
            { medicamento: "", dosis: "", indicaciones: "" }
        ]);
    };

    const eliminarMedicamento = (index) => {
        const nuevosDetalles = detallesReceta.filter((_, i) => i !== index);
        setDetallesReceta(nuevosDetalles);
    };

    const handleDetalleChange = (index, campo, valor) => {
        const nuevosDetalles = [...detallesReceta];
        nuevosDetalles[index][campo] = valor;
        setDetallesReceta(nuevosDetalles);
    };

    const confirmarAccion = async () => {
        try {
            let endpoint = "";
            let payload = {};

            if (accion === "atender") {
                endpoint = `${API_URL}/medico/recetas/registrar`;
                payload = {
                    cita_id: citaSeleccionada.id,
                    observaciones: observaciones,
                    detalles: detallesReceta
                };
            } else if (accion === "cancelar") {
                endpoint = `${API_URL}/medico/citas/cancelar`;
                payload = {
                    cita_id: citaSeleccionada.id,
                    motivo_cancelacion: motivoCancelacion
                };
            }

            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                setMensaje("Acción realizada correctamente.");
                obtenerCitas();
                cerrarModal();
            } else {
                setMensaje(data.detail);
            }
        } catch (error) {
            console.log(error)
            setMensaje("Error al procesar la solicitud.");
        }
    };

    const citasFiltradas = citas.filter((cita) =>
        `${cita.paciente_nombre} ${cita.paciente_apellido}`
            .toLowerCase()
            .includes(filtro.toLowerCase())
    );

    return (
        <div className="gestion-citas-container">
            <h2>Gestión de Citas Médicas</h2>

            <input
                type="text"
                placeholder="Buscar por nombre del paciente..."
                className="input-busqueda"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
            />

            <table className="tabla-citas">
                <thead>
                    <tr>
                        <th>Paciente</th>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Estado</th>
                        <th>Acciones</th>
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
                                    {cita.estado.toLowerCase() === "pendiente" && (
                                        <>
                                            {!citasEnAtencion.includes(cita.id) ? (
                                                <>
                                                    <button
                                                        className="btn-atender"
                                                        onClick={() => iniciarAtencion(cita)}
                                                    >
                                                        Atender
                                                    </button>

                                                    <button
                                                        className="btn-cancelar"
                                                        onClick={() => abrirModal(cita, "cancelar")}
                                                    >
                                                        Cancelar
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    className="btn-atender"
                                                    onClick={() => abrirModal(cita, "atender")}
                                                >
                                                    Registrar Diagnóstico
                                                </button>
                                            )}
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5">No se encontraron citas.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {mensaje && <p className="mensaje">{mensaje}</p>}

            {modalAbierto && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>
                            {accion === "atender"
                                ? "Registrar Receta Médica"
                                : "Cancelar Cita"}
                        </h3>

                        {accion === "atender" && (
                            <>
                                <label>Diagnóstico / Observaciones</label>
                                <textarea
                                    placeholder="Escriba el diagnóstico..."
                                    value={observaciones}
                                    onChange={(e) => setObservaciones(e.target.value)}
                                />

                                <h4>Medicamentos</h4>
                                {detallesReceta.map((detalle, index) => (
                                    <div key={index} className="receta-detalle">
                                        <input
                                            type="text"
                                            placeholder="Medicamento"
                                            value={detalle.medicamento}
                                            onChange={(e) =>
                                                handleDetalleChange(
                                                    index,
                                                    "medicamento",
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <input
                                            type="text"
                                            placeholder="Dosis"
                                            value={detalle.dosis}
                                            onChange={(e) =>
                                                handleDetalleChange(
                                                    index,
                                                    "dosis",
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <input
                                            type="text"
                                            placeholder="Indicaciones"
                                            value={detalle.indicaciones}
                                            onChange={(e) =>
                                                handleDetalleChange(
                                                    index,
                                                    "indicaciones",
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <button
                                            className="btn-eliminar"
                                            onClick={() => eliminarMedicamento(index)}
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                ))}

                                <button
                                    className="btn-agregar"
                                    onClick={agregarMedicamento}
                                >
                                    + Agregar Medicamento
                                </button>
                            </>
                        )}

                        {accion === "cancelar" && (
                            <textarea
                                placeholder="Motivo de cancelación..."
                                value={motivoCancelacion}
                                onChange={(e) =>
                                    setMotivoCancelacion(e.target.value)
                                }
                            />
                        )}

                        <div className="modal-buttons">
                            <button
                                className="btn-confirmar"
                                onClick={confirmarAccion}
                            >
                                Confirmar
                            </button>
                            <button
                                className="btn-cerrar"
                                onClick={cerrarModal}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionCitasMedico;