import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './app/store';
import Navbar from './components/Navbar';
import BarrioList from './components/BarrioList';
import EvaluacionForm from './components/EvaluacionForm';
import AuthPage from './components/AuthPage';
import UserList from './components/UserList';
import RequireAuth from './components/RequireAuth';
import AdminOnly from './components/AdminOnly';

import GoToLatest from './components/GoToLatest';
import RespuestasDetalladas from './components/RespuestasDetalladas';
import Resultados from './components/Resultados';
import EditarEvaluacion from './components/EditarEvaluacion';
import GuiaInterpretacion from './components/GuiaInterpretacion';
import BarrioEvaluaciones from './components/BarrioEvaluaciones';

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
              <Route path="/auth" element={<AuthPage />} />
              <Route element={<RequireAuth />}>
                <Route path="/" element={<BarrioList />} />
                <Route path="/barrios/:id/ir/:dest" element={<GoToLatest />} />
                <Route path="/barrios/:id/historial" element={<BarrioEvaluaciones />} />
                <Route path="/nueva-evaluacion" element={<EvaluacionForm />} />
                <Route path="/resultados/:id" element={<Resultados />} />
                <Route path="/respuestas/:id" element={<RespuestasDetalladas />} />
                <Route path="/editar/:id" element={<EditarEvaluacion />} />
                <Route path="/guia-interpretacion" element={<GuiaInterpretacion />} />
                <Route element={<AdminOnly />}>
                  <Route path="/usuarios" element={<UserList />} />
                </Route>
              </Route>
              <Route path="*" element={<AuthPage />} />
            </Routes>
          </div>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
