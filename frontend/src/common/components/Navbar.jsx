import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/slice';

export default function Navbar() {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/auth');
    };

    return (
        <nav className="navbar navbar-expand-lg bg-white">
            <div className="container">
                <Link to="/" className="navbar-brand">
                    <span className="logo-icon" role="img" aria-label="tree">🌳</span>
                    EcoEval
                </Link>
                <div className="collapse navbar-collapse show">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item"><NavLink end to="/" className="nav-link">Barrios</NavLink></li>
                        <li className="nav-item"><NavLink to="/nueva-evaluacion" className="nav-link">Nueva evaluacion</NavLink></li>
                        <li className="nav-item"><NavLink to="/guia-interpretacion" className="nav-link">Guia de interpretacion</NavLink></li>
                        {user?.role === 'admin' && (
                            <li className="nav-item"><NavLink to="/usuarios" className="nav-link">Usuarios</NavLink></li>
                        )}
                    </ul>
                    <div className="d-flex align-items-center gap-2">
                        {user ? (
                            <>
                                <span className="badge text-bg-light">{user.role || 'user'}</span>
                                <span className="fw-semibold">{user.username || user.email || 'Usuario'}</span>
                                <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>
                                    Cerrar sesion
                                </button>
                            </>
                        ) : (
                            <NavLink to="/auth" className="btn btn-outline-success btn-sm">Login / Registro</NavLink>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
