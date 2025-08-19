import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { obtenerEvaluacion } from '../features/evaluacionesSlice';

// Iconos simples para cada categoría
const categoryIcons = {
    Energía: '⚡', // Rayo
    Agua: '💧',    // Gota de agua
    Residuos: '♻️', // Reciclaje
    'Espacios Verdes': '🌳', // Árbol
    Gestión: '📊',  // Gráfico de barras
};

export default function Resultados() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { actual, cargando, error } = useSelector(s => s.evaluaciones);

    useEffect(() => { dispatch(obtenerEvaluacion(id)); }, [dispatch, id]);

    if (cargando) return <div className="container"><p className="text-info">Cargando resultados…</p></div>;
    if (error) return <div className="container"><div className="alert alert-danger">{error}</div></div>;
    if (!actual) return null;

    const Card = ({ titulo, letra, puntaje }) => (
        <div className="col-md-4">
        <div className={`card ${letra === 'A' ? 'bg-success text-white' : letra === 'B' ? 'bg-warning' : 'bg-danger text-white'}`}>
            <div className="card-body">
            <h5 className="card-title d-flex align-items-center">
                <span className="me-2">{categoryIcons[titulo]}</span> {/* Icono */}
                {titulo}
            </h5>
            <p className="card-text">Letra: <strong>{letra ?? '—'}</strong></p>
            <p className="card-text">Puntaje 1–10: <strong>{puntaje ?? '—'}</strong></p>
            </div>
        </div>
        </div>
    );

    return (
        <div className="container">
        <h3 className="section-title">Resultados — Evaluación #{actual.id} (Barrio: {actual.barrio?.nombre || '—'})</h3>
        <div className="row g-3">
            <Card titulo="Energía" letra={actual.resultado_energia} puntaje={actual.puntaje_energia} />
            <Card titulo="Agua" letra={actual.resultado_agua} puntaje={actual.puntaje_agua} />
            <Card titulo="Residuos" letra={actual.resultado_residuos} puntaje={actual.puntaje_residuos} />
            <Card titulo="Espacios Verdes" letra={actual.resultado_espacios_verdes} puntaje={actual.puntaje_espacios_verdes} />
            <Card titulo="Gestión" letra={actual.resultado_gestion} puntaje={actual.puntaje_gestion} />
        </div>

        <div className="card mt-4 p-3"> {/* Añadido padding a la tarjeta total */}
            <div className="card-body">
            <h5 className="card-title d-flex align-items-center">
                <span className="me-2">⭐</span> {/* Icono para el total */}
                Resultado General
            </h5>
            <p className="card-text">Letra: <strong>{actual.resultado_total}</strong></p>
            <p className="card-text">Puntaje 1–10: <strong>{actual.puntaje_final}</strong></p>
            
            <p className="text-muted small mt-3"> {/* Ajuste de margen y tamaño */}
                Fecha de evaluación: {actual.fecha ? new Date(actual.fecha).toLocaleDateString() : '—'}
            </p>
            </div>
        </div>

        <div className="mt-4 d-flex gap-2 justify-content-center"> {/* Centrar botones */}
            <Link to="/" className="btn btn-secondary">Volver a Barrios</Link>
            <Link to={`/respuestas/${actual.id}`} className="btn btn-outline-primary">Ver Respuestas Detalladas</Link>
            <Link to={`/editar/${actual.id}`} className="btn btn-outline-success">Editar Evaluación</Link>
        </div>
        </div>
    );
}
