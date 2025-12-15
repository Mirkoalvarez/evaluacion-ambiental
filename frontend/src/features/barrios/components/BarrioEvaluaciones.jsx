import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { listarBarrios, listarEvaluacionesDeBarrio } from '../slice';
import { eliminarEvaluacion } from '../../evaluaciones/slice';
import { Link, useParams } from 'react-router-dom';

export default function BarrioEvaluaciones() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { items, evaluaciones, cargando, error } = useSelector(s => s.barrios);
    const { user } = useSelector(s => s.auth);
    const [creadoPor, setCreadoPor] = useState('');
    const [editadoPor, setEditadoPor] = useState('');
    const [desde, setDesde] = useState('');
    const [hasta, setHasta] = useState('');

    useEffect(() => {
        if (items.length === 0) dispatch(listarBarrios());
        dispatch(listarEvaluacionesDeBarrio(id));
    }, [dispatch, id, items.length]);

    const barrio = items.find(b => String(b.id) === String(id));
    const list = useMemo(() => evaluaciones[id] || [], [evaluaciones, id]);
    const puedeEliminar = user && (user.role === 'admin' || user.role === 'moderador' || barrio?.autor_id === user.id);

    const filtrados = useMemo(() => {
        const c = creadoPor.trim().toLowerCase();
        const e = editadoPor.trim().toLowerCase();
        return list.filter((ev) => {
            const creadorTxt = (ev.creador?.username || ev.creador?.email || '').toLowerCase();
            const editorTxt = (ev.editor?.username || ev.editor?.email || '').toLowerCase();
            const okCreador = c ? creadorTxt.includes(c) : true;
            const okEditor = e ? editorTxt.includes(e) : true;
            const fecha = ev.fecha ? new Date(ev.fecha) : null;
            const okDesde = desde ? (fecha ? fecha >= new Date(desde) : false) : true;
            const okHasta = hasta ? (fecha ? fecha <= new Date(hasta) : false) : true;
            return okCreador && okEditor && okDesde && okHasta;
        });
    }, [list, creadoPor, editadoPor, desde, hasta]);

    return (
        <div className="container">
        <h3 className="section-title">Evaluaciones — {barrio?.nombre ?? `Barrio #${id}`}</h3>
        {cargando && <p>Cargando…</p>}
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="card mb-3">
            <div className="card-body">
                <div className="row g-2">
                    <div className="col-md-3">
                        <label className="form-label">Creado por</label>
                        <input type="text" className="form-control" value={creadoPor} onChange={(e) => setCreadoPor(e.target.value)} placeholder="Username o email" />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Editado por</label>
                        <input type="text" className="form-control" value={editadoPor} onChange={(e) => setEditadoPor(e.target.value)} placeholder="Username o email" />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Desde</label>
                        <input type="date" className="form-control" value={desde} onChange={(e) => setDesde(e.target.value)} />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Hasta</label>
                        <input type="date" className="form-control" value={hasta} onChange={(e) => setHasta(e.target.value)} />
                    </div>
                </div>
            </div>
        </div>

        {list.length === 0 && !cargando ? (
            <div className="alert alert-info">Este barrio aún no tiene evaluaciones.</div>
        ) : (
            <div className="list-group">
            {filtrados.map(ev => (
                <div
                    key={ev.id}
                    className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                >
                    <Link
                        to={`/resultados/${ev.id}`}
                        className="flex-grow-1 text-decoration-none text-reset"
                    >
                        <div className="d-flex justify-content-between">
                            <div>
                            <strong>#{ev.id}</strong> — {ev.fecha ? new Date(ev.fecha).toLocaleDateString() : '—'}
                            </div>
                            <span className="badge bg-primary rounded-pill">{ev.resultado_total ?? '—'}</span>
                        </div>
                        <div className="small text-muted mt-1">
                            Creado por: {ev.creador?.username || ev.creador?.email || '—'} • Editado por: {ev.editor?.username || ev.editor?.email || '—'}
                        </div>
                    </Link>
                    {puedeEliminar && (
                        <button
                            className="btn btn-sm btn-outline-danger ms-3"
                            onClick={async () => {
                                if (!window.confirm('¿Eliminar esta evaluación?')) return;
                                await dispatch(eliminarEvaluacion(ev.id));
                                dispatch(listarEvaluacionesDeBarrio(id));
                            }}
                        >
                            Eliminar
                        </button>
                    )}
                </div>
            ))}
            </div>
        )}

        <div className="mt-3">
            <Link to="/" className="btn btn-link">Volver</Link>
        </div>
        </div>
    );
}
