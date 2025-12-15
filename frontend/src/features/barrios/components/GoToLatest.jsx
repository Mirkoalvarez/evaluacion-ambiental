import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../app/api';

export default function GoToLatest() {
    const { id, dest } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get(`/barrios/${id}/evaluaciones`);
                if (!data || data.length === 0) {
                    alert('Este barrio aún no tiene evaluaciones.');
                    navigate(`/barrios/${id}`, { replace: true });
                    return;
                }
                const evalId = data[0].id;
                if (dest === 'resultados') navigate(`/resultados/${evalId}`, { replace: true });
                else if (dest === 'respuestas') navigate(`/respuestas/${evalId}`, { replace: true });
                else if (dest === 'editar') navigate(`/editar/${evalId}`, { replace: true });
                else navigate(`/barrios/${id}`, { replace: true });
            } catch (e) {
                const msg = e?.response?.data?.error || e.message || 'Error desconocido';
                alert(`No se pudo obtener la última evaluación: ${msg}`);
                navigate(`/barrios/${id}`, { replace: true });
            }
        })();
    }, [id, dest, navigate]);

    return <div className="container"><p>Buscando la última evaluación…</p></div>;
}
