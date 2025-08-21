// backend/services/evaluacionService.js
// ==========================
// Mapas 1–3 por indicador (HERRAMIENTA.pdf)
// ==========================
const mapSiNo = (v) => (
    v === 'Sí' ? 3 :
    v === 'No' ? 1 :
    v === 'No aplica' ? 2 :
    0
);
const mapNPT = (v) => (
    v === 'Nulo' ? 1 :
    v === 'Parcial' ? 2 :
    v === 'Total' ? 3 :
    v === 'No aplica' ? 2 :
    0
);
// NPT invertido (Total peor, Nulo mejor) -> Total=1, Parcial=2, Nulo=3
const mapNPTInvertido = (v) => (
    v === 'Total' ? 1 :
    v === 'Parcial' ? 2 :
    v === 'Nulo' ? 3 :
    v === 'No aplica' ? 2 :
    0
);
// Área verde por lote (ev4_1)
const mapAreaVerde = (v) => (v === 'Menos de 20 m²' ? 1 : v === '20-29 m²' ? 2 : v === '30 m² o más' ? 3 : 0);
// r3_3: 0 →1; 1–2 →2; ≥3 →3
const mapCorrientes = (num) => {
    const n = Number(num ?? 0);
    if (n >= 3) return 3;
    if (n >= 1) return 2;
    return 1;
};
/*
Energía ⚡ Mínimo: 3,72 C: ≤ 6,20 B: 6,21 – 8,68 A: ≥ 8,69 (Tramo: 2,48) 
------ 
Agua 💧 Mínimo: 3,69 C: ≤ 6,15 B: 6,16 – 8,60 A: ≥ 8,61 (Tramo: 2,46) 
---------- 
Residuos ♻️ Mínimo: 4,00 C: ≤ 6,67 B: 6,68 – 9,33 A: ≥ 9,34 (Tramo: 2,67) 
-----------------
Espacios Verdes 🌳 Mínimo: 3,63 C: ≤ 6,04 B: 6,05 – 8,46 A: ≥ 8,47 (Tramo: 2,42) 
------------- 
Gestión Integral 📋 Mínimo: 3,83 C: ≤ 6,39 B: 6,40 – 8,94 A: ≥ 8,95 (Tramo: 2,56) 
------------------
*/

// ENERGÍA Mínimo: 3,72 C: ≤ 6,20 B: 6,21 – 8,68 A: ≥ 8,69 (Tramo: 2,48) 
let COEF_E = [5, 3.5, 3.5, 4, 3, 3.5, 4.5, 3.5, 3]; // = 33.5

// AGUA (2.1..2.8) — suma ≈ 29.52 (min 3.69 con n=8)
// Agua Mínimo: 3,69 C: ≤ 6,15 B: 6,16 – 8,60 A: ≥ 8,61 (Tramo: 2,46) 
let COEF_A = [5, 3.5, 3.5, 3.5, 3.5, 3.5, 3.5, 3.5]; // = 29.5

// RESIDUOS (3.1..3.6) — suma = 24.00 (min 4.00 con n=6)
// Residuos ♻️ Mínimo: 4,00 C: ≤ 6,67 B: 6,68 – 9,33 A: ≥ 9,34 (Tramo: 2,67).
let COEF_R = [4.5, 5, 4.5, 3.5, 3.5, 3]; // = 24.00

// ESPACIOS VERDES (4.1..4.8) — suma ≈ 29.04 (min 3.63 con n=8)
// Espacios Verdes Mínimo: 3,63 C: ≤ 6,04 B: 6,05 – 8,46 A: ≥ 8,47 (Tramo: 2,42)
let COEF_EV = [4.5, 3.5, 3.5, 3, 4, 3, 4, 3.5]; // = 29

// GESTIÓN (5.1..5.6) — suma ≈ 23 (min 3.83 con n=6)
// Gestión Integral Mínimo: 3,83 C: ≤ 6,39 B: 6,40 – 8,94 A: ≥ 8,95 (Tramo: 2,56)
let COEF_G = [4.5, 3.5, 4, 3, 4, 4]; // = 23

// Permite inyectar coeficientes desde archivo/DB si quisieras
function setCoeficientes({ energia, agua, residuos, ev, gestion } = {}) {
    if (energia) COEF_E = energia;
    if (agua) COEF_A = agua;
    if (residuos) COEF_R = residuos;
    if (ev) COEF_EV = ev;
    if (gestion) COEF_G = gestion;
}

// ==========================
// Helpers eje con coeficientes (método Excel)
// ==========================
function ejeConCoeficientes(valores13, coefs) {
    // valores13: array de números 1..3 en el mismo orden que coefs
    const n = coefs.length;
    let suma = 0;
    for (let i = 0; i < n; i++) suma += (valores13[i] ?? 0) * coefs[i];
    // Método herramienta: dividir por número de indicadores (NO por Σcoef)
    return suma / n;
}

function rangosABCDesdeCoefs(coefs) {
    const n = coefs.length;
    const sum = coefs.reduce((a, b) => a + b, 0);
    const min = (sum * 1) / n;
    const max = (sum * 3) / n;
    const tramo = (max - min) / 3;
    return {
        min,
        cMax: min + tramo,         // C ≤ cMax
        bMax: min + 2 * tramo,     // B ≤ bMax (y > cMax)
        max,
        tramo
    };
}

