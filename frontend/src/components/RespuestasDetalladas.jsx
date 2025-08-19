// /src/components/RespuestasDetalladas.jsx
import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { obtenerEvaluacion } from '../features/evaluacionesSlice';

const RespuestasDetalladas = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { actual, cargando, error } = useSelector((s) => s.evaluaciones);

    useEffect(() => {
        if (!actual || String(actual.id) !== String(id)) {
        dispatch(obtenerEvaluacion(id));
        }
    }, [dispatch, id, actual]);

    if (cargando) {
        return (
        <div className="container mt-4 text-center">
            <div className="text-info">Cargando respuestas detalladas...</div>
        </div>
        );
    }

    if (error) {
        return (
        <div className="container mt-4 text-center">
            <div className="alert alert-danger">Error al cargar las respuestas: {String(error)}. Por favor, intenta de nuevo.</div>
            <Link to="/" className="btn btn-primary mt-3">Volver a Barrios</Link>
        </div>
        );
    }

    if (!actual) {
        return (
        <div className="container mt-4 text-center">
            <div className="alert alert-warning">No se encontraron datos para esta evaluación.</div>
            <Link to="/" className="btn btn-primary mt-3">Volver a Barrios</Link>
        </div>
        );
    }

    const evaluacion = actual;

    const renderSection = (title, questions) => (
        <div className="mb-4 p-3 border rounded bg-white shadow-sm">
        <h4 className="section-title mb-3">{title}</h4>
        <ul className="list-group list-group-flush">
            {questions.map((q, index) => (
            <li
                key={index}
                className="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center"
            >
                <div className="me-3">
                <strong>{q.label}:</strong>
                </div>
                <div className="ms-md-auto text-end"> {/* Alineación a la derecha en pantallas grandes */}
                <span>{evaluacion[q.key] ?? 'N/A'}</span>
                {q.obsKey && evaluacion[q.obsKey] && ( /* Mostrar observación solo si existe */
                    <small className="text-muted ms-3 d-block d-md-inline">
                    (Obs: {evaluacion[q.obsKey]})
                    </small>
                )}
                </div>
            </li>
            ))}
        </ul>
        </div>
    );

    return (
        <div className="container mt-4 respuestas-detalladas-container"> {/* Añadida la clase */}
        <h2 className="mb-2 text-primary">
            Respuestas Detalladas — Eval #{evaluacion.id} · {evaluacion.barrio?.nombre || 'Barrio Desconocido'}
        </h2>
        <p className="text-muted">
            Fecha de evaluación: {evaluacion.fecha ? new Date(evaluacion.fecha).toLocaleDateString() : '—'}
        </p>

        {renderSection('1. Energía', [
            { key: 'e1_1', label: '1.1 Registro desglosado de consumo eléctrico' },
            { key: 'e1_2', label: '1.2 Implementación de tecnologías de eficiencia energética' },
            { key: 'e1_3', label: '1.3 Inventario de artefactos con demanda energética' },
            { key: 'e1_4', label: '1.4 Proporción de luminaria LED respecto al total' },
            { key: 'e1_5', label: '1.5 Proporción de electrodomésticos con etiqueta A' },
            { key: 'e1_6', label: '1.6 ≥3 mejoras pasivas de eficiencia térmica', obsKey: 'observaciones_e1_6' },
            { key: 'e1_7', label: '1.7 Política/plan de transición a energías renovables' },
            { key: 'e1_8', label: '1.8 Abastecimiento de energía renovable' },
            { key: 'e1_9', label: '1.9 Sistema de energía solar térmica para agua caliente' },
        ])}

        {renderSection('2. Agua', [
            { key: 'a2_1', label: '2.1 Medidores de consumo de agua' },
            { key: 'a2_2', label: '2.2 Tecnologías de cuidado del consumo de agua' },
            { key: 'a2_3', label: '2.3 Proporción de superficie con riego aplicado' },
            { key: 'a2_4', label: '2.4 Riego automatizado para uso eficiente del agua', obsKey: 'observaciones_a2_4' },
            { key: 'a2_5', label: '2.5 Riego fuera de horarios de mucho calor' },
            { key: 'a2_6', label: '2.6 Limpieza fuera de horarios de mucho calor' },
            { key: 'a2_7', label: '2.7 Sistema de reutilización de aguas grises' },
            { key: 'a2_8', label: '2.8 Recolección de agua pluvial / techos azules' },
        ])}

        {renderSection('3. Residuos', [
            { key: 'r3_1', label: '3.1 Monitoreo del peso total de residuos generados' },
            { key: 'r3_2', label: '3.2 Separación y recolección diferenciada de residuos' },
            { key: 'r3_3', label: '3.3 Cantidad de corrientes diferenciadas de reciclables' },
            { key: 'r3_4', label: '3.4 Sistema de compostaje (orgánicos)' },
            { key: 'r3_5', label: '3.5 Gestión de REGU (residuos especiales universales)' },
            { key: 'r3_6', label: '3.6 Gestión de residuos de poda' },
        ])}

        {renderSection('4. Espacios Verdes', [
            { key: 'ev4_1', label: '4.1 Área verde por lote (m²)' },
            { key: 'ev4_2', label: '4.2 Registro de cantidad y especies de árboles' },
            { key: 'ev4_3', label: '4.3 Presencia de especies nativas' },
            { key: 'ev4_4', label: '4.4 Poda regular y programada' },
            { key: 'ev4_5', label: '4.5 Reposición sistemática de árboles caídos/talados' },
            { key: 'ev4_6', label: '4.6 Intervención por mal estado fitosanitario' },
            { key: 'ev4_7', label: '4.7 Trasplante en lugar de tala ante obras' },
            { key: 'ev4_8', label: '4.8 Inventario de árboles talados' },
        ])}

        {renderSection('5. Gestión Integral', [
            { key: 'g5_1', label: '5.1 Responsable/equipo de gestión ambiental' },
            { key: 'g5_2', label: '5.2 Capacitaciones ambientales al personal' },
            { key: 'g5_3', label: '5.3 Plan de acción / cronograma ambiental' },
            { key: 'g5_4', label: '5.4 Participación vecinal en sustentabilidad' },
            { key: 'g5_5', label: '5.5 Acciones de comunicación/concientización' },
            { key: 'g5_6', label: '5.6 Informe ambiental periódico a vecinos' },
        ])}

        <div className="mt-5 p-4 border rounded bg-light">
            <h4 className="text-primary">Observaciones Generales</h4>
            <p className="text-muted">{evaluacion.observaciones || 'No hay observaciones registradas para esta evaluación.'}</p>
        </div>

        <div className="mt-4 d-flex gap-2 justify-content-center">
            <Link to="/" className="btn btn-secondary">Volver a Barrios</Link>
            <Link to={`/resultados/${evaluacion.id}`} className="btn btn-primary">Ver Resultados</Link>
            <Link to={`/editar/${evaluacion.id}`} className="btn btn-outline-success">Editar Evaluación</Link>
        </div>
        </div>
    );
};

export default RespuestasDetalladas;
