import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { obtenerEvaluacion } from '../slice';

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
        return <div className="container mt-4 text-center"><div className="text-info">Cargando respuestas detalladas...</div></div>;
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

    const meta = [
        { label: 'Barrio', value: actual?.barrio?.nombre },
        { label: 'Autor del barrio', value: actual?.barrio?.autor?.username || actual?.barrio?.autor?.email },
        { label: 'Creado por', value: actual?.creador?.username || actual?.creador?.email },
        { label: 'Editado por', value: actual?.editor?.username || actual?.editor?.email },
        { label: 'Creado en', value: actual?.createdAt ? new Date(actual.createdAt).toLocaleString() : null },
        { label: 'Actualizado en', value: actual?.updatedAt ? new Date(actual.updatedAt).toLocaleString() : null },
    ];

    const renderCampo = (label, valor, idx) => (
        <li className="list-group-item d-flex justify-content-between align-items-start" key={`${label}-${idx}`}>
            <div className="fw-semibold">{label}</div>
            <div className="text-muted">{valor ?? '—'}</div>
        </li>
    );

    const sections = [
        { titulo: '1. Energía', campos: [
            { key: 'e1_1', label: '1.1 Registro desglosado de consumo eléctrico' },
            { key: 'e1_2', label: '1.2 Implementación de tecnologías de eficiencia energética' },
            { key: 'e1_3', label: '1.3 Inventario de artefactos con demanda energética' },
            { key: 'e1_4', label: '1.4 Proporción de luminaria LED' },
            { key: 'e1_5', label: '1.5 Proporción de electrodomésticos con etiqueta A' },
            { key: 'e1_6', label: '1.6 ≥3 mejoras pasivas de eficiencia térmica' },
            { key: 'e1_7', label: '1.7 Política/plan de transición a energías renovables' },
            { key: 'e1_8', label: '1.8 Abastecimiento de energía renovable' },
            { key: 'e1_9', label: '1.9 Sistema de energía solar térmica para agua caliente' },
        ]},
        { titulo: '2. Agua', campos: [
            { key: 'a2_1', label: '2.1 Medidores de consumo de agua' },
            { key: 'a2_2', label: '2.2 Tecnologías de cuidado del consumo de agua' },
            { key: 'a2_3', label: '2.3 Proporción de superficie con riego aplicado' },
            { key: 'a2_4', label: '2.4 Riego automatizado para uso eficiente del agua' },
            { key: 'a2_5', label: '2.5 Riego fuera de horarios de mucho calor' },
            { key: 'a2_6', label: '2.6 Limpieza fuera de horarios de mucho calor' },
            { key: 'a2_7', label: '2.7 Sistema de reutilización de aguas grises' },
            { key: 'a2_8', label: '2.8 Recolección de agua pluvial / techos azules' },
        ]},
        { titulo: '3. Residuos', campos: [
            { key: 'r3_1', label: '3.1 Monitoreo del peso total de residuos generados' },
            { key: 'r3_2', label: '3.2 Separación y recolección diferenciada de residuos' },
            { key: 'r3_3', label: '3.3 Cantidad de corrientes diferenciadas de reciclables' },
            { key: 'r3_4', label: '3.4 Sistema de compostaje (orgánicos)' },
            { key: 'r3_5', label: '3.5 Gestión de REGU (residuos especiales universales)' },
            { key: 'r3_6', label: '3.6 Gestión de residuos de poda' },
        ]},
        { titulo: '4. Espacios Verdes', campos: [
            { key: 'ev4_1', label: '4.1 Área verde por lote (m²)' },
            { key: 'ev4_2', label: '4.2 Registro de cantidad y especies de árboles' },
            { key: 'ev4_3', label: '4.3 Presencia de especies nativas' },
            { key: 'ev4_4', label: '4.4 Poda regular y programada' },
            { key: 'ev4_5', label: '4.5 Reposición sistemática de árboles caídos/talados' },
            { key: 'ev4_6', label: '4.6 Intervención por mal estado fitosanitario' },
            { key: 'ev4_7', label: '4.7 Trasplante en lugar de tala ante obras' },
            { key: 'ev4_8', label: '4.8 Inventario de árboles talados' },
        ]},
        { titulo: '5. Gestión', campos: [
            { key: 'g5_1', label: '5.1 Responsable/equipo de gestión ambiental' },
            { key: 'g5_2', label: '5.2 Capacitaciones ambientales' },
            { key: 'g5_3', label: '5.3 Plan de acción / cronograma' },
            { key: 'g5_4', label: '5.4 Participación vecinal en sustentabilidad' },
            { key: 'g5_5', label: '5.5 Comunicación y concientización ambiental' },
            { key: 'g5_6', label: '5.6 Informe ambiental periódico' },
        ]},
    ];

    return (
        <div className="container mt-4 respuestas-detalladas-container">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>Respuestas detalladas #{actual.id}</h3>
                <div className="d-flex gap-2">
                    <Link to={`/resultados/${actual.id}`} className="btn btn-outline-primary btn-sm">Ver resultados</Link>
                    <Link to="/" className="btn btn-secondary btn-sm">Volver</Link>
                </div>
            </div>

            <div className="card mb-3">
                <div className="card-body">
                    <h6 className="mb-3">Metadatos</h6>
                    <div className="row">
                        {meta.filter(m => m.value).map((m) => (
                            <div className="col-md-4 mb-2" key={m.label}>
                                <div className="small text-muted">{m.label}</div>
                                <div className="fw-semibold">{m.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="row g-3">
                {sections.map((sec) => (
                    <div className="col-md-6" key={sec.titulo}>
                        <div className="card mb-3">
                            <div className="card-body">
                                <h6 className="mb-3">{sec.titulo}</h6>
                                <ul className="list-group">
                                    {sec.campos.map((c, idx) => renderCampo(c.label, actual[c.key], idx))}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RespuestasDetalladas;
