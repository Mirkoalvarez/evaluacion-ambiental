import { configureStore } from '@reduxjs/toolkit';
import evaluacionesReducer from '../features/evaluacionesSlice';
import barriosReducer from '../features/barriosSlice';
import authReducer from '../features/authSlice';

const store = configureStore({
    reducer: {
        evaluaciones: evaluacionesReducer,
        barrios: barriosReducer,
        auth: authReducer,
    },
});

export default store;
