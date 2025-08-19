import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from './api';

// Crear
export const crearEvaluacion = createAsyncThunk(
    'evaluaciones/crear',
    async (payload, { rejectWithValue }) => {
        try {
        const { data } = await api.post('/evaluaciones', payload);
        return data;
        } catch (e) {
        return rejectWithValue(e?.response?.data || { error: 'Error al crear evaluación' });
        }
    }
);

// Obtener por id
export const obtenerEvaluacion = createAsyncThunk(
    'evaluaciones/obtener',
    async (id, { rejectWithValue }) => {
        try {
        const { data } = await api.get(`/evaluaciones/${id}`);
        return data;
        } catch (e) {
        return rejectWithValue(e?.response?.data || { error: 'Evaluación no encontrada' });
        }
    }
);

// Patch (parcial)
export const patchEvaluacion = createAsyncThunk(
    'evaluaciones/patch',
    async ({ id, cambios }, { rejectWithValue }) => {
        try {
        const { data } = await api.patch(`/evaluaciones/${id}`, cambios);
        return data;
        } catch (e) {
        return rejectWithValue(e?.response?.data || { error: 'Error al actualizar evaluación' });
        }
    }
);

const slice = createSlice({
    name: 'evaluaciones',
    initialState: {
        actual: null,   // última evaluación cargada o editada
        creando: false,
        cargando: false,
        guardando: false,
        error: null
    },
    reducers: {
        limpiarActual: (s) => { s.actual = null; s.error = null; }
    },
    extraReducers: (b) => {
        b.addCase(crearEvaluacion.pending, (s) => { s.creando = true; s.error = null; })
        .addCase(crearEvaluacion.fulfilled, (s, a) => { s.creando = false; s.actual = a.payload; })
        .addCase(crearEvaluacion.rejected, (s, a) => { s.creando = false; s.error = a.payload?.error || 'Error'; })

        .addCase(obtenerEvaluacion.pending, (s) => { s.cargando = true; s.error = null; })
        .addCase(obtenerEvaluacion.fulfilled, (s, a) => { s.cargando = false; s.actual = a.payload; })
        .addCase(obtenerEvaluacion.rejected, (s, a) => { s.cargando = false; s.error = a.payload?.error || 'Error'; })

        .addCase(patchEvaluacion.pending, (s) => { s.guardando = true; s.error = null; })
        .addCase(patchEvaluacion.fulfilled, (s, a) => { s.guardando = false; s.actual = a.payload; })
        .addCase(patchEvaluacion.rejected, (s, a) => { s.guardando = false; s.error = a.payload?.error || 'Error'; });
    }
});

export const { limpiarActual } = slice.actions;
export default slice.reducer;
