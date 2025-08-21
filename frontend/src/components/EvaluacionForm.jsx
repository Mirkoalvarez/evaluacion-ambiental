import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { crearEvaluacion } from '../features/evaluacionesSlice';
import { useNavigate } from 'react-router-dom';

const SINO = ['Sí', 'No'];
const SINO_NA = ['Sí', 'No', 'No aplica'];
const NPT = ['Nulo', 'Parcial', 'Total'];
const NPT_NA = ['Nulo', 'Parcial', 'Total', 'No aplica'];
const AREA = ['Menos de 20 m²', '20-29 m²', '30 m² o más'];
const hoy = () => new Date().toISOString().slice(0,10);

const LABELS = { /* mismos LABELS del archivo anterior */ 
    e1_1:'1.1 Registro desglosado de consumo eléctrico',
    e1_2:'1.2 Tecnologías de eficiencia energética',
    e1_3:'1.3 Inventario de artefactos con demanda energética',
    e1_4:'1.4 Proporción de luminaria LED',
    e1_5:'1.5 Proporción de electrodomésticos etiqueta A',
    e1_6:'1.6 ≥3 mejoras pasivas de eficiencia térmica',
    e1_7:'1.7 Política/plan hacia energías renovables',
    e1_8:'1.8 Abastecimiento de energía renovable',
    e1_9:'1.9 Solar térmica para agua caliente',
    a2_1:'2.1 Medidores de consumo de agua',
    a2_2:'2.2 Tecnologías de ahorro de agua',
    a2_3:'2.3 Proporción de superficie con riego aplicado',
    a2_4:'2.4 Riego automatizado',
    a2_5:'2.5 Riego fuera de horas de calor',
    a2_6:'2.6 Limpieza fuera de horas de calor',
    a2_7:'2.7 Reutilización de aguas grises',
    a2_8:'2.8 Recolección de agua pluvial/techos azules',
    r3_1:'3.1 Monitoreo del peso total de residuos',
    r3_2:'3.2 Separación y recolección diferenciada',
    r3_3:'3.3 Cantidad de corrientes de reciclables',
    r3_4:'3.4 Compostaje (orgánicos)',
    r3_5:'3.5 Gestión de REGU',
    r3_6:'3.6 Gestión de residuos de poda',
    ev4_1:'4.1 Área verde por lote (m²)',
    ev4_2:'4.2 Registro de cantidad/especies de árboles',
    ev4_3:'4.3 Presencia de especies nativas',
    ev4_4:'4.4 Poda regular y programada',
    ev4_5:'4.5 Reposición sistemática de árboles',
    ev4_6:'4.6 Intervenciones por mal estado fitosanitario',
    ev4_7:'4.7 Trasplante en lugar de tala',
    ev4_8:'4.8 Inventario de árboles talados',
    g5_1:'5.1 Responsable/equipo de gestión ambiental',
    g5_2:'5.2 Capacitaciones ambientales',
    g5_3:'5.3 Plan de acción / cronograma',
    g5_4:'5.4 Participación vecinal en sustentabilidad',
    g5_5:'5.5 Comunicación y concientización ambiental',
    g5_6:'5.6 Informe ambiental periódico',
    };

