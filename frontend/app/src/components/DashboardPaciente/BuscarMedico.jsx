import React, { useEffect, useState } from "react";
import "./BuscarMedico.css";
import AlertaError from "../Alertas/AlertaError";

export const API_URL = import.meta.env.VITE_URL_BASE;

const BuscarMedico = () => {
    const [ messerror, setMesserror ] = useState(false);
    const [ txtmess, setTxtmess ] = useState("");

    const [modalAbierto, setModalAbierto] = useState(false);
    const [intervalos, setIntervalos] = useState([]);
    const [intervaloSeleccionado, setIntervaloSeleccionado] = useState(null);
    const [medicoSeleccionado, setMedicoSeleccionado] = useState(null);
    const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);
    const [diaSeleccionado, setDiaSeleccionado] = useState(null);

    const convertirMinutos = (hora) => {
        const [h, m] = hora.split(":").map(Number);
        return h * 60 + m;
    };

    const formatearHora = (minutos) => {
        const h = Math.floor(minutos / 60);
        const m = minutos % 60;
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    };

    const generarIntervalos = (inicio, fin, duracion = 120) => {
        const lista = [];
        let inicioMin = convertirMinutos(inicio);
        const finMin = convertirMinutos(fin);

        while (inicioMin < finMin) {
            let finIntervalo = inicioMin + duracion;

            // Ajustar el último intervalo si sobra tiempo
            if (finIntervalo > finMin) {
                finIntervalo = finMin;
            }

            lista.push({
                inicio: formatearHora(inicioMin),
                fin: formatearHora(finIntervalo),
            });

            inicioMin = finIntervalo;
        }

        return lista;
    };

    const abrirModal = (medico, horario, dia) => {
        const bloques = generarIntervalos(
            horario.hora_inicio,
            horario.hora_fin
        );

        setIntervalos(bloques);
        setMedicoSeleccionado(medico);
        setHorarioSeleccionado(horario);
        setDiaSeleccionado(dia);
        setIntervaloSeleccionado(null);
        setModalAbierto(true);
    };

    const confirmarCita = async () => {
        if (!intervaloSeleccionado) {
            //setMensaje("Seleccione un horario.");
            setTxtmess("Seleccione un horario.")
            setMesserror(true)
            return;
        }

        const fechaSeleccionada = new Date().toISOString().split("T")[0];

        try {
            const response = await fetch(`${API_URL}/paciente/citas/agendar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    paciente_correo: correoPaciente,
                    medico_correo: medicoSeleccionado.correo,
                    fecha: fechaSeleccionada,
                    hora: intervaloSeleccionado.inicio,
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMensaje("Cita agendada correctamente.");
                eliminarHorarioDisponible();
                await obtenerHorarios(medicoSeleccionado.correo);
                setModalAbierto(false);
            } else {
                setTxtmess(data.detail)
                setMesserror(true)
                //setMensaje(data.detail);
            }
        } catch (error) {
            setMensaje("Error al agendar la cita.");
        }
    };

    const eliminarHorarioDisponible = () => {
        setIntervalos((prev) =>
            prev.filter(
                (intervalo) =>
                    !(
                        intervalo.inicio === intervaloSeleccionado.inicio &&
                        intervalo.fin === intervaloSeleccionado.fin
                    )
            )
        );
    };
    

    useEffect( () =>{
        if ( messerror ) {
            const timer = setTimeout(() => {
                setMesserror(false)
            }, 3000)

            return () => clearTimeout(timer)
        }
    }, [messerror] )
//_______________________________________________________________________________________________________________________________

    const [medicos, setMedicos] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [filtros, setFiltros] = useState({
        nombre: "",
        especialidad: ""
    });
    const [horarios, setHorarios] = useState({});
    const [mensaje, setMensaje] = useState("");

    const token = localStorage.getItem("token");

    // Obtener correo del paciente desde el JWT
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

    const obtenerHorarios = async (correo) => {
        try {
            const response = await fetch(`${API_URL}/medico/get/horario`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ "tipo" : "paciente", "correo" : correo })
            });

            const data = await response.json();
            setHorarios((prev) => ({
                ...prev,
                [correo]: data
            }));
        } catch (error) {
            console.error("Error al obtener horarios:", error);
        }
    };

    const agendarCita = async (medicoCorreo, hora, dia) => {
        try {
            const response = await fetch(`${API_URL}/citas/agendar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    paciente_correo: correoPaciente,
                    medico_correo: medicoCorreo,
                    hora,
                    dia_semana: dia
                })
            });

            const data = await response.json();
            if (response.ok) {
                setMensaje("Cita agendada correctamente.");
                eliminarHorarioDisponible();
                await obtenerHorarios(medicoCorreo);
                setModalAbierto(false);
            } else {
                setMensaje(data.detail);
            }
        } catch (error) {
            setMensaje("Error al agendar la cita.");
        }
    };

    const medicosFiltrados = medicos.filter((medico) =>
        (`${medico.nombre} ${medico.apellido}`)
            .toLowerCase()
            .includes(filtros.nombre.toLowerCase()) &&
        (filtros.especialidad === "" ||
            medico.especialidad === filtros.especialidad)
    );

    const obtenerNombreDia = (numero) => {
        const dias = [
            "Lunes", "Martes", "Miércoles",
            "Jueves", "Viernes", "Sábado", "Domingo"
        ];
        return dias[numero] || "Desconocido";
    };

    useEffect(() => {
        getHorarios();
        //obtenerEspecialidades();
    }, []);

    const obtenerEspecialidades = async () => {
        try {
            const response = await fetch(`${API_URL}/especialidades`);
            const data = await response.json();
            setEspecialidades(data);
        } catch (error) {
            console.error("Error al obtener especialidades:", error);
        }
    };

    const getHorarios = async () => {
        try {
            const response = await fetch(`${API_URL}/paciente/get/horarios/medicos`);
            const data = await response.json();
            setMedicos(data);
            console.log(data);
        } catch (error) {
            console.error("Error al obtener médicos:", error);
        }
    };

    return (
        <div className="buscar-medico-container">

            {messerror && ( <div className="contenedor-alerta"> <AlertaError texto={txtmess} /></div>)}
            <h2>Buscar Médico</h2>

            <div className="filtros">
                <input
                    type="text"
                    placeholder="Buscar por nombre"
                    value={filtros.nombre}
                    onChange={(e) =>
                        setFiltros({ ...filtros, nombre: e.target.value })
                    }
                />

                <select
                    value={filtros.especialidad}
                    onChange={(e) =>
                        setFiltros({ ...filtros, especialidad: e.target.value })
                    }
                >
                    <option value="">Todas las especialidades</option>
                    {especialidades.map((esp, index) => (
                        <option key={index} value={esp}>
                            {esp}
                        </option>
                    ))}
                </select>
            </div>

            <div className="medicos-grid">
                {medicosFiltrados.map((medico) => (
                    <div key={medico.id} className="medico-card">
                        <h3>
                            Dr. {medico.nombre} {medico.apellido}
                        </h3>
                        <p><strong>Especialidad:</strong> {medico.especialidad}</p>
                        <p><strong>Clínica:</strong> {medico.direccion_clinica}</p>

                        <button
                            className="btn-horarios"
                            onClick={() => obtenerHorarios(medico.correo)}
                        >
                            Ver Horarios
                        </button>

                        {horarios[medico.correo] && (
                            <table className="tabla-horarios">
                                <thead>
                                    <tr>
                                        <th>Día</th>
                                        <th>Horario</th>
                                        <th>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {horarios[medico.correo].map((horario, idx) =>
                                        horario.dias_semana.map((dia) => (
                                            <tr key={`${idx}-${dia}`}>
                                                <td>{obtenerNombreDia(dia)}</td>
                                                <td>
                                                    {horario.hora_inicio} - {horario.hora_fin}
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn-agendar"
                                                        onClick={() => abrirModal(medico, horario, dia)}>
                                                        Agendar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                ))}
            </div>

            {mensaje && <p className="mensaje">{mensaje}</p>}

            {modalAbierto && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Seleccionar Horario</h3>
                        <p>
                            <strong>Médico:</strong> Dr. {medicoSeleccionado?.nombre} {medicoSeleccionado?.apellido}
                        </p>
                        <p>
                            <strong>Día:</strong> {obtenerNombreDia(diaSeleccionado)}
                        </p>

                        <div className="intervalos">
                            {intervalos.map((intervalo, index) => (
                                <button
                                    key={index}
                                    className={`intervalo-btn ${
                                        intervaloSeleccionado === intervalo ? "seleccionado" : ""
                                    }`}
                                    onClick={() => setIntervaloSeleccionado(intervalo)}
                                >
                                    {intervalo.inicio} - {intervalo.fin}
                                </button>
                            ))}
                        </div>

                        <div className="modal-buttons">
                            <button className="btn-confirmar" onClick={confirmarCita}>
                                Confirmar
                            </button>
                            <button
                                className="btn-cancelar"
                                onClick={() => setModalAbierto(false)}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BuscarMedico;