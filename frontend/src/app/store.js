import { configureStore } from '@reduxjs/toolkit';
import evaluacionesReducer from '../features/evaluacionesSlice';
import barriosReducer from '../features/barriosSlice';

const store = configureStore({
    reducer: {
        evaluaciones: evaluacionesReducer,
        barrios: barriosReducer,
    },
});

export default store;
