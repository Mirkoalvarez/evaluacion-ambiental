import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { listarBarrios, eliminarBarrio, crearBarrio, subirImagenBarrio, eliminarImagenBarrio } from '../features/barriosSlice';
import { fetchUsers } from '../features/authSlice';
import { Link } from 'react-router-dom';
import BarrioIntegrantes from './BarrioIntegrantes';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const FILE_BASE = API_BASE.replace(/\/api$/, '');

export default function BarrioList() {
    const dispatch = useDispatch();
    const { items, cargando, error } = useSelector(s => s.barrios);
    const { user, users, usersStatus } = useSelector((s) => s.auth);
    const [nuevoBarrio, setNuevoBarrio] = useState('');
    const [moderadorId, setModeradorId] = useState('');
    const [expandido, setExpandido] = useState(null);
    const [busquedaNombre, setBusquedaNombre] = useState('');
    const [busquedaAutor, setBusquedaAutor] = useState('');
    const [imagenes, setImagenes] = useState({});
    const [subiendoImg, setSubiendoImg] = useState({});

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

    const filtrados = useMemo(() => {
        const nombre = busquedaNombre.trim().toLowerCase();
        const autor = busquedaAutor.trim().toLowerCase();
        return items.filter((b) => {
            const matchNombre = nombre ? b.nombre.toLowerCase().includes(nombre) : true;
            const autorTexto = (b.autor?.username || b.autor?.email || '').toLowerCase();
            const matchAutor = autor ? autorTexto.includes(autor) : true;
            return matchNombre && matchAutor;
        });
    }, [items, busquedaNombre, busquedaAutor]);

    const puedeCrearSinModerador = user?.role === 'moderador';
    const moderadores = users?.filter((u) => u.role === 'moderador') || [];
    const requiereModerador = !puedeCrearSinModerador;

    const onCrearBarrio = async (e) => {
        e.preventDefault();
        const nombreLimpio = nuevoBarrio.trim().replace(/\s+/g, ' ');
        if (!nombreLimpio) return alert('El nombre no puede estar vacío');
        if (nombreLimpio.length > 80) return alert('El nombre es demasiado largo');
        if (!/^[\wáéíóúÁÉÍÓÚñÑ0-9 .-]+$/.test(nombreLimpio)) return alert('El nombre contiene caracteres no permitidos');
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

    const onChangeImagen = (barrioId, file) => {
        setImagenes((prev) => ({ ...prev, [barrioId]: file }));
    };

    const onSubirImagen = async (barrioId) => {
        const file = imagenes[barrioId];
        if (!file) return alert('Selecciona una imagen');
        setSubiendoImg((p) => ({ ...p, [barrioId]: true }));
        const res = await dispatch(subirImagenBarrio({ id: barrioId, file }));
        if (!res.error) {
            setImagenes((p) => ({ ...p, [barrioId]: null }));
            dispatch(listarBarrios());
        }
        setSubiendoImg((p) => ({ ...p, [barrioId]: false }));
    };

    const onEliminarImagen = async (barrioId) => {
        if (!window.confirm('¿Quitar la imagen de este barrio?')) return;
        await dispatch(eliminarImagenBarrio(barrioId));
        dispatch(listarBarrios());
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

            <div className="card mb-3">
                <div className="card-body">
                    <div className="row g-2">
                        <div className="col-md-6">
                            <label className="form-label">Buscar barrio</label>
                            <input
                                type="text"
                                className="form-control"
                                value={busquedaNombre}
                                onChange={(e) => setBusquedaNombre(e.target.value)}
                                placeholder="Nombre del barrio"
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Autor</label>
                            <input
                                type="text"
                                className="form-control"
                                value={busquedaAutor}
                                onChange={(e) => setBusquedaAutor(e.target.value)}
                                placeholder="Username o email del autor"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {cargando && <p>Cargando…</p>}
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row g-3">
                {filtrados.map(b => (
                <div className="col-md-4" key={b.id}>
                    <div className="card h-100">
                    {b.imagen?.path ? (
                        <img
                            src={`${FILE_BASE}${b.imagen.path}`}
                            alt={b.nombre}
                            className="card-img-top"
                            style={{ height: 160, objectFit: 'cover' }}
                        />
                    ) : (
                        <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: 160 }}>
                            <small className="text-muted">Sin imagen</small>
                        </div>
                    )}
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

                        {user && (user.id === b.autor_id || user.role === 'admin' || user.role === 'moderador') && (
                            <div className="mt-3">
                                <label className="form-label small">Imagen del barrio (autor/moderador/admin)</label>
                                <div className="d-flex gap-2">
                                    <input
                                        type="file"
                                        accept=".png,.jpg,.jpeg,.webp"
                                        className="form-control form-control-sm"
                                        onChange={(e) => onChangeImagen(b.id, e.target.files?.[0])}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => onSubirImagen(b.id)}
                                        disabled={subiendoImg[b.id]}
                                    >
                                        {subiendoImg[b.id] ? 'Subiendo…' : 'Subir'}
                                    </button>
                                    {b.imagen && (
                                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => onEliminarImagen(b.id)}>Quitar</button>
                                    )}
                                </div>
                                {imagenes[b.id]?.name && <small className="text-muted">Seleccionado: {imagenes[b.id].name}</small>}
                            </div>
                        )}

                        {expandido === b.id && (
                            <div className="mt-3">
                                <BarrioIntegrantes barrioId={b.id} />
                            </div>
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
