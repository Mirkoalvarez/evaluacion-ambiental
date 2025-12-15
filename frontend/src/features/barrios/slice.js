import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../app/api';

export const listarBarrios = createAsyncThunk('barrios/listar', async (_, { rejectWithValue }) => {
    try {
        const { data } = await api.get('/barrios');
        return data;
    } catch (e) {
        return rejectWithValue(e?.response?.data || { error: 'Error al listar barrios' });
    }
});

export const crearBarrio = createAsyncThunk('barrios/crear', async (payload, { rejectWithValue }) => {
    try {
        const { data } = await api.post('/barrios', payload);
        return data;
    } catch (e) {
        return rejectWithValue(e?.response?.data || { error: 'Error al crear barrio' });
    }
});

export const listarEvaluacionesDeBarrio = createAsyncThunk('barrios/listarEvaluacionesDeBarrio', async (barrioId, { rejectWithValue }) => {
    try {
        const { data } = await api.get(`/barrios/${barrioId}/evaluaciones`);
        return { barrioId, evaluaciones: data };
    } catch (e) {
        return rejectWithValue(e?.response?.data || { error: 'Error al listar evaluaciones del barrio' });
    }
});

export const listarIntegrantes = createAsyncThunk('barrios/listarIntegrantes', async (barrioId, { rejectWithValue }) => {
    try {
        const { data } = await api.get(`/barrios/${barrioId}/integrantes`);
        return { barrioId, integrantes: data };
    } catch (e) {
        return rejectWithValue(e?.response?.data || { error: 'Error al listar integrantes' });
    }
});

export const agregarIntegrante = createAsyncThunk('barrios/agregarIntegrante', async ({ barrioId, user_id, puede_editar_todas }, { rejectWithValue }) => {
    try {
        const { data } = await api.post(`/barrios/${barrioId}/integrantes`, { user_id, puede_editar_todas });
        return { barrioId, integrante: data };
    } catch (e) {
        return rejectWithValue(e?.response?.data || { error: 'No se pudo agregar integrante' });
    }
});

export const actualizarIntegrante = createAsyncThunk('barrios/actualizarIntegrante', async ({ barrioId, user_id, puede_editar_todas }, { rejectWithValue }) => {
    try {
        const { data } = await api.patch(`/barrios/${barrioId}/integrantes/${user_id}`, { puede_editar_todas });
        return { barrioId, integrante: data };
    } catch (e) {
        return rejectWithValue(e?.response?.data || { error: 'No se pudo actualizar integrante' });
    }
});

export const eliminarIntegrante = createAsyncThunk('barrios/eliminarIntegrante', async ({ barrioId, user_id }, { rejectWithValue }) => {
    try {
        const { data } = await api.delete(`/barrios/${barrioId}/integrantes/${user_id}`);
        return { barrioId, user_id, ok: data?.ok };
    } catch (e) {
        return rejectWithValue(e?.response?.data || { error: 'No se pudo eliminar integrante' });
    }
});

export const updateBarrioNombre = createAsyncThunk('barrios/updateNombre', async ({ id, nombre }, { rejectWithValue }) => {
    try {
        const { data } = await api.patch(`/barrios/${id}`, { nombre });
        return data;
    } catch (e) {
        return rejectWithValue(e?.response?.data || { error: 'No se pudo renombrar el barrio' });
    }
});

export const eliminarBarrio = createAsyncThunk('barrios/eliminarBarrio', async (id, { rejectWithValue }) => {
    try {
        const { data } = await api.delete(`/barrios/${id}`);
        return { id, ok: data?.ok };
    } catch (e) {
        return rejectWithValue(e?.response?.data || { error: 'No se pudo eliminar el barrio' });
    }
});

export const eliminarUltimaEvaluacion = createAsyncThunk('barrios/eliminarUltimaEvaluacion', async (id, { rejectWithValue }) => {
    try {
        const { data } = await api.delete(`/barrios/${id}/evaluaciones/ultima`);
        return { id, ok: data?.ok };
    } catch (e) {
        return rejectWithValue(e?.response?.data || { error: 'No se pudo eliminar la última evaluación' });
    }
});