function letraPorRangos(p, { cMax, bMax }) {
    if (p <= cMax) return 'C';
    if (p <= bMax) return 'B';
    return 'A';
}

// Total por promedio de letras (A=3, B=2, C=1) con cortes 1.5 / 2.5
const letraAValor = (L) => (L === 'A' ? 3 : L === 'B' ? 2 : 1);
function letraTotalDesdeLetras(letras) {
    const avg = letras.reduce((a, L) => a + letraAValor(L), 0) / letras.length;
    if (avg <= 1.5) return 'C';
    if (avg < 2.5) return 'B';
    return 'A';
}

// ==========================
// Cálculo principal
// ==========================
function calcularResultados(ev) {
    // --- Energía (1.1..1.9 en orden) ---
    const valsE = [
        mapSiNo(ev.e1_1),
        mapSiNo(ev.e1_2),
        mapSiNo(ev.e1_3),
        mapNPT(ev.e1_4),
        mapNPT(ev.e1_5),
        mapSiNo(ev.e1_6),       // Sí/No (no NPT)
        mapSiNo(ev.e1_7),
        mapSiNo(ev.e1_8),
        mapSiNo(ev.e1_9),
    ];
    const rangE = rangosABCDesdeCoefs(COEF_E); // min≈3.72, cMax≈6.20, bMax≈8.68
    ev.puntaje_energia = Number(ejeConCoeficientes(valsE, COEF_E).toFixed(2));
    ev.resultado_energia = letraPorRangos(ev.puntaje_energia, rangE);

    // --- Agua (2.1..2.8) ---
    const valsA = [
        mapSiNo(ev.a2_1),
        mapSiNo(ev.a2_2),
        mapNPTInvertido(ev.a2_3), // invertido
        mapNPT(ev.a2_4),
        mapSiNo(ev.a2_5),
        mapSiNo(ev.a2_6),
        mapSiNo(ev.a2_7),
        mapSiNo(ev.a2_8),
    ];
    const rangA = rangosABCDesdeCoefs(COEF_A); // min≈3.69, cMax≈6.15, bMax≈8.60
    ev.puntaje_agua = Number(ejeConCoeficientes(valsA, COEF_A).toFixed(2));
    ev.resultado_agua = letraPorRangos(ev.puntaje_agua, rangA);

    // --- Residuos (3.1..3.6) ---
    const valsR = [
        mapSiNo(ev.r3_1),
        mapSiNo(ev.r3_2),
        mapCorrientes(ev.r3_3),
        mapSiNo(ev.r3_4),
        mapSiNo(ev.r3_5),
        mapSiNo(ev.r3_6),
    ];
    const rangR = rangosABCDesdeCoefs(COEF_R); // min=4.00, cMax=6.67, bMax=9.33
    ev.puntaje_residuos = Number(ejeConCoeficientes(valsR, COEF_R).toFixed(2));
    ev.resultado_residuos = letraPorRangos(ev.puntaje_residuos, rangR);

    // --- Espacios Verdes (4.1..4.8) ---
    const valsEV = [
        mapAreaVerde(ev.ev4_1),
        mapSiNo(ev.ev4_2),
        mapSiNo(ev.ev4_3),
        mapSiNo(ev.ev4_4),
        mapSiNo(ev.ev4_5),
        mapSiNo(ev.ev4_6),
        mapSiNo(ev.ev4_7),
        mapSiNo(ev.ev4_8),
    ];
    const rangEV = rangosABCDesdeCoefs(COEF_EV); // min≈3.63, cMax≈6.04, bMax≈8.46
    ev.puntaje_espacios_verdes = Number(ejeConCoeficientes(valsEV, COEF_EV).toFixed(2));
    ev.resultado_espacios_verdes = letraPorRangos(ev.puntaje_espacios_verdes, rangEV);

    // --- Gestión (5.1..5.6) ---
    const valsG = [
        mapSiNo(ev.g5_1),
        mapSiNo(ev.g5_2),
        mapSiNo(ev.g5_3),
        mapSiNo(ev.g5_4),
        mapSiNo(ev.g5_5),
        mapSiNo(ev.g5_6),
    ];
    const rangG = rangosABCDesdeCoefs(COEF_G); // min≈3.83, cMax≈6.39, bMax≈8.94
    ev.puntaje_gestion = Number(ejeConCoeficientes(valsG, COEF_G).toFixed(2));
    ev.resultado_gestion = letraPorRangos(ev.puntaje_gestion, rangG);

    // --- Total ---
    // Puntaje numérico (para gráficos): promedio simple de los 5 ejes
    const pNum = (ev.puntaje_energia + ev.puntaje_agua + ev.puntaje_residuos + ev.puntaje_espacios_verdes + ev.puntaje_gestion) / 5;
    ev.puntaje_final = Number(pNum.toFixed(2));

    // Letra total por promedio de letras (A=3, B=2, C=1; cortes 1.5 / 2.5)
    ev.resultado_total = letraTotalDesdeLetras([
        ev.resultado_energia,
        ev.resultado_agua,
        ev.resultado_residuos,
        ev.resultado_espacios_verdes,
        ev.resultado_gestion,
    ]);
}

module.exports = { calcularResultados, setCoeficientes };
