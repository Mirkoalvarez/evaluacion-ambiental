import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { obtenerEvaluacion, patchEvaluacion } from '../features/evaluacionesSlice';
import { updateBarrioNombre, listarBarrios } from '../features/barriosSlice';
import { useParams, Link, useNavigate } from 'react-router-dom';

const SINO = ['Sí', 'No'];
const SINO_NA = ['Sí', 'No', 'No aplica'];
const NPT  = ['Nulo', 'Parcial', 'Total'];
const NPT_NA = ['Nulo', 'Parcial', 'Total', 'No aplica'];
const AREA = ['Menos de 20 m²', '20-29 m²', '30 m² o más'];

const LABELS = {
    // Energía
    e1_1:'1.1 Registro desglosado de consumo eléctrico',
    e1_2:'1.2 Tecnologías de eficiencia energética',
    e1_3:'1.3 Inventario de artefactos con demanda energética',
    e1_4:'1.4 Proporción de luminaria LED',
    e1_5:'1.5 Proporción de electrodomésticos etiqueta A',
    e1_6:'1.6 ≥3 mejoras pasivas de eficiencia térmica',
    e1_7:'1.7 Política/plan hacia energías renovables',
    e1_8:'1.8 Abastecimiento de energía renovable',
    e1_9:'1.9 Solar térmica para agua caliente',
    // Agua
    a2_1:'2.1 Medidores de consumo de agua',
    a2_2:'2.2 Tecnologías de ahorro de agua',
    a2_3:'2.3 Proporción de superficie con riego aplicado',
    a2_4:'2.4 Riego automatizado',
    a2_5:'2.5 Riego fuera de horas de calor',
    a2_6:'2.6 Limpieza fuera de horas de calor',
    a2_7:'2.7 Reutilización de aguas grises',
    a2_8:'2.8 Recolección de agua pluvial/techos azules',
    // Residuos
    r3_1:'3.1 Monitoreo del peso total de residuos',
    r3_2:'3.2 Separación y recolección diferenciada',
    r3_3:'3.3 Cantidad de corrientes de reciclables',
    r3_4:'3.4 Compostaje (orgánicos)',
    r3_5:'3.5 Gestión de REGU',
    r3_6:'3.6 Gestión de residuos de poda',
    // Espacios Verdes
    ev4_1:'4.1 Área verde por lote (m²)',
    ev4_2:'4.2 Registro de cantidad/especies de árboles',
    ev4_3:'4.3 Presencia de especies nativas',
    ev4_4:'4.4 Poda regular y programada',
    ev4_5:'4.5 Reposición sistemática de árboles',
    ev4_6:'4.6 Intervenciones por mal estado fitosanitario',
    ev4_7:'4.7 Trasplante en lugar de tala',
    ev4_8:'4.8 Inventario de árboles talados',
    // Gestión
    g5_1:'5.1 Responsable/equipo de gestión ambiental',
    g5_2:'5.2 Capacitaciones ambientales',
    g5_3:'5.3 Plan de acción / cronograma',
    g5_4:'5.4 Participación vecinal en sustentabilidad',
    g5_5:'5.5 Comunicación y concientización ambiental',
    g5_6:'5.6 Informe ambiental periódico',
};

