import React from 'react';
import { Link, NavLink } from 'react-router-dom';
// Importa un icono si usas una librería como react-icons
// Por ejemplo, si instalas 'react-icons': npm install react-icons
// import { FaLeaf } from 'react-icons/fa'; // O cualquier otro icono ambiental

export default function Navbar() {
    return (
        <nav className="navbar navbar-expand-lg bg-white">
        <div className="container">
            <Link to="/" className="navbar-brand">
                {/* Puedes usar un icono de una librería o un simple emoji/SVG */}
                <span className="logo-icon" role="img" aria-label="leaf">🌿</span> {/* Icono de hoja */}
                {/* <FaLeaf className="logo-icon" /> */} {/* Si usas react-icons */}
                EcoEval
            </Link>
            <div className="collapse navbar-collapse show">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item"><NavLink end to="/" className="nav-link">Barrios</NavLink></li>
                <li className="nav-item"><NavLink to="/nueva-evaluacion" className="nav-link">Nueva evaluación</NavLink></li>
            </ul>
            </div>
        </div>
        </nav>
    );
}
