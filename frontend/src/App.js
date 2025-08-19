import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './app/store';
import Navbar from './components/Navbar';
import BarrioList from './components/BarrioList';
import EvaluacionForm from './components/EvaluacionForm';

import GoToLatest from './components/GoToLatest';
// import RespuestasDetalladas desde tu archivo real:
import RespuestasDetalladas from './components/RespuestasDetalladas';
// Resultados.jsx ya lo tenés
import Resultados from './components/Resultados';
// EditarEvaluacion.jsx lo actualizamos para aceptar :id
import EditarEvaluacion from './components/EditarEvaluacion';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Navbar />
          <div className="container">
            <Routes>
              <Route path="/" element={<BarrioList />} />
              {/* Redirecciones a la última evaluación del barrio */}
              <Route path="/barrios/:id/ir/:dest" element={<GoToLatest />} />

              <Route path="/nueva-evaluacion" element={<EvaluacionForm />} />

              {/* Usá tus componentes existentes */}
              <Route path="/resultados/:id" element={<Resultados />} />
              <Route path="/respuestas/:id" element={<RespuestasDetalladas />} />
              <Route path="/editar/:id" element={<EditarEvaluacion />} />
            </Routes>
          </div>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