export default function EvaluacionForm() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { creando, error } = useSelector(s => s.evaluaciones);

    const [form, setForm] = useState({
        barrio_id: '',
        fecha: hoy(), // 👈 por defecto hoy
        // ENERGÍA
        e1_1:'Sí', e1_2:'Sí', e1_3:'Sí', e1_4:'Parcial', e1_5:'Parcial', e1_6:'Sí', e1_7:'No', e1_8:'No', e1_9:'No',
        // AGUA
        a2_1:'Sí', a2_2:'Sí', a2_3:'Parcial', a2_4:'Parcial', a2_5:'Sí', a2_6:'Sí', a2_7:'No', a2_8:'No',
        // RESIDUOS
        r3_1:'Sí', r3_2:'Sí', r3_3:2, r3_4:'Sí', r3_5:'No', r3_6:'Sí',
        // EV
        ev4_1:'20-29 m²', ev4_2:'No', ev4_3:'No', ev4_4:'Sí', ev4_5:'Sí', ev4_6:'No', ev4_7:'No', ev4_8:'No',
        // GESTIÓN
        g5_1:'No', g5_2:'Sí', g5_3:'No', g5_4:'Sí', g5_5:'No', g5_6:'No',
    });

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: name === 'r3_3' ? (value === '' ? '' : Number(value)) : value }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (!form.barrio_id.trim()) return alert('Ingresá el nombre del barrio');
        dispatch(crearEvaluacion(form)).unwrap()
        .then(ev => navigate(`/resultados/${ev.id}`))
        .catch(() => {});
    };

    const renderSelect = (name, options) => (
        <select className="form-select" name={name} value={form[name]} onChange={onChange}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
    );

    // Estructura consistente (label + select)
    const renderQuestion = (name, options) => (
        <div className="question-container d-flex flex-column mb-3">
        <label className="form-label mb-1 min-h-label">{LABELS[name]}</label>
        {renderSelect(name, options)}
        </div>
    );

    return (
        <div className="container">
        <h3 className="section-title">Nueva evaluación</h3>
        <form onSubmit={onSubmit} className="row g-3">
            {/* Barrio y Fecha */}
            <div className="col-12">
                <label className="form-label">Barrio (nombre)</label>
                <input className="form-control" name="barrio_id" value={form.barrio_id} onChange={onChange} required />
                </div>
                <div className="col-md-4">
                <label className="form-label">Fecha</label>
                <input
                    type="date"
                    className="form-control"
                    name="fecha"
                    value={form.fecha}
                    onChange={onChange}
                    required
                />
            </div>

            {/* ENERGÍA 1.1→1.9 */}
            <div className="col-12 mt-4">
                <div className="section-energia">
                    <h5 className="mb-3">Energía <span role="img" aria-label="energy">⚡</span></h5>
                    <div className="row g-3">
                        {['e1_1', 'e1_2', 'e1_3'].map(name => (
                        <div className="col-md-4" key={name}>
                            {renderQuestion(name, SINO)}
                        </div>
                        ))}
                        {['e1_4', 'e1_5'].map(name => (
                        <div className="col-md-4" key={name}>
                            {renderQuestion(name, NPT)}
                        </div>
                        ))}
                        {['e1_6','e1_7','e1_8','e1_9'].map(name => (
                        <div className="col-md-4" key={name}>
                            {renderQuestion(name, SINO)}
                        </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* AGUA 2.1→2.8 */}
            <div className="col-12 mt-4">
                <div className="section-agua">
                    <h5 className="mb-3">Agua <span role="img" aria-label="water">💧</span></h5>
                    <div className="row g-3">
                    {['a2_1', 'a2_2'].map(name => (
                        <div className="col-md-4" key={name}>
                        {renderQuestion(name, SINO)}
                        </div>
                    ))}
                    {['a2_3', 'a2_4'].map(name => (
                        <div className="col-md-4" key={name}>
                        {renderQuestion(name, name === 'a2_4' ? NPT_NA : NPT)}
                        </div>
                    ))}
                    {['a2_5', 'a2_6', 'a2_7', 'a2_8'].map(name => (
                        <div className="col-md-4" key={name}>
                        {renderQuestion(name, ['a2_5','a2_6'].includes(name) ? SINO_NA : SINO)}
                        </div>
                    ))}
                    </div>
                </div>
            </div>

            {/* RESIDUOS 3.1→3.6 */}
            <div className="col-12 mt-4">
                <div className="section-residuos">
                    <h5 className="mb-3">Residuos <span role="img" aria-label="recycle">♻️</span></h5>
                    <div className="row g-3">
                    {['r3_1', 'r3_2'].map(name => (
                        <div className="col-md-4" key={name}>
                        {renderQuestion(name, SINO)}
                        </div>
                    ))}
                    <div className="col-md-4">
                        <label className="form-label">{LABELS.r3_3}</label>
                        <input
                        className="form-control"
                        type="number"
                        min="0"
                        step="1"
                        name="r3_3"
                        value={form.r3_3}
                        onChange={onChange}
                        />
                    </div>
                    {['r3_4', 'r3_5', 'r3_6'].map(name => (
                        <div className="col-md-4" key={name}>
                        {renderQuestion(name, SINO)}
                        </div>
                    ))}
                    </div>
                </div>
            </div>

            {/* EV 4.1→4.8 */}
            <div className="col-12 mt-4">
                <div className="section-ev">
                    <h5 className="mb-3">Espacios Verdes <span role="img" aria-label="tree">🌳</span></h5>
                    <div className="row g-3">
                    <div className="col-md-4">
                        {renderQuestion('ev4_1', AREA)}
                    </div>
                    {['ev4_2','ev4_3','ev4_4','ev4_5','ev4_6','ev4_7','ev4_8'].map(name => (
                        <div className="col-md-4" key={name}>
                        {renderQuestion(name, SINO)}
                        </div>
                    ))}
                    </div>
                </div>
            </div>

            {/* GESTIÓN 5.1→5.6 */}
            <div className="col-12 mt-4">
                <div className="section-gestion">
                    <h5 className="mb-3">Gestión Integral <span role="img" aria-label="chart">📊</span></h5>
                    <div className="row g-3">
                    {['g5_1','g5_2','g5_3','g5_4','g5_5','g5_6'].map(name => (
                        <div className="col-md-4" key={name}>
                        {renderQuestion(name, SINO)}
                        </div>
                    ))}
                    </div>
                </div>
            </div>

            {error && (
            <div className="col-12">
                <div className="alert alert-danger">{error}</div>
            </div>
            )}
            <div className="col-12 mt-4">
            <button className="btn btn-primary" type="submit" disabled={creando}>
                {creando ? 'Creando…' : 'Crear evaluación'}
            </button>
            </div>
        </form>
        </div>
    );
}
