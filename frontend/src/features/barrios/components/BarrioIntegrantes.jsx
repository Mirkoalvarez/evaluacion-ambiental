import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    listarIntegrantes,
    agregarIntegrante,
    actualizarIntegrante,
    eliminarIntegrante,
} from '../slice';
import { fetchUsers } from '../../auth/slice';

export default function BarrioIntegrantes({ barrioId }) {
    const dispatch = useDispatch();
    const { integrantes } = useSelector((s) => s.barrios);
    const { users, usersStatus } = useSelector((s) => s.auth);
    const slot = integrantes[barrioId] || { items: [], status: 'idle', error: null };
    const [userId, setUserId] = useState('');
    const [permiso, setPermiso] = useState(false);

    useEffect(() => {
        if (slot.status === 'idle') {
            dispatch(listarIntegrantes(barrioId));
        }
        if (usersStatus === 'idle' || usersStatus === 'failed') {
            dispatch(fetchUsers());
        }
    }, [dispatch, barrioId, slot.status, usersStatus]);

    const onAgregar = async (e) => {
        e.preventDefault();
        if (!userId) return;
        await dispatch(agregarIntegrante({ barrioId, user_id: Number(userId), puede_editar_todas: permiso }));
        await dispatch(listarIntegrantes(barrioId)); // refresca para tener usuario/rol
        setUserId('');
        setPermiso(false);
    };

    const candidatos = (users || []).filter(
        (u) => u.role !== 'admin' && !slot.items.some((m) => m.user_id === u.id)
    );

    return (
        <div className="mt-3">
            <h6>Integrantes</h6>
            {slot.status === 'loading' && <div className="text-muted small">Cargando integrantes...</div>}
            {slot.error && <div className="alert alert-danger py-2">{slot.error}</div>}
            <div className="table-responsive">
                <table className="table table-sm">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Rol</th>
                            <th>Puede editar todas</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {slot.items.map((m) => (
                            <tr key={m.user_id}>
                                <td>{m.usuario?.username || m.usuario?.email || m.user_id}</td>
                                <td><span className="badge text-bg-light">{m.usuario?.role || 'user'}</span></td>
                                <td>
                                    <button
                                        className={`btn btn-sm ${m.puede_editar_todas ? 'btn-success' : 'btn-outline-secondary'}`}
                                        onClick={() => dispatch(actualizarIntegrante({
                                            barrioId,
                                            user_id: m.user_id,
                                            puede_editar_todas: !m.puede_editar_todas,
                                        }))}
                                    >
                                        {m.puede_editar_todas ? 'Sí' : 'No'}
                                    </button>
                                </td>
                                <td>
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => dispatch(eliminarIntegrante({ barrioId, user_id: m.user_id }))}
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {slot.items.length === 0 && (
                            <tr><td colSpan="4" className="text-muted">Sin integrantes</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <form className="row g-2 mt-2" onSubmit={onAgregar}>
                <div className="col-md-6">
                    <select
                        className="form-select"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        disabled={usersStatus === 'loading'}
                    >
                        <option value="">Selecciona usuario</option>
                        {candidatos.map((u) => (
                            <option key={u.id} value={u.id}>{u.username || u.email}</option>
                        ))}
                    </select>
                </div>
                <div className="col-md-3 d-flex align-items-center">
                    <div className="form-check">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id={`permiso-${barrioId}`}
                            checked={permiso}
                            onChange={(e) => setPermiso(e.target.checked)}
                        />
                        <label htmlFor={`permiso-${barrioId}`} className="form-check-label">Puede editar todas</label>
                    </div>
                </div>
                <div className="col-md-3">
                    <button className="btn btn-outline-primary w-100" type="submit">Agregar</button>
                </div>
            </form>
        </div>
    );
}
