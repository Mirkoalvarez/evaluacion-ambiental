import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { listarBarrios, listarEvaluacionesDeBarrio } from '../features/barriosSlice';
import { Link, useParams } from 'react-router-dom';

export default function BarrioEvaluaciones() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { items, evaluaciones, cargando, error } = useSelector(s => s.barrios);

    useEffect(() => {
        if (items.length === 0) dispatch(listarBarrios());
        dispatch(listarEvaluacionesDeBarrio(id));
    }, [dispatch, id, items.length]);

    const barrio = items.find(b => String(b.id) === String(id));
    const list = evaluaciones[id] || [];

    return (
        <div className="container">
        <h3 className="section-title">Evaluaciones — {barrio?.nombre ?? `Barrio #${id}`}</h3>
        {cargando && <p>Cargando…</p>}
        {error && <div className="alert alert-danger">{error}</div>}

        {list.length === 0 && !cargando ? (
            <div className="alert alert-info">Este barrio aún no tiene evaluaciones.</div>
        ) : (
            <div className="list-group">
            {list.map(ev => (
                <Link
                key={ev.id}
                to={`/resultados/${ev.id}`}
                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                >
                <span>
                    <strong>#{ev.id}</strong> — {new Date(ev.fecha).toLocaleDateString()}
                </span>
                <span className="badge bg-primary rounded-pill">{ev.resultado_total ?? '—'}</span>
                </Link>
            ))}
            </div>
        )}

        <div className="mt-3">
            <Link to="/" className="btn btn-link">Volver</Link>
        </div>
        </div>
    );
}
