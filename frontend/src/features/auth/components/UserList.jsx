import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, updateUserRemote, deleteUserRemote, createUserAdmin } from '../slice';

export default function UserList() {
    const dispatch = useDispatch();
    const { user: current, users, usersStatus, usersError } = useSelector((s) => s.auth);
    const [selected, setSelected] = useState(null);
    const [message, setMessage] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'user' });
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        if (current?.role === 'admin' && (usersStatus === 'idle' || usersStatus === 'failed')) {
            dispatch(fetchUsers());
        }
    }, [current, usersStatus, dispatch]);

    if (!current || current.role !== 'admin') {
        return (
            <div className="container mt-4">
                <div className="alert alert-warning">Zona solo para administradores.</div>
            </div>
        );
    }

    const startEdit = (u) => { setSelected({ ...u }); setMessage(''); setErrorMsg(''); };
    const cancelEdit = () => { setSelected(null); setMessage(''); setErrorMsg(''); };

    const saveUser = async (e) => {
        e.preventDefault();
        if (!selected) return;
        const username = selected.username.trim().replace(/\s+/g, ' ');
        const email = selected.email.trim();
        if (!username || !email) return setErrorMsg('Username y email son obligatorios');
        if (username.length < 3) return setErrorMsg('Username mínimo 3 caracteres');
        if (!/^[\wáéíóúÁÉÍÓÚñÑüÜ0-9 .-]+$/.test(username)) return setErrorMsg('Username contiene caracteres no permitidos');
        if (newPassword && newPassword.trim().length < 8) return setErrorMsg('Contraseña nueva mínimo 8 caracteres');
        setMessage(''); setErrorMsg('');
        const res = await dispatch(updateUserRemote({
            id: selected.id,
            username,
            email,
            role: selected.role,
            password: newPassword ? newPassword.trim() : undefined,
        }));
        if (res.error) setErrorMsg(res.payload?.error || 'Error al guardar');
        else { setMessage('Usuario actualizado'); setSelected(null); setNewPassword(''); }
    };

    const deleteUser = async (id) => {
        if (!window.confirm('¿Eliminar este usuario?')) return;
        setMessage(''); setErrorMsg('');
        const res = await dispatch(deleteUserRemote(id));
        if (res.error) setErrorMsg(res.payload?.error || 'No se pudo eliminar');
        else setMessage('Usuario eliminado');
    };

    const createUser = async (e) => {
        e.preventDefault();
        const username = newUser.username.trim().replace(/\s+/g, ' ');
        const email = newUser.email.trim();
        const password = newUser.password.trim();
        if (!username || !email || !password) return setErrorMsg('Completa username, email y contraseña');
        if (username.length < 3) return setErrorMsg('Username mínimo 3 caracteres');
        if (password.length < 8) return setErrorMsg('Contraseña mínimo 8 caracteres');
        if (!/^[\wáéíóúÁÉÍÓÚñÑüÜ0-9 .-]+$/.test(username)) return setErrorMsg('Username contiene caracteres no permitidos');
        setMessage(''); setErrorMsg('');
        const res = await dispatch(createUserAdmin({ ...newUser, username, email, password }));
        if (res.error) setErrorMsg(res.payload?.error || 'No se pudo crear usuario');
        else { setMessage('Usuario creado'); setNewUser({ username: '', email: '', password: '', role: 'user' }); }
    };

    return (
        <div className="container mt-4">
            <div className="text-center mb-4">
                <h2>Gestión de <span className="text-primary">Usuarios</span></h2>
                <p className="text-muted mb-0">Solo accesible para rol Admin.</p>
            </div>

            {message && <div className="alert alert-success py-2">{message}</div>}
            {errorMsg && <div className="alert alert-danger py-2">{errorMsg}</div>}
            {usersError && <div className="alert alert-danger py-2">{usersError}</div>}

            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title">Crear nuevo usuario</h5>
                    <form className="row g-3" onSubmit={createUser}>
                        <div className="col-md-3">
                            <label className="form-label">Username</label>
                            <input className="form-control" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} required minLength={3} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Email</label>
                            <input type="email" className="form-control" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required minLength={5} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Contraseña</label>
                            <input type="password" className="form-control" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required minLength={8} />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label">Rol</label>
                            <select className="form-select" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                                <option value="admin">admin</option>
                                <option value="moderador">moderador</option>
                                <option value="user">user</option>
                            </select>
                        </div>
                        <div className="col-md-1 d-flex align-items-end">
                            <button className="btn btn-success w-100" type="submit">Crear</button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="table-responsive">
                <table className="table table-striped align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>ID</th>
                            <th>Usuario</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usersStatus === 'loading' && <tr><td colSpan="5" className="text-muted">Cargando...</td></tr>}
                        {usersStatus === 'succeeded' && users.length === 0 && <tr><td colSpan="5" className="text-muted">No hay usuarios.</td></tr>}
                        {usersStatus === 'succeeded' && users.map((u) => (
                            <tr key={u.id}>
                                <td>{u.id}</td>
                                <td>{u.username}</td>
                                <td>{u.email}</td>
                                <td><span className="badge text-bg-light">{u.role}</span></td>
                                <td className="d-flex gap-2">
                                    <button className="btn btn-sm btn-primary" onClick={() => startEdit(u)}>Editar</button>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => deleteUser(u.id)}>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selected && (
                <div className="card mt-4">
                    <div className="card-body">
                        <h5 className="card-title">Editar usuario #{selected.id}</h5>
                        <form onSubmit={saveUser} className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label">Username</label>
                                <input className="form-control" value={selected.username} onChange={(e) => setSelected({ ...selected, username: e.target.value })} required minLength={3} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Email</label>
                                <input type="email" className="form-control" value={selected.email} onChange={(e) => setSelected({ ...selected, email: e.target.value })} required minLength={5} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Rol</label>
                                <select className="form-select" value={selected.role} onChange={(e) => setSelected({ ...selected, role: e.target.value })}>
                                    <option value="admin">admin</option>
                                    <option value="moderador">moderador</option>
                                    <option value="user">user</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Nueva contraseña (opcional)</label>
                                <input type="password" className="form-control" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Dejar en blanco para no cambiar" minLength={8} />
                            </div>
                            <div className="col-12 d-flex gap-2">
                                <button className="btn btn-success" type="submit">Guardar</button>
                                <button className="btn btn-outline-secondary" type="button" onClick={cancelEdit}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
