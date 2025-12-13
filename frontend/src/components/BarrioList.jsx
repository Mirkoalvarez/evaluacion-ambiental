// ... (imports existentes)
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { listarBarrios, eliminarBarrio, crearBarrio } from '../features/barriosSlice';
import { fetchUsers } from '../features/authSlice';
import { Link } from 'react-router-dom';
import BarrioIntegrantes from './BarrioIntegrantes';

export default function BarrioList() {
    const dispatch = useDispatch();
    const { items, cargando, error } = useSelector(s => s.barrios);
    const { user, users, usersStatus } = useSelector((s) => s.auth);
    const [nuevoBarrio, setNuevoBarrio] = useState('');
    const [moderadorId, setModeradorId] = useState('');
    const [expandido, setExpandido] = useState(null);

    useEffect(() => { dispatch(listarBarrios()); }, [dispatch]);
    useEffect(() => {
        if (user && (usersStatus === 'idle' || usersStatus === 'failed')) {
            dispatch(fetchUsers());
        }
    }, [dispatch, user, usersStatus]);

    const onEliminarBarrio = async (b) => {
        if (!window.confirm(`¿Eliminar el BARRIO "${b.nombre}" y TODAS sus evaluaciones? Esta acción no se puede deshacer.`)) return;
        await dispatch(eliminarBarrio(b.id));
        dispatch(listarBarrios());
    };

    const badgeClass = (letra) =>
        letra === 'A' ? 'bg-success' : letra === 'B' ? 'bg-warning text-dark' : 'bg-danger';

    const puedeCrearSinModerador = user?.role === 'moderador';
    const moderadores = users?.filter((u) => u.role === 'moderador') || [];
    const requiereModerador = !puedeCrearSinModerador;

    const onCrearBarrio = async (e) => {
        e.preventDefault();
        const nombreLimpio = nuevoBarrio.trim().replace(/\s+/g, ' ');
        if (!nombreLimpio) return alert('El nombre no puede estar vacío');
        if (nombreLimpio.length > 80) return alert('El nombre es demasiado largo');
        if (!/^[\wáéíóúñüÁÉÍÓÚÑÜ .-]+$/.test(nombreLimpio)) return alert('El nombre contiene caracteres no permitidos');
        if (requiereModerador && !moderadorId) {
            alert('Debes seleccionar un moderador para este barrio.');
            return;
        }
        const payload = { nombre: nombreLimpio };
        if (requiereModerador) payload.moderador_id = Number(moderadorId);
        const res = await dispatch(crearBarrio(payload));
        if (!res.error) {
            setNuevoBarrio('');
            setModeradorId('');
            dispatch(listarBarrios());
        }
    };

    return (
        <div className="container">
            <h3 className="section-title">Barrios</h3>

            <div className="card mb-3">
                <div className="card-body">
                    <form className="row g-2 align-items-end" onSubmit={onCrearBarrio}>
                        <div className="col-sm-5">
                            <label className="form-label">Nuevo barrio</label>
                            <input
                                type="text"
                                className="form-control"
                                value={nuevoBarrio}
                                onChange={(e) => setNuevoBarrio(e.target.value)}
                                placeholder="Nombre del barrio"
                                required
                            />
                        </div>
                        {requiereModerador && (
                            <div className="col-sm-5">
                                <label className="form-label">Moderador asignado</label>
                                <select
                                    className="form-select"
                                    value={moderadorId}
                                    onChange={(e) => setModeradorId(e.target.value)}
                                    required
                                    disabled={usersStatus === 'loading'}
                                >
                                    <option value="">Selecciona moderador</option>
                                    {moderadores.map((m) => (
                                        <option key={m.id} value={m.id}>{m.username || m.email}</option>
                                    ))}
                                </select>
                                {moderadores.length === 0 && (
                                    <div className="form-text text-danger">No hay moderadores disponibles.</div>
                                )}
                            </div>
                        )}
                        <div className="col-sm-2">
                            <button className="btn btn-success w-100" type="submit" disabled={cargando}>
                                Crear
                            </button>
                        </div>
                    </form>
                    {usersStatus === 'loading' && requiereModerador && <small>Cargando moderadores...</small>}
                </div>
            </div>

            {cargando && <p>Cargando…</p>}
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row g-3">
                {items.map(b => (
                <div className="col-md-4" key={b.id}>
                    <div className="card">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="card-title mb-0">{b.nombre}</h5>
                        <span className={`badge ${badgeClass(b.resultado_total)}`}>
                            {b.resultado_total ?? '—'}
                        </span>
                        </div>
                        <p className="card-text text-muted small">Último resultado: <strong>{b.resultado_total ?? '—'}</strong></p>
                        <p className="card-text text-muted small">
                            Autor: <strong>{b.autor?.username || b.autor?.email || b.autor_id || '—'}</strong>
                        </p>

                        <div className="d-flex flex-wrap gap-2 mt-3">
                        <Link to={`/barrios/${b.id}/ir/resultados`} className="btn btn-outline-primary btn-sm">
                            Ver resultados
                        </Link>
                        <Link to={`/barrios/${b.id}/ir/respuestas`} className="btn btn-outline-secondary btn-sm">
                            Respuestas
                        </Link>
                        <Link to={`/barrios/${b.id}/ir/editar`} className="btn btn-outline-success btn-sm">
                            Editar
                        </Link>
                        <Link to={`/barrios/${b.id}/historial`} className="btn btn-outline-dark btn-sm">
                            Historial
                        </Link>
                        <button
                            className="btn btn-outline-info btn-sm"
                            onClick={() => setExpandido(expandido === b.id ? null : b.id)}
                        >
                            {expandido === b.id ? 'Ocultar integrantes' : 'Integrantes'}
                        </button>
                        <button className="btn btn-outline-danger btn-sm" onClick={() => onEliminarBarrio(b)}>
                            Eliminar barrio
                        </button>
                        </div>
                        {expandido === b.id && (
                            <BarrioIntegrantes barrioId={b.id} />
                        )}
                    </div>
                    </div>
                </div>
                ))}
                {!cargando && items.length === 0 && (
                <div className="col-12">
                    <div className="alert alert-info">No hay barrios aún. ¡Crea una nueva evaluación para empezar!</div>
                </div>
                )}
            </div>
        </div>
    );
}
