import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function RequireAuth({ children }) {
    const { token } = useSelector((state) => state.auth);
    if (!token) {
        return <Navigate to="/auth" replace />;
    }
    return children || <Outlet />;
}
