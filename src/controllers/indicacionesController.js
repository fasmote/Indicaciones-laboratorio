const prisma = require('../config/database');

async function listarTodas(req, res, next) {
  try {
    const indicaciones = await prisma.indicacion.findMany({
      where: { activo: true },
      orderBy: [{ tipo: 'asc' }, { orden: 'asc' }]
    });

    res.json({ success: true, data: indicaciones });
  } catch (error) {
    next(error);
  }
}

module.exports = { listarTodas };
