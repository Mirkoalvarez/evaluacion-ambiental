import { configureStore } from '@reduxjs/toolkit';
import evaluacionesReducer from '../features/evaluaciones/slice';
import barriosReducer from '../features/barrios/slice';
import authReducer from '../features/auth/slice';

const store = configureStore({
    reducer: {
        evaluaciones: evaluacionesReducer,
        barrios: barriosReducer,
        auth: authReducer,
    },
});

export default store;
