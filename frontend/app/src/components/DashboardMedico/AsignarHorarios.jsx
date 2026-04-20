import React, { useState, useEffect } from "react";
import "./AsignarHorarios.css";
export const API_URL = import.meta.env.VITE_URL_BASE;

const AsignarHorarios = () => {
    const [horarios, setHorarios] = useState([]);

    const [formData, setFormData] = useState({
        dias_semana: [],
        hora_inicio: "",
        hora_fin: ""
    });

    const [mensaje, setMensaje] = useState("");
    const token = localStorage.getItem("token");

    const diasSemana = [
        { valor: 0, nombre: "Lunes" },
        { valor: 1, nombre: "Martes" },
        { valor: 2, nombre: "Miércoles" },
        { valor: 3, nombre: "Jueves" },
        { valor: 4, nombre: "Viernes" },
        { valor: 5, nombre: "Sábado" },
        { valor: 6, nombre: "Domingo" }
    ];

    const obtenerNombreDia = (numero) => {
        const dia = diasSemana.find((d) => d.valor === numero);
        return dia ? dia.nombre : "Desconocido";
    };

    const handleDiaChange = (e) => {
        const { value, checked } = e.target;
        const dia = parseInt(value);

        setFormData((prev) => ({
            ...prev,
            dias_semana: checked
                ? [...prev.dias_semana, dia]
                : prev.dias_semana.filter((d) => d !== dia)
        }));
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if ( formData.dias_semana.length == 0 ){
            alert( "Seleeciones por lo menos un dia a la semana" )
            return;
        }

        const token = localStorage.getItem("token");

        try{
            const payloadBase64 = token.split(".")[1];
            const payload = JSON.parse(atob(payloadBase64));

            const response  = await fetch(`${API_URL}/medico/registrar/horario`,{
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    "correo": payload.user
                })
            })

        }catch (error) {
            console.log(error);
        }

    };

    useEffect(() => {
      getHorarios();
    }, []);

    const getHorarios = async () => {
        try {
            if (!token) {
                console.error("Token no encontrado");
                return;
            }

            const payloadBase64 = token.split(".")[1];
            const payload = JSON.parse(atob(payloadBase64));

            const response = await fetch(`${API_URL}/medico/get/horario`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    'tipo': 'medico',
                    correo: payload.user
                })
            });

            if (!response.ok) {
                throw new Error("Error al obtener horarios");
            }

            const data = await response.json();
            setHorarios(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error al obtener horarios:", error);
        }
    };

    return (
        <div className="horarios-container">
            <h2>Registrar Horarios de Atención</h2>

            <form onSubmit={handleSubmit} className="horarios-form">
                <label>Días de la Semana</label>
                <div className="dias-grid">
                    {diasSemana.map((dia) => (
                        <label key={dia.valor} className="checkbox-label">
                            <input
                                type="checkbox"
                                value={dia.valor}
                                checked={formData.dias_semana.includes(dia.valor)}
                                onChange={handleDiaChange}
                            />
                            {dia.nombre}
                        </label>
                    ))}
                </div>

                <label>Hora de Inicio</label>
                <input
                    type="time"
                    name="hora_inicio"
                    value={formData.hora_inicio}
                    onChange={handleChange}
                    required
                />

                <label>Hora de Fin</label>
                <input
                    type="time"
                    name="hora_fin"
                    value={formData.hora_fin}
                    onChange={handleChange}
                    required
                />

                <button type="submit" className="btn-guardar">
                    Guardar Horarios
                </button>
            </form>

            {mensaje && <p className="mensaje">{mensaje}</p>}

            <h3>Horarios Registrados</h3>
            {horarios.length === 0 ? (
                <p>No hay horarios registrados.</p>
            ) : (
                <table className="tabla-horarios">
                    <thead>
                        <tr>
                            <th>Días</th>
                            <th>Hora de Inicio</th>
                            <th>Hora de Fin</th>
                        </tr>
                    </thead>
                    <tbody>
                        {horarios.map((horario, index) => (
                            <tr key={index}>
                                <td>
                                    {(horario.dias_semana || [])
                                        .map(obtenerNombreDia)
                                        .join(", ")}
                                </td>
                                <td>{horario.hora_inicio}</td>
                                <td>{horario.hora_fin}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AsignarHorarios;