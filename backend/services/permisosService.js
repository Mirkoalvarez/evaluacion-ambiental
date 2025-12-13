const { Barrio, BarrioMember, Evaluacion, User } = require('../models');

const isAdmin = (user) => user?.role === 'admin';
const isModerador = (user) => user?.role === 'moderador';

async function obtenerMembresia(barrioId, userId) {
    return BarrioMember.findOne({ where: { barrio_id: barrioId, user_id: userId } });
}

async function puedeVerBarrio(user, barrioId) {
    if (!user) return false;
    if (isAdmin(user) || isModerador(user)) return true;
    const barrio = await Barrio.findByPk(barrioId);
    if (!barrio) return false;
    if (barrio.autor_id === user.id) return true;
    const miembro = await obtenerMembresia(barrioId, user.id);
    return Boolean(miembro);
}

async function puedeEditarBarrio(user, barrioId) {
    if (!user) return false;
    if (isAdmin(user) || isModerador(user)) return true;
    const barrio = await Barrio.findByPk(barrioId);
    if (!barrio) return false;
    return barrio.autor_id === user.id;
}

async function puedeCrearEvaluacion(user, barrioId) {
    return puedeVerBarrio(user, barrioId);
}

async function puedeEditarEvaluacion(user, evaluacion) {
    if (!user) return false;
    if (isAdmin(user) || isModerador(user)) return true;
    const barrio = await Barrio.findByPk(evaluacion.barrio_id);
    if (!barrio) return false;
    if (barrio.autor_id === user.id) return true;
    if (evaluacion.creado_por === user.id) return true;

    const miembro = await obtenerMembresia(evaluacion.barrio_id, user.id);
    if (miembro && miembro.puede_editar_todas) return true;
    return false;
}

async function asegurarModeradorInicial(barrio, autor, moderadorId, transaction) {
    // Autor siempre se agrega como miembro
    await BarrioMember.findOrCreate({
        where: { barrio_id: barrio.id, user_id: autor.id },
        defaults: { puede_editar_todas: true, es_moderador_barrio: autor.role === 'moderador' },
        transaction,
    });

    // Si autor no es moderador global, requiere moderador asignado
    if (autor.role !== 'moderador') {
        if (!moderadorId) {
            throw new Error('Debe asignar un moderador al crear el barrio');
        }
        const mod = await User.findByPk(moderadorId);
        if (!mod || mod.role !== 'moderador') {
            throw new Error('El usuario elegido no es moderador');
        }
        await BarrioMember.findOrCreate({
            where: { barrio_id: barrio.id, user_id: mod.id },
            defaults: { es_moderador_barrio: true },
            transaction,
        });
    }
}

module.exports = {
    isAdmin,
    isModerador,
    puedeVerBarrio,
    puedeEditarBarrio,
    puedeCrearEvaluacion,
    puedeEditarEvaluacion,
    obtenerMembresia,
    asegurarModeradorInicial,
};
