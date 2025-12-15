import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../app/api';

export const crearEvaluacion = createAsyncThunk('evaluaciones/crear', async (payload, { rejectWithValue }) => {
    try {
        const { data } = await api.post('/evaluaciones', payload);
        return data;
    } catch (e) {
        return rejectWithValue(e?.response?.data || { error: 'Error al crear evaluación' });
    }
});

export const obtenerEvaluacion = createAsyncThunk('evaluaciones/obtener', async (id, { rejectWithValue }) => {
    try {
        const { data } = await api.get(`/evaluaciones/${id}`);
        return data;
    } catch (e) {
        return rejectWithValue(e?.response?.data || { error: 'Evaluación no encontrada' });
    }
});

export const patchEvaluacion = createAsyncThunk('evaluaciones/patch', async ({ id, cambios }, { rejectWithValue }) => {
    try {
        const { data } = await api.patch(`/evaluaciones/${id}`, cambios);
        return data;
    } catch (e) {
        return rejectWithValue(e?.response?.data || { error: 'Error al actualizar evaluación' });
    }
});

export const listarArchivosEvaluacion = createAsyncThunk('evaluaciones/listarArchivos', async (id, { rejectWithValue }) => {
    try {
        const { data } = await api.get(`/evaluaciones/${id}/archivos`);
        return { id, archivos: data };
    } catch (e) {
        return rejectWithValue(e?.response?.data || { error: 'No se pudieron obtener los archivos' });
    }
});

export const subirArchivoEvaluacion = createAsyncThunk('evaluaciones/subirArchivo', async ({ id, file }, { rejectWithValue }) => {
    try {
        const form = new FormData();
        form.append('archivo', file);
        const { data } = await api.post(`/evaluaciones/${id}/archivos`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return { id, archivo: data };
    } catch (e) {
        return rejectWithValue(e?.response?.data || { error: 'No se pudo subir el archivo' });
    }
});

export const eliminarArchivoEvaluacion = createAsyncThunk('evaluaciones/eliminarArchivo', async ({ archivoId }, { rejectWithValue }) => {
    try {
        const { data } = await api.delete(`/evaluaciones/archivos/${archivoId}`);
        return { archivoId, ok: data?.ok };
    } catch (e) {
        return rejectWithValue(e?.response?.data || { error: 'No se pudo eliminar el archivo' });
    }
});

export const eliminarEvaluacion = createAsyncThunk('evaluaciones/eliminar', async (id, { rejectWithValue }) => {
    try {
        const { data } = await api.delete(`/evaluaciones/${id}`);
        return { id, ok: data?.ok };
    } catch (e) {
        return rejectWithValue(e?.response?.data || { error: 'No se pudo eliminar la evaluación' });
    }
});

const slice = createSlice({
    name: 'evaluaciones',
    initialState: {
        actual: null,
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
        .addCase(patchEvaluacion.rejected, (s, a) => { s.guardando = false; s.error = a.payload?.error || 'Error'; })

        .addCase(listarArchivosEvaluacion.fulfilled, (s, a) => {
            if (s.actual && String(s.actual.id) === String(a.payload.id)) {
                s.actual = { ...s.actual, archivos: a.payload.archivos };
            }
        })
        .addCase(subirArchivoEvaluacion.fulfilled, (s, a) => {
            if (s.actual && String(s.actual.id) === String(a.payload.id)) {
                const prev = s.actual.archivos || [];
                s.actual = { ...s.actual, archivos: [a.payload.archivo, ...prev] };
            }
        })
        .addCase(eliminarArchivoEvaluacion.fulfilled, (s, a) => {
            if (s.actual && s.actual.archivos) {
                s.actual.archivos = s.actual.archivos.filter((x) => x.id !== a.payload.archivoId);
            }
        })
        .addCase(eliminarEvaluacion.fulfilled, (s, a) => {
            if (s.actual && String(s.actual.id) === String(a.payload.id)) {
                s.actual = null;
            }
        });
    }
});

export const { limpiarActual } = slice.actions;
export default slice.reducer;