export default function EditarEvaluacion() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { actual, cargando, guardando, error } = useSelector(s => s.evaluaciones);

    const [fecha, setFecha] = useState('');
    const [form, setForm] = useState({});
    const [original, setOriginal] = useState({});
    const [barrioNombre, setBarrioNombre] = useState('');

    // Orden por eje como en creación
    const CAMPOS = useMemo(() => ([
        // ENERGÍA 1.1→1.9
        'e1_1','e1_2','e1_3','e1_4','e1_5','e1_6','e1_7','e1_8','e1_9',
        // AGUA 2.1→2.8
        'a2_1','a2_2','a2_3','a2_4','a2_5','a2_6','a2_7','a2_8',
        // RESIDUOS 3.1→3.6
        'r3_1','r3_2','r3_3','r3_4','r3_5','r3_6',
        // EV 4.1→4.8
        'ev4_1','ev4_2','ev4_3','ev4_4','ev4_5','ev4_6','ev4_7','ev4_8',
        // GESTIÓN 5.1→5.6
        'g5_1','g5_2','g5_3','g5_4','g5_5','g5_6',
    ]), []);

    useEffect(() => { dispatch(obtenerEvaluacion(id)); }, [dispatch, id]);

    useEffect(() => {
        if (actual && String(actual.id) === String(id)) {
        setFecha(actual.fecha ? String(actual.fecha).slice(0,10) : '');
        const f = {};
        CAMPOS.forEach(k => { f[k] = actual[k] ?? ''; });
        setForm(f);
        setOriginal(f);
        setBarrioNombre(actual?.barrio?.nombre ?? '');
        }
    }, [actual, id, CAMPOS]);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
        ...prev,
        [name]: name === 'r3_3' ? (value === '' ? '' : Number(value)) : value
        }));
    };

    const renderSelect = (name, options) => (
        <select className="form-select" name={name} value={form[name] ?? ''} onChange={onChange}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
    );

    const renderQuestion = (name, options) => (
        <div className="question-container d-flex flex-column mb-3">
        <label className="form-label mb-1 min-h-label">{LABELS[name]}</label>
        {renderSelect(name, options)}
        </div>
    );

    const renderNumber = (name, props = {}) => (
        <div className="question-container d-flex flex-column mb-3">
        <label className="form-label mb-1 min-h-label">{LABELS[name]}</label>
        <input
            className="form-control"
            type="number"
            name={name}
            value={form[name] ?? ''}
            onChange={onChange}
            min={props.min ?? 0}
            step={props.step ?? 1}
        />
        </div>
    );

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
        // 1) Renombrar barrio si cambió
        if (barrioNombre && barrioNombre !== (actual?.barrio?.nombre ?? '')) {
            await dispatch(updateBarrioNombre({ id: actual.barrio_id, nombre: barrioNombre.trim() })).unwrap();
        }

        // 2) Detectar cambios (incluida la fecha)
        const cambios = {};
        if (fecha && fecha !== (actual.fecha ?? '')) {
            cambios.fecha = fecha; // YYYY-MM-DD
        }
        for (const k of CAMPOS) {
            if (form[k] !== original[k]) cambios[k] = form[k];
        }

        if (Object.keys(cambios).length > 0) {
            await dispatch(patchEvaluacion({ id, cambios })).unwrap();
        }

        // 3) Refetch y navegar
        await dispatch(obtenerEvaluacion(id)).unwrap();
        await dispatch(listarBarrios());
        navigate(`/resultados/${id}`, { replace: true });
        } catch (err) {
        // gestionado por el slice
        }
    };

    if (cargando || !actual) {
        return <div className="container"><p>{cargando ? 'Cargando…' : (error || 'Sin datos')}</p></div>;
    }

    return (
        <div className="container">
        <h3 className="section-title">Editar evaluación #{actual.id}</h3>

        {/* Panel superior: barrio + fecha + resumen */}
        <div className="card mb-3">
            <div className="card-body">
            <div className="row g-2 align-items-end">
                <div className="col-md-6">
                <label className="form-label">Barrio (nombre)</label>
                <input
                    className="form-control"
                    value={barrioNombre}
                    onChange={(e) => setBarrioNombre(e.target.value)}
                    placeholder="Nombre del barrio"
                />
                <small className="text-muted">
                    Cambiá el nombre del barrio aquí. No se toca el <code>barrio_id</code> de la evaluación.
                </small>
                </div>
                <div className="col-md-6">
                <strong>Total:</strong> {actual.resultado_total} ({actual.puntaje_final})<br/>
                <small className="text-muted">
                    Energía {actual.resultado_energia} ({actual.puntaje_energia}) · Agua {actual.resultado_agua} ({actual.puntaje_agua}) ·
                    Residuos {actual.resultado_residuos} ({actual.puntaje_residuos}) · EV {actual.resultado_espacios_verdes} ({actual.puntaje_espacios_verdes}) ·
                    Gestión {actual.resultado_gestion} ({actual.puntaje_gestion})
                </small>
                </div>
            </div>
            </div>
        </div>

        <div className="card mb-3">
            <div className="card-body">
            <div className="row g-2">
                <div className="col-md-4">
                <label className="form-label">Fecha</label>
                <input
                    type="date"
                    className="form-control"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    required
                />
                </div>
            </div>
            </div>
        </div>

        {/* Form principal */}
        {/* Form principal */}
        <form className="row g-3" onSubmit={onSubmit}>
            {/* ENERGÍA */}
            <div className="col-12 mt-4">
                <div className="section-energia">
                    <h5 className="mb-3">Energía <span role="img" aria-label="energy">⚡</span></h5>
                    <div className="row g-3">
                    {['e1_1','e1_2','e1_3'].map(n => (
                        <div className="col-md-4" key={n}>{renderQuestion(n, SINO)}</div>
                    ))}
                    {['e1_4','e1_5'].map(n => (
                        <div className="col-md-4" key={n}>{renderQuestion(n, NPT)}</div>
                    ))}
                    {['e1_6','e1_7','e1_8','e1_9'].map(n => (
                        <div className="col-md-4" key={n}>{renderQuestion(n, SINO)}</div>
                    ))}
                    </div>
                </div>
            </div>

            {/* AGUA */}
            <div className="col-12 mt-4">
                <div className="section-agua">
                    <h5 className="mb-3">Agua <span role="img" aria-label="water">💧</span></h5>
                    <div className="row g-3">
                    {['a2_1','a2_2'].map(n => (
                        <div className="col-md-4" key={n}>{renderQuestion(n, SINO)}</div>
                    ))}
                    {['a2_3','a2_4'].map(n => (
                        <div className="col-md-4" key={n}>{renderQuestion(n, n === 'a2_4' ? NPT_NA : NPT)}</div>
                    ))}
                    {['a2_5','a2_6','a2_7','a2_8'].map(n => (
                        <div className="col-md-4" key={n}>{renderQuestion(n, ['a2_5','a2_6'].includes(n) ? SINO_NA : SINO)}</div>
                    ))}
                    </div>
                </div>
            </div>

            {/* RESIDUOS */}
            <div className="col-12 mt-4">
                <div className="section-residuos">
                    <h5 className="mb-3">Residuos <span role="img" aria-label="recycle">♻️</span></h5>
                    <div className="row g-3">
                    {['r3_1','r3_2'].map(n => (
                        <div className="col-md-4" key={n}>{renderQuestion(n, SINO)}</div>
                    ))}
                    <div className="col-md-4">
                        {renderNumber('r3_3', { min: 0, step: 1 })}
                    </div>
                    {['r3_4','r3_5','r3_6'].map(n => (
                        <div className="col-md-4" key={n}>{renderQuestion(n, SINO)}</div>
                    ))}
                    </div>
                </div>
            </div>

            {/* ESPACIOS VERDES */}
            <div className="col-12 mt-4">
                <div className="section-ev">
                    <h5 className="mb-3">Espacios Verdes <span role="img" aria-label="tree">🌳</span></h5>
                    <div className="row g-3">
                    <div className="col-md-4">{renderQuestion('ev4_1', AREA)}</div>
                    {['ev4_2','ev4_3','ev4_4','ev4_5','ev4_6','ev4_7','ev4_8'].map(n => (
                        <div className="col-md-4" key={n}>{renderQuestion(n, SINO)}</div>
                    ))}
                    </div>
                </div>
            </div>

            {/* GESTIÓN */}
            <div className="col-12 mt-4">
                <div className="section-gestion">
                    <h5 className="mb-3">Gestión Integral <span role="img" aria-label="chart">📊</span></h5>
                    <div className="row g-3">
                    {['g5_1','g5_2','g5_3','g5_4','g5_5','g5_6'].map(n => (
                        <div className="col-md-4" key={n}>{renderQuestion(n, SINO)}</div>
                    ))}
                    </div>
                </div>
            </div>

            {error && (
            <div className="col-12"><div className="alert alert-danger">{error}</div></div>
            )}
            <div className="col-12 d-flex gap-2 mt-2">
            <button className="btn btn-primary" type="submit" disabled={guardando}>
                {guardando ? 'Guardando…' : 'Guardar cambios'}
            </button>
            <Link to={`/resultados/${actual.id}`} className="btn btn-link">Ver resultados</Link>
            <Link to={`/respuestas/${actual.id}`} className="btn btn-link">Respuestas detalladas</Link>
            <Link to="/" className="btn btn-link">Volver a Barrios</Link>
            </div>
        </form>
        </div>
    );
}
