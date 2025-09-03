import React, { useEffect } from 'react';
import './GuiaInterpretacion.css';

export default function GuiaInterpretacion() {
    useEffect(() => {
    document.title = 'Guía de interpretación de indicadores';
    const metaDescription = document.querySelector('meta[name="description"]');
    const content = 'Guía de interpretación de indicadores de energía, agua, residuos, espacios verdes y gestión integral.';
    if (metaDescription) {
        metaDescription.setAttribute('content', content);
    } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = content;
        document.head.appendChild(meta);
    }
    }, []);

    return (
    <div className="container my-4">
        <h1>Guía de interpretación de indicadores</h1>
        <div className="alert alert-info" role="alert">
        Lo evaluado por cada indicador corresponde únicamente a los espacios comunes del barrio (calles internas, veredas, plazas, áreas verdes, SUM/club house, canchas, gimnasio, senderos, juegos, estacionamientos comunes, parrillas, coworking, garitas, accesos, iluminación pública y zonas de gestión de residuos/reciclaje).
        </div>

        <nav>
        <ul className="guia-interpretacion-nav">
            <li><a href="#energia">Energía</a></li>
            <li><a href="#agua">Agua</a></li>
            <li><a href="#residuos">Residuos</a></li>
            <li><a href="#espacios-verdes">Espacios Verdes</a></li>
            <li><a href="#gestion-integral">Gestión Integral</a></li>
        </ul>
        </nav>

        <section id="energia" className="my-4 guia-interpretacion-section">
        <h2>Energía</h2>
        <section id="energia-1-1">
            <details>
            <summary>1.1 Registro desglosado de consumo energético</summary>
            <p>Interpretación: Identifica si se cuenta con un registro diferenciado del gasto energético de cada uno de los espacios, conforme a lo establecido por la normativa.</p>
            </details>
        </section>
        <section id="energia-1-2">
            <details>
            <summary>1.2 Implementación de tecnologías de eficiencia energética</summary>
            <p>Interpretación: Identifica si se utilizan tecnologías que reducen el uso innecesario de energía en los espacios comunes, incluyendo temporizadores, sensores de movimiento, fotocélulas.</p>
            </details>
        </section>
        <section id="energia-1-3">
            <details>
            <summary>1.3 Realización de inventario de artefactos con demanda energética</summary>
            <p>Interpretación: Identifica si se lleva un registro detallado del equipamiento que consume energía, facilitando su control y planificación.</p>
            </details>
        </section>
        <section id="energia-1-4">
            <details>
            <summary>1.4 Proporción de luminaria LED con respecto al total</summary>
            <p>Interpretación: Evalúa el nivel de incorporación de tecnología LED, más eficiente energéticamente que otras luminarias. Se considera “Nulo” cuando la proporción es menor al 50%; “Parcial” entre ≥50% y menor que 100% de luminarias LED; y “Total” cuando la totalidad de la luminaria es LED.</p>
            </details>
        </section>
        <section id="energia-1-5">
            <details>
            <summary>1.5 Proporción de artefactos electrodomésticos y gasodomésticos con etiquetado de eficiencia energética A</summary>
            <p>Interpretación: Evalúa la proporción de equipos domésticos en uso con un valor de eficiencia energética A. Se considera “Nulo” cuando es menor al 50%, “Parcial” cuando es ≥50% y “Total” cuando la totalidad los equipos son de eficiencia A.</p>
            </details>
        </section>
        <section id="energia-1-6">
            <details>
            <summary>1.6 Implementación de al menos tres elementos de mejoras pasivas para eficiencia térmica</summary>
            <p>(Cortinas/protecciones solares, superficies vegetadas exteriores, burletes, aislantes en techos, DVH)
            Interpretación: Evalúa si se aplican soluciones pasivas que mejoran la eficiencia energética de un espacio sin recurrir al consumo activo de energía.</p>
            </details>
        </section>
        <section id="energia-1-7">
            <details>
            <summary>1.7 Existencia de una política interna o plan de transición hacia energías renovables</summary>
            <p>Interpretación: Identifica si el barrio cuenta con una estrategia formal para avanzar hacia el uso de fuentes renovables (solar, eólica, biogás).</p>
            </details>
        </section>
        <section id="energia-1-8">
            <details>
            <summary>1.8 Abastecimiento de energía renovable</summary>
            <p>Interpretación: Identifica si parte del consumo eléctrico del barrio proviene de fuentes renovables, mediante generación propia con paneles solares.</p>
            </details>
        </section>
        <section id="energia-1-9">
            <details>
            <summary>1.9 Existencia de un sistema de energía solar térmica para agua caliente</summary>
            <p>Interpretación: Identifica si se utiliza energía solar térmica para calentar agua en instalaciones comunes, reduciendo el uso de gas o electricidad convencional.</p>
            </details>
        </section>
        </section>

        <section id="agua" className="my-4 guia-interpretacion-section">
        <h2>Agua</h2>
        <section id="agua-2-1">
            <details>
            <summary>2.1 Existencia de medidores de consumo de agua</summary>
            <p>Interpretación: Identifica la existencia de dispositivos (caudalímetros) que permiten medir el agua consumida, y a su vez si el barrio tiene acceso a esos datos.</p>
            </details>
        </section>
        <section id="agua-2-2">
            <details>
            <summary>2.2 Implementación de tecnologías para el cuidado del agua</summary>
            <p>Interpretación: Evalúa la presencia de tecnologías de ahorro del recurso hídrico, como griferías que reducen el caudal, baños con opción de menor descarga.</p>
            </details>
        </section>
        <section id="agua-2-3">
            <details>
            <summary>2.3 Proporción de superficie del barrio con riego aplicado</summary>
            <p>Interpretación: Evalúa el nivel de superficie regada. Se considera “Nulo” cuando no se riega, “Parcial” cuando el riego se realiza en algunos sectores y “Total” cuando el riego se realiza en espacios deportivos y en el césped.</p>
            </details>
        </section>
        <section id="agua-2-4">
            <details>
            <summary>2.4 Existencia de riego automatizado</summary>
            <p>Interpretación: Se considera “Nulo” cuando no hay, “Parcial” cuando el sistema se aplica en algunos espacios y “Total” cuando el sistema está automatizado en todo el espacio regado.</p>
            </details>
        </section>
        <section id="agua-2-5">
            <details>
            <summary>2.5 Riego fuera de horarios de mucho calor</summary>
            <p>Interpretación: Favorece realizar riego en horas de menor temperatura como mañana o noche para evitar que el agua se evapore rápidamente.</p>
            </details>
        </section>
        <section id="agua-2-6">
            <details>
            <summary>2.6 Limpieza fuera de horarios de mucho calor</summary>
            <p>Interpretación: Favorece realizar limpieza en horas de menor temperatura como mañana o noche para evitar que el agua se evapore rápidamente.</p>
            </details>
        </section>
        <section id="agua-2-7">
            <details>
            <summary>2.7 Sistema de reutilización de aguas grises</summary>
            <p>Interpretación: Identifica si se reutiliza parte del agua utilizada en lavamanos, duchas, bañeras y fregaderos (por ejemplo, para descarga de inodoro).</p>
            </details>
        </section>
        <section id="agua-2-8">
            <details>
            <summary>2.8 Recolección de agua pluvial / techos azules</summary>
            <p>Interpretación: Identifica si existen sistemas que capturan y almacenan agua de lluvia para su posterior uso (por ejemplo, para riego).</p>
            </details>
        </section>
        </section>

        <section id="residuos" className="my-4 guia-interpretacion-section">
        <h2>Residuos</h2>
        <section id="residuos-3-1">
            <details>
            <summary>3.1 Monitoreo del peso total de residuos</summary>
            <p>Interpretación: Identifica si se mide el peso de los residuos generados, ya sea de manera interna o terciarizada.</p>
            </details>
        </section>
        <section id="residuos-3-2">
            <details>
            <summary>3.2 Separación y recolección diferenciada</summary>
            <p>Interpretación: Identifica si existe un sistema organizado para separar los residuos y recolectarlos de forma diferenciada en reciclables y no reciclables.</p>
            </details>
        </section>
        <section id="residuos-3-3">
            <details>
            <summary>3.3 Corrientes diferenciadas de reciclables</summary>
            <p>Interpretación: Identifica si se separan los reciclables en diferentes categorías según tipo de material (papel, cartón, plásticos, metales, vidrio).</p>
            </details>
        </section>
        <section id="residuos-3-4">
            <details>
            <summary>3.4 Compostaje de orgánicos</summary>
            <p>Interpretación: Identifica si se realiza compostaje de residuos orgánicos, ya sea en el mismo barrio en composteras o de forma terciarizada.</p>
            </details>
        </section>
        <section id="residuos-3-5">
            <details>
            <summary>3.5 Gestión de residuos especiales de generación universal (pilas, lámparas, AVU, RAEE)</summary>
            <p>Interpretación: Identifica si existe un sistema para gestionar estos residuos, promoviendo su recolección, separación o disposición final responsable.</p>
            </details>
        </section>
        <section id="residuos-3-6">
            <details>
            <summary>3.6 Gestión de residuos de poda</summary>
            <p>Interpretación: Identifica si se realiza una gestión adecuada de los residuos de poda, incluyendo su recolección y disposición final responsable.</p>
            </details>
        </section>
        </section>

        <section id="espacios-verdes" className="my-4 guia-interpretacion-section">
        <h2>Espacios Verdes</h2>
        <section id="espacios-verdes-4-1">
            <details>
            <summary>4.1 Superficie de área verde (m²) por lote</summary>
            <p>Interpretación: Se considera de alto desempeño ambiental la presencia de al menos 30 m² por lote.</p>
            </details>
        </section>
        <section id="espacios-verdes-4-2">
            <details>
            <summary>4.2 Registro de cantidad y especies de arbolado</summary>
            <p>Interpretación: Identifica si se cuenta con un listado actualizado de los árboles existentes y sus especies.</p>
            </details>
        </section>
        <section id="espacios-verdes-4-3">
            <details>
            <summary>4.3 Presencia de especies nativas</summary>
            <p>Interpretación: Evalúa si se prioriza la plantación de especies nativas, diferenciándolas de las ya existentes en el área que pueden no ser nativas.</p>
            </details>
        </section>
        <section id="espacios-verdes-4-4">
            <details>
            <summary>4.4 Poda regular y programada</summary>
            <p>Interpretación: Identifica si se realiza mantenimiento mediante podas planificadas y con frecuencia adecuada.</p>
            </details>
        </section>
        <section id="espacios-verdes-4-5">
            <details>
            <summary>4.5 Reposición sistemática de árboles</summary>
            <p>Interpretación: Identifica si los árboles que se caen o se talan se reemplazan de forma constante y organizada.</p>
            </details>
        </section>
        <section id="espacios-verdes-4-6">
            <details>
            <summary>4.6 Intervención por mal estado fitosanitario</summary>
            <p>Interpretación: Identifica si se actúa frente a árboles enfermos o deteriorados a través de tratamientos.</p>
            </details>
        </section>
        <section id="espacios-verdes-4-7">
            <details>
            <summary>4.7 Trasplante en lugar de tala ante obras</summary>
            <p>Interpretación: Identifica si se prioriza trasladar los árboles en lugar de eliminarlos directamente cuando hay obras o construcciones.</p>
            </details>
        </section>
        <section id="espacios-verdes-4-8">
            <details>
            <summary>4.8 Inventario de talas</summary>
            <p>Interpretación: Verifica si se documentan las talas realizadas, incluyendo motivos, fechas y ubicación.</p>
            </details>
        </section>
        </section>

        <section id="gestion-integral" className="my-4 guia-interpretacion-section">
        <h2>Gestión Integral</h2>
        <section id="gestion-integral-5-1">
            <details>
            <summary>5.1 Responsable o equipo de gestión ambiental</summary>
            <p>Interpretación: Identifica si hay un equipo encargado de planificar y supervisar las acciones ambientales.</p>
            </details>
        </section>
        <section id="gestion-integral-5-2">
            <details>
            <summary>5.2 Capacitaciones ambientales al personal y terceros</summary>
            <p>Interpretación: Identifica si las personas que trabajan allí reciben formación sobre buenas prácticas ambientales.</p>
            </details>
        </section>
        <section id="gestion-integral-5-3">
            <details>
            <summary>5.3 Plan de acción o cronograma</summary>
            <p>Interpretación: Identifica si existen metas, fechas y tareas para las mejoras del desempeño ambiental del barrio.</p>
            </details>
        </section>
        <section id="gestion-integral-5-4">
            <details>
            <summary>5.4 Participación vecinal</summary>
            <p>Interpretación: Identifica si hay canales de participación en los cuales los vecinos pueden proponer ideas o hacer reclamos.</p>
            </details>
        </section>
        <section id="gestion-integral-5-5">
            <details>
            <summary>5.5 Concientización / comunicación ambiental</summary>
            <p>Interpretación: Identifica si se realizan actividades de difusión para informar y educar a los vecinos sobre temas ambientales.</p>
            </details>
        </section>
        <section id="gestion-integral-5-6">
            <details>
            <summary>5.6 Informe ambiental periódico</summary>
            <p>Interpretación: Identifica si se elabora y difunde un informe periódico que resuma el estado y avances ambientales del barrio.</p>
            </details>
        </section>
        </section>

        <section id="recursos" className="my-4 guia-interpretacion-section">
        <h2>Recursos</h2>
        <p>
            <a
            href="https://docs.google.com/document/d/1stbDB9yqd327vpGTCxqrWnXcQOaFN1gK9gnmVa6P5AQ/edit?tab=t.0"
            target="_blank"
            rel="noopener noreferrer"
            >
            Guía de recomendaciones
            </a>
        </p>
        </section>
    </div>
    );
}