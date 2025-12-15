import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { obtenerEvaluacion, listarArchivosEvaluacion, subirArchivoEvaluacion, eliminarArchivoEvaluacion } from '../slice';

const categoryIcons = { Energia: '⚡', Agua: '💧', Residuos: '♻️', 'Espacios Verdes': '🌳', Gestion: '📊' };
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const FILE_BASE = API_BASE.replace(/\/api$/, '');

export default function Resultados() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { actual, cargando, error } = useSelector((s) => s.evaluaciones);
    const [archivo, setArchivo] = useState(null);
    const [subiendo, setSubiendo] = useState(false);

    useEffect(() => {
        dispatch(obtenerEvaluacion(id)).then(() => dispatch(listarArchivosEvaluacion(id)));
    }, [dispatch, id]);

    if (cargando) return <div className="container"><p className="text-info">Cargando resultados...</p></div>;
    if (error) return <div className="container"><div className="alert alert-danger">{error}</div></div>;
    if (!actual) return null;

    const Card = ({ titulo, letra, puntaje }) => (
        <div className="col-md-4">
            <div className={`card ${letra === 'A' ? 'bg-success text-white' : letra === 'B' ? 'bg-warning' : 'bg-danger text-white'}`}>
                <div className="card-body">
                    <h5 className="card-title d-flex align-items-center">
                        <span className="me-2">{categoryIcons[titulo] || '•'}</span>
                        {titulo}
                    </h5>
                    <p className="card-text">Letra: <strong>{letra ?? '—'}</strong></p>
                    <p className="card-text">Puntaje 1-10: <strong>{puntaje ?? '—'}</strong></p>
                </div>
            </div>
        </div>
    );

    const meta = [
        { label: 'Barrio', value: actual?.barrio?.nombre },
        { label: 'Autor del barrio', value: actual?.barrio?.autor?.username || actual?.barrio?.autor?.email },
        { label: 'Creado por', value: actual?.creador?.username || actual?.creador?.email },
        { label: 'Editado por', value: actual?.editor?.username || actual?.editor?.email },
        { label: 'Creado en', value: actual?.createdAt ? new Date(actual.createdAt).toLocaleString() : null },
        { label: 'Actualizado en', value: actual?.updatedAt ? new Date(actual.updatedAt).toLocaleString() : null },
    ];

    const onSubirArchivo = async (e) => {
        e.preventDefault();
        if (!archivo) return alert('Selecciona un archivo');
        setSubiendo(true);
        try {
            await dispatch(subirArchivoEvaluacion({ id: actual.id, file: archivo })).unwrap();
            await dispatch(listarArchivosEvaluacion(actual.id));
            setArchivo(null);
        } finally {
            setSubiendo(false);
        }
    };

    const onEliminarArchivo = async (archivoId) => {
        if (!window.confirm('¿Eliminar este archivo adjunto?')) return;
        await dispatch(eliminarArchivoEvaluacion({ archivoId })).unwrap();
        await dispatch(listarArchivosEvaluacion(actual.id));
    };

    const archivos = actual.archivos || [];

    return (
        <div className="container">
            <h3 className="section-title">Resultados — Evaluación #{actual.id} (Barrio: {actual.barrio?.nombre || '—'})</h3>

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
                <Card titulo="Energia" letra={actual.resultado_energia} puntaje={actual.puntaje_energia} />
                <Card titulo="Agua" letra={actual.resultado_agua} puntaje={actual.puntaje_agua} />
                <Card titulo="Residuos" letra={actual.resultado_residuos} puntaje={actual.puntaje_residuos} />
                <Card titulo="Espacios Verdes" letra={actual.resultado_espacios_verdes} puntaje={actual.puntaje_espacios_verdes} />
                <Card titulo="Gestion" letra={actual.resultado_gestion} puntaje={actual.puntaje_gestion} />
            </div>

            <div className="card mt-4 p-3">
                <div className="card-body">
                    <h5 className="card-title d-flex align-items-center">
                        <span className="me-2">🧭</span>
                        Resultado General
                    </h5>
                    <p className="card-text">Letra: <strong>{actual.resultado_total}</strong></p>
                    <p className="card-text">Puntaje 1-10: <strong>{actual.puntaje_final}</strong></p>
                    <p className="text-muted small mt-3">Fecha de evaluación: {actual.fecha ? new Date(actual.fecha).toLocaleDateString() : '—'}</p>
                </div>
            </div>

            <div className="card mt-4">
                <div className="card-body">
                    <h5 className="card-title">Archivos adjuntos</h5>
                    <form className="d-flex gap-2 align-items-center mb-3" onSubmit={onSubirArchivo}>
                        <input
                            type="file"
                            className="form-control"
                            accept=".xlsx,.xls,.csv,.pdf,.doc,.docx,.png,.jpg,.jpeg"
                            onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                        />
                        <button className="btn btn-outline-primary" type="submit" disabled={subiendo}>
                            {subiendo ? 'Subiendo…' : 'Subir'}
                        </button>
                    </form>
                    {archivos.length === 0 && <div className="text-muted small">Aún no hay archivos adjuntos.</div>}
                    {archivos.length > 0 && (
                        <ul className="list-group list-group-flush">
                            {archivos.map((a) => (
                                <li key={a.id} className="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <div className="fw-semibold">{a.original_name}</div>
                                        <div className="small text-muted">
                                            {a.mime_type} · {(a.size / 1024).toFixed(1)} KB · {a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}
                                        </div>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <a className="btn btn-sm btn-outline-secondary" href={`${FILE_BASE}${a.path}`} target="_blank" rel="noopener noreferrer">
                                            Descargar
                                        </a>
                                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => onEliminarArchivo(a.id)}>
                                            Eliminar
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div className="mt-4 d-flex gap-2 justify-content-center">
                <Link to="/" className="btn btn-secondary">Volver a Barrios</Link>
                <Link to={`/respuestas/${actual.id}`} className="btn btn-outline-primary">Ver Respuestas Detalladas</Link>
                <Link to={`/editar/${actual.id}`} className="btn btn-outline-success">Editar Evaluación</Link>
            </div>
        </div>
    );
}
