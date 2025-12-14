import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { listarBarrios, listarEvaluacionesDeBarrio } from '../features/barriosSlice';
import { Link, useParams } from 'react-router-dom';
import { useState, useMemo } from 'react';

export default function BarrioEvaluaciones() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { items, evaluaciones, cargando, error } = useSelector(s => s.barrios);
    const [creadoPor, setCreadoPor] = useState('');
    const [editadoPor, setEditadoPor] = useState('');
    const [desde, setDesde] = useState('');
    const [hasta, setHasta] = useState('');

    useEffect(() => {
        if (items.length === 0) dispatch(listarBarrios());
        dispatch(listarEvaluacionesDeBarrio(id));
    }, [dispatch, id, items.length]);

    const barrio = items.find(b => String(b.id) === String(id));
    const list = evaluaciones[id] || [];

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
                        <input
                            type="text"
                            className="form-control"
                            value={creadoPor}
                            onChange={(e) => setCreadoPor(e.target.value)}
                            placeholder="Username o email"
                        />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Editado por</label>
                        <input
                            type="text"
                            className="form-control"
                            value={editadoPor}
                            onChange={(e) => setEditadoPor(e.target.value)}
                            placeholder="Username o email"
                        />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Desde</label>
                        <input
                            type="date"
                            className="form-control"
                            value={desde}
                            onChange={(e) => setDesde(e.target.value)}
                        />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Hasta</label>
                        <input
                            type="date"
                            className="form-control"
                            value={hasta}
                            onChange={(e) => setHasta(e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>

        {list.length === 0 && !cargando ? (
            <div className="alert alert-info">Este barrio aún no tiene evaluaciones.</div>
        ) : (
            <div className="list-group">
            {filtrados.map(ev => (
                <Link
                key={ev.id}
                to={`/resultados/${ev.id}`}
                className="list-group-item list-group-item-action"
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
            ))}
            </div>
        )}

        <div className="mt-3">
            <Link to="/" className="btn btn-link">Volver</Link>
        </div>
        </div>
    );
}
