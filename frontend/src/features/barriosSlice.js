import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from './api';

export const listarBarrios = createAsyncThunk(
    'barrios/listar',
    async (_, { rejectWithValue }) => {
        try {
        const { data } = await api.get('/barrios');
        return data;
        } catch (e) {
        return rejectWithValue(e?.response?.data || { error: 'Error al listar barrios' });
        }
    }
);

// NUEVO: evaluaciones de un barrio
export const listarEvaluacionesDeBarrio = createAsyncThunk(
    'barrios/listarEvaluacionesDeBarrio',
    async (barrioId, { rejectWithValue }) => {
        try {
        const { data } = await api.get(`/barrios/${barrioId}/evaluaciones`);
        return { barrioId, evaluaciones: data };
        } catch (e) {
        return rejectWithValue(e?.response?.data || { error: 'Error al listar evaluaciones del barrio' });
        }
    }
);


// 🔹 NUEVO: renombrar un barrio (PATCH /api/barrios/:id { nombre })
export const updateBarrioNombre = createAsyncThunk(
    'barrios/updateNombre',
    async ({ id, nombre }, { rejectWithValue }) => {
        try {
        const { data } = await api.patch(`/barrios/${id}`, { nombre });
        return data; // devuelve el barrio actualizado
        } catch (e) {
        return rejectWithValue(e?.response?.data || { error: 'No se pudo renombrar el barrio' });
        }
    }
);

// 🔴 eliminar barrio (y sus evaluaciones)
export const eliminarBarrio = createAsyncThunk(
    'barrios/eliminarBarrio',
    async (id, { rejectWithValue }) => {
        try {
        const { data } = await api.delete(`/barrios/${id}`);
        return { id, ok: data?.ok };
        } catch (e) {
        return rejectWithValue(e?.response?.data || { error: 'No se pudo eliminar el barrio' });
        }
    }
);

// 🟠 eliminar última evaluación del barrio
export const eliminarUltimaEvaluacion = createAsyncThunk(
    'barrios/eliminarUltimaEvaluacion',
    async (id, { rejectWithValue }) => {
        try {
        const { data } = await api.delete(`/barrios/${id}/evaluaciones/ultima`);
        return { id, ok: data?.ok };
        } catch (e) {
        return rejectWithValue(e?.response?.data || { error: 'No se pudo eliminar la última evaluación' });
        }
    }
);

const slice = createSlice({
    name: 'barrios',
    initialState: {
        items: [],
        evaluaciones: {},
        cargando: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
        // listarBarrios
        .addCase(listarBarrios.pending, (s) => { s.cargando = true; s.error = null; })
        .addCase(listarBarrios.fulfilled, (s, a) => { s.cargando = false; s.items = a.payload; })
        .addCase(listarBarrios.rejected, (s, a) => { s.cargando = false; s.error = a.payload?.error || 'Error'; })

        // listarEvaluacionesDeBarrio
        .addCase(listarEvaluacionesDeBarrio.pending, (s) => { s.cargando = true; s.error = null; })
        .addCase(listarEvaluacionesDeBarrio.fulfilled, (s, a) => {
            s.cargando = false;
            s.evaluaciones[a.payload.barrioId] = a.payload.evaluaciones;
        })
        .addCase(listarEvaluacionesDeBarrio.rejected, (s, a) => {
            s.cargando = false; s.error = a.payload?.error || 'Error';
        })

        // 🔹 NUEVO: updateBarrioNombre
        .addCase(updateBarrioNombre.pending, (s) => { s.cargando = true; s.error = null; })
        .addCase(updateBarrioNombre.fulfilled, (s, a) => {
            s.cargando = false;
            const upd = a.payload; // { id, nombre, resultado_total }
            const ix = s.items.findIndex(b => b.id === upd.id);
            if (ix >= 0) s.items[ix] = { ...s.items[ix], ...upd };
            else s.items.push(upd);
        })
        .addCase(updateBarrioNombre.rejected, (s, a) => {
            s.cargando = false; s.error = a.payload?.error || 'Error';
        })

        //Eliminar Barrio
        .addCase(eliminarBarrio.fulfilled, (s, a) => {
            if (a.payload?.ok) s.items = s.items.filter(b => b.id !== a.payload.id);
            })
        .addCase(eliminarUltimaEvaluacion.fulfilled, (s, a) => {
            // No modificamos items acá; tras borrar última evaluación, el resultado_total del barrio pudo cambiar.
            // Volvemos a listar para refrescar card.
        });
    }
});

export default slice.reducer;
