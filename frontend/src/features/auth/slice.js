import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import api, { setAuthToken } from '../../app/api';

const safeParse = (value) => {
    try { return JSON.parse(value); } catch { return null; }
};

const savedToken = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
let savedUser = typeof localStorage !== 'undefined' ? safeParse(localStorage.getItem('user')) : null;
if (!savedToken) {
    savedUser = null;
} else if (!savedUser && savedToken) {
    try {
        const decoded = jwtDecode(savedToken);
        savedUser = { id: decoded.id, role: decoded.role };
    } catch { savedUser = null; }
}

const initialState = {
    token: savedToken || null,
    user: savedUser || null,
    status: 'idle',
    error: null,
    users: [],
    usersStatus: 'idle',
    usersError: null,
};

if (savedToken) setAuthToken(savedToken);

const persistAuth = (token, user) => {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    }
    setAuthToken(token);
};

const clearAuth = () => {
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
    setAuthToken(null);
};

export const login = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
    try {
        const { data } = await api.post('/auth/login', payload);
        return data;
    } catch (e) {
        return rejectWithValue(e?.response?.data || { error: 'No se pudo iniciar sesion' });
    }
});

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
    try {
        const { data } = await api.post('/auth/register', payload);
        return data;
    } catch (e) {
        return rejectWithValue(e?.response?.data || { error: 'No se pudo registrar' });
    }
});

export const fetchUsers = createAsyncThunk('auth/fetchUsers', async (_, { rejectWithValue }) => {
    try {
        const { data } = await api.get('/auth/users');
        return data;
    } catch (e) {
        return rejectWithValue(e?.response?.data || { error: 'No se pudieron obtener los usuarios' });
    }
});

export const createUserAdmin = createAsyncThunk('auth/createUserAdmin', async (payload, { rejectWithValue }) => {
    try {
        const { data } = await api.post('/auth/register', payload);
        return data?.user || data;
    } catch (e) {
        return rejectWithValue(e?.response?.data || { error: 'No se pudo crear usuario' });
    }
});

export const updateUserRemote = createAsyncThunk('auth/updateUser', async ({ id, username, email, role, password }, { rejectWithValue }) => {
    try {
        const payload = { username, email, role };
        if (password) payload.password = password;
        const { data } = await api.patch(`/auth/users/${id}`, payload);
        return data?.user || data;
    } catch (e) {
        return rejectWithValue(e?.response?.data || { error: 'No se pudo actualizar usuario' });
    }
});

export const deleteUserRemote = createAsyncThunk('auth/deleteUser', async (id, { rejectWithValue }) => {
    try {
        const { data } = await api.delete(`/auth/users/${id}`);
        return { id, ok: data?.ok };
    } catch (e) {
        return rejectWithValue(e?.response?.data || { error: 'No se pudo eliminar usuario' });
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout(state) {
            state.token = null;
            state.user = null;
            state.users = [];
            state.usersStatus = 'idle';
            state.usersError = null;
            clearAuth();
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => { state.status = 'loading'; state.error = null; })
            .addCase(login.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.error = null;
                state.token = action.payload.token;
                state.user = action.payload.user;
                persistAuth(action.payload.token, action.payload.user);
            })
            .addCase(login.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload?.error || 'Error de login'; })
            .addCase(register.pending, (state) => { state.status = 'loading'; state.error = null; })
            .addCase(register.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.error = null;
                state.token = action.payload.token;
                state.user = action.payload.user;
                persistAuth(action.payload.token, action.payload.user);
            })
            .addCase(register.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload?.error || 'Error de registro'; })
            .addCase(fetchUsers.pending, (state) => { state.usersStatus = 'loading'; state.usersError = null; })
            .addCase(fetchUsers.fulfilled, (state, action) => { state.usersStatus = 'succeeded'; state.users = action.payload; })
            .addCase(fetchUsers.rejected, (state, action) => { state.usersStatus = 'failed'; state.usersError = action.payload?.error || 'Error al obtener usuarios'; })
            .addCase(createUserAdmin.fulfilled, (state, action) => { if (action.payload?.id) state.users.push(action.payload); })
            .addCase(updateUserRemote.fulfilled, (state, action) => {
                const u = action.payload;
                const ix = state.users.findIndex((x) => x.id === u.id);
                if (ix >= 0) state.users[ix] = { ...state.users[ix], ...u };
            })
            .addCase(deleteUserRemote.fulfilled, (state, action) => {
                if (action.payload?.ok) state.users = state.users.filter((u) => u.id !== action.payload.id);
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
