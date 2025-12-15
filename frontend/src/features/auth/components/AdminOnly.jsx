import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

export default function AdminOnly() {
    const { user } = useSelector((s) => s.auth);
    if (!user || user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }
    return <Outlet />;
}