export const subirImagenBarrio = createAsyncThunk('barrios/subirImagenBarrio', async ({ id, file }, { rejectWithValue }) => {
    try {
        const form = new FormData();
        form.append('imagen', file);
        const { data } = await api.post(`/barrios/${id}/imagen`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return { id, imagen: data };
    } catch (e) {
        return rejectWithValue(e?.response?.data || { error: 'No se pudo subir la imagen' });
    }
});

export const eliminarImagenBarrio = createAsyncThunk('barrios/eliminarImagenBarrio', async (id, { rejectWithValue }) => {
    try {
        const { data } = await api.delete(`/barrios/${id}/imagen`);
        return { id, ok: data?.ok };
    } catch (e) {
        return rejectWithValue(e?.response?.data || { error: 'No se pudo eliminar la imagen' });
    }
});

const slice = createSlice({
    name: 'barrios',
    initialState: {
        items: [],
        evaluaciones: {},
        integrantes: {},
        cargando: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(crearBarrio.pending, (s) => { s.cargando = true; s.error = null; })
        .addCase(crearBarrio.fulfilled, (s, a) => { s.cargando = false; s.items.push(a.payload); })
        .addCase(crearBarrio.rejected, (s, a) => { s.cargando = false; s.error = a.payload?.error || 'Error'; })

        .addCase(listarBarrios.pending, (s) => { s.cargando = true; s.error = null; })
        .addCase(listarBarrios.fulfilled, (s, a) => { s.cargando = false; s.items = a.payload; })
        .addCase(listarBarrios.rejected, (s, a) => { s.cargando = false; s.error = a.payload?.error || 'Error'; })

        .addCase(listarEvaluacionesDeBarrio.pending, (s) => { s.cargando = true; s.error = null; })
        .addCase(listarEvaluacionesDeBarrio.fulfilled, (s, a) => {
            s.cargando = false;
            s.evaluaciones[a.payload.barrioId] = a.payload.evaluaciones;
        })
        .addCase(listarEvaluacionesDeBarrio.rejected, (s, a) => { s.cargando = false; s.error = a.payload?.error || 'Error'; })

        .addCase(updateBarrioNombre.pending, (s) => { s.cargando = true; s.error = null; })
        .addCase(updateBarrioNombre.fulfilled, (s, a) => {
            s.cargando = false;
            const upd = a.payload;
            const ix = s.items.findIndex(b => b.id === upd.id);
            if (ix >= 0) s.items[ix] = { ...s.items[ix], ...upd };
            else s.items.push(upd);
        })
        .addCase(updateBarrioNombre.rejected, (s, a) => { s.cargando = false; s.error = a.payload?.error || 'Error'; })

        .addCase(eliminarBarrio.fulfilled, (s, a) => { if (a.payload?.ok) s.items = s.items.filter(b => b.id !== a.payload.id); })
        .addCase(eliminarUltimaEvaluacion.fulfilled, () => {})
        .addCase(subirImagenBarrio.fulfilled, (s, a) => {
            const { id, imagen } = a.payload;
            const ix = s.items.findIndex((b) => b.id === Number(id));
            if (ix >= 0) s.items[ix] = { ...s.items[ix], imagen };
        })
        .addCase(eliminarImagenBarrio.fulfilled, (s, a) => {
            const { id, ok } = a.payload;
            if (!ok && ok !== undefined) return;
            const ix = s.items.findIndex((b) => b.id === Number(id));
            if (ix >= 0) {
                const { imagen, ...rest } = s.items[ix];
                s.items[ix] = rest;
            }
        })

        .addCase(listarIntegrantes.pending, (s, a) => {
            const id = a.meta.arg;
            s.integrantes[id] = s.integrantes[id] || { items: [], status: 'idle', error: null };
            s.integrantes[id].status = 'loading';
            s.integrantes[id].error = null;
        })
        .addCase(listarIntegrantes.fulfilled, (s, a) => {
            s.integrantes[a.payload.barrioId] = { items: a.payload.integrantes, status: 'succeeded', error: null };
        })
        .addCase(listarIntegrantes.rejected, (s, a) => {
            const id = a.meta.arg;
            s.integrantes[id] = s.integrantes[id] || { items: [], status: 'idle', error: null };
            s.integrantes[id].status = 'failed';
            s.integrantes[id].error = a.payload?.error || 'Error';
        })
        .addCase(agregarIntegrante.fulfilled, (s, a) => {
            const { barrioId, integrante } = a.payload;
            const slot = s.integrantes[barrioId] || { items: [], status: 'idle', error: null };
            const ix = slot.items.findIndex((m) => m.user_id === integrante.user_id);
            if (ix >= 0) slot.items[ix] = integrante;
            else slot.items.push(integrante);
            s.integrantes[barrioId] = { ...slot, status: 'succeeded', error: null };
        })
        .addCase(actualizarIntegrante.fulfilled, (s, a) => {
            const { barrioId, integrante } = a.payload;
            const slot = s.integrantes[barrioId];
            if (slot) {
                const ix = slot.items.findIndex((m) => m.user_id === integrante.user_id);
                if (ix >= 0) slot.items[ix] = { ...slot.items[ix], ...integrante };
            }
        })
        .addCase(eliminarIntegrante.fulfilled, (s, a) => {
            const { barrioId, user_id, ok } = a.payload;
            if (!ok) return;
            const slot = s.integrantes[barrioId];
            if (slot) slot.items = slot.items.filter((m) => m.user_id !== Number(user_id));
        });
    }
});

export default slice.reducer;
