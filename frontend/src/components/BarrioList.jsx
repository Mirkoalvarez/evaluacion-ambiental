// ... (imports existentes)
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { listarBarrios, eliminarBarrio, eliminarUltimaEvaluacion  } from '../features/barriosSlice';
import { Link } from 'react-router-dom';

export default function BarrioList() {
    const dispatch = useDispatch();
    const { items, cargando, error } = useSelector(s => s.barrios);

    useEffect(() => { dispatch(listarBarrios()); }, [dispatch]);

    const onEliminarUltima = async (b) => {
        if (!window.confirm(`¿Eliminar la ÚLTIMA evaluación de "${b.nombre}"?`)) return;
        await dispatch(eliminarUltimaEvaluacion(b.id));
        dispatch(listarBarrios());
    };

    const onEliminarBarrio = async (b) => {
        if (!window.confirm(`¿Eliminar el BARRIO "${b.nombre}" y TODAS sus evaluaciones? Esta acción no se puede deshacer.`)) return;
        await dispatch(eliminarBarrio(b.id));
        dispatch(listarBarrios());
    };

    const badgeClass = (letra) =>
        letra === 'A' ? 'bg-success' : letra === 'B' ? 'bg-warning text-dark' : 'bg-danger';

    return (
        <div className="container">
            <h3 className="section-title">Barrios</h3>
            {cargando && <p>Cargando…</p>}
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row g-3">
                {items.map(b => (
                <div className="col-md-4" key={b.id}>
                    <div className="card">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-2"> {/* Añadido mb-2 */}
                        <h5 className="card-title mb-0">{b.nombre}</h5>
                        <span className={`badge ${badgeClass(b.resultado_total)}`}>
                            {b.resultado_total ?? '—'}
                        </span>
                        </div>
                        <p className="card-text text-muted small">Último resultado: <strong>{b.resultado_total ?? '—'}</strong></p> {/* Texto más descriptivo */}

                        <div className="d-flex flex-wrap gap-2 mt-3"> {/* Añadido mt-3 */}
                        <Link to={`/barrios/${b.id}/ir/resultados`} className="btn btn-outline-primary btn-sm">
                            Ver resultados
                        </Link>
                        <Link to={`/barrios/${b.id}/ir/respuestas`} className="btn btn-outline-secondary btn-sm">
                            Respuestas
                        </Link>
                        <Link to={`/barrios/${b.id}/ir/editar`} className="btn btn-outline-success btn-sm">
                            Editar
                        </Link>
                        
                        {/*
                        <button className="btn btn-outline-warning btn-sm" onClick={() => onEliminarUltima(b)}>
                            Eliminar última
                        </button>
                        */}
                        <button className="btn btn-outline-danger btn-sm" onClick={() => onEliminarBarrio(b)}>
                            Eliminar barrio
                        </button>
                        </div>
                    </div>
                    </div>
                </div>
                ))}
                {!cargando && items.length === 0 && (
                <div className="col-12">
                    <div className="alert alert-info">No hay barrios aún. ¡Crea una nueva evaluación para empezar!</div> {/* Mensaje más amigable */}
                </div>
                )}
            </div>
        </div>
    );
}
