import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../slice';

export default function AuthPage() {
    const [mode, setMode] = useState('login');
    const [form, setForm] = useState({ identifier: '', username: '', email: '', password: '', password2: '' });
    const [showPass, setShowPass] = useState(false);
    const [showPass2, setShowPass2] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { status, error, user } = useSelector((state) => state.auth);

    useEffect(() => { if (user) navigate('/'); }, [user, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const trimmed = value.replace(/\s+/g, ' ');
        setForm((prev) => ({ ...prev, [name]: trimmed }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (mode === 'login') {
            const payload = {};
            const id = form.identifier.trim();
            if (!id) return;
            if (id.includes('@')) payload.email = id; else payload.username = id;
            payload.password = form.password;
            dispatch(login(payload));
        } else {
            const username = form.username.trim();
            const email = form.email.trim();
            const pass = form.password.trim();
            const pass2 = form.password2.trim();
            if (!username || !email || !pass) return alert('Completa username, email y contraseña');
            if (pass !== pass2) return alert('Las contraseñas no coinciden');
            if (username.length > 60 || email.length > 120) return alert('Username o email demasiado largos');
            const validUser = /^[\wáéíóúñüÁÉÍÓÚÑÜ .-]+$/.test(username);
            if (!validUser) return alert('Username contiene caracteres no permitidos');
            dispatch(register({ username, email, password: pass }));
        }
    };

    const isLoading = status === 'loading';

    return (
        <div className="row justify-content-center mt-4">
            <div className="col-md-6">
                <div className="card shadow-sm">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="card-title mb-0">
                                {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                            </h5>
                            <button className="btn btn-link p-0" onClick={() => setMode((m) => m === 'login' ? 'register' : 'login')}>
                                {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                            </button>
                        </div>

                        {error && <div className="alert alert-danger py-2">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            {mode === 'login' ? (
                                <>
                                    <div className="mb-3">
                                        <label className="form-label">Usuario o email</label>
                                        <input type="text" className="form-control" name="identifier" value={form.identifier} onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Contraseña</label>
                                        <div className="input-group">
                                            <input type={showPass ? 'text' : 'password'} className="form-control" name="password" value={form.password} onChange={handleChange} required />
                                            <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPass(!showPass)}>
                                                {showPass ? 'Ocultar' : 'Mostrar'}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="mb-3">
                                        <label className="form-label">Usuario</label>
                                        <input type="text" className="form-control" name="username" value={form.username} onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Email</label>
                                        <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Contraseña</label>
                                        <div className="input-group">
                                            <input type={showPass ? 'text' : 'password'} className="form-control" name="password" value={form.password} onChange={handleChange} required />
                                            <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPass(!showPass)}>
                                                {showPass ? 'Ocultar' : 'Mostrar'}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Repetir contraseña</label>
                                        <div className="input-group">
                                            <input type={showPass2 ? 'text' : 'password'} className="form-control" name="password2" value={form.password2} onChange={handleChange} required />
                                            <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPass2(!showPass2)}>
                                                {showPass2 ? 'Ocultar' : 'Mostrar'}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}

                            <button type="submit" className="btn btn-success w-100" disabled={isLoading}>
                                {isLoading ? 'Procesando...' : (mode === 'login' ? 'Ingresar' : 'Registrarse')}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
