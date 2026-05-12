const express = require('express');
const router = express.Router();
const User = require('../models/user.model');

// GET /api/sales - Obtener todas las ventas + resumen
router.get('/', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    // Este resumen analitico tambien vive en backend para entregar
    // comparaciones ya consistentes a cualquier consumidor de la API.
    const totalBruto = users.reduce((sum, u) => sum + u.valorVenta, 0);
    const totalDescuentos = users.reduce((sum, u) => sum + u.descuento, 0);
    const totalNeto = users.reduce((sum, u) => sum + u.totalFinal, 0);

    const mayorDescuento = users.length
      ? users.reduce((max, u) =>
          u.descuento > max.descuento ? u : max
        , users[0])
      : null;

    res.json({
      ok: true,
      sales: users,
      users,
      resumen: {
        totalBruto,
        totalDescuentos,
        totalNeto,
        mayorDescuento,
        cantidad: users.length,
      },
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

// GET /api/sales/:id - Obtener una venta por ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ ok: false, message: 'Registro no encontrado' });
    res.json({ ok: true, sale: user, user });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

// POST /api/sales - Crear nueva venta
router.post('/', async (req, res) => {
  try {
    const { valorVenta, porcentajeDescuento } = req.body;
    const user = new User({ valorVenta, porcentajeDescuento });
    await user.save();
    res.status(201).json({ ok: true, sale: user, user });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
});

// PUT /api/sales/:id - Actualizar una venta
router.put('/:id', async (req, res) => {
  try {
    const { valorVenta, porcentajeDescuento } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ ok: false, message: 'Registro no encontrado' });

    user.valorVenta = valorVenta ?? user.valorVenta;
    user.porcentajeDescuento = porcentajeDescuento ?? user.porcentajeDescuento;
    await user.save(); // dispara el pre-save hook

    res.json({ ok: true, sale: user, user });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
});

// DELETE /api/sales/:id - Eliminar una venta
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ ok: false, message: 'Registro no encontrado' });
    res.json({ ok: true, message: 'Registro eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

// DELETE /api/sales - Eliminar todos
router.delete('/', async (req, res) => {
  try {
    await User.deleteMany({});
    res.json({ ok: true, message: 'Todos los registros eliminados' });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

module.exports = router;
