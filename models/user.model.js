const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    valorVenta: {
      type: Number,
      required: [true, 'El valor de venta es obligatorio'],
      min: [0, 'El valor no puede ser negativo'],
    },
    porcentajeDescuento: {
      type: Number,
      required: [true, 'El porcentaje de descuento es obligatorio'],
      min: [0, 'El porcentaje no puede ser negativo'],
      max: [100, 'El porcentaje no puede superar 100'],
    },
    descuento: {
      type: Number,
    },
    totalFinal: {
      type: Number,
    },
    clasificacion: {
      type: String,
      enum: ['Bajo', 'Medio', 'Alto'],
    },
  },
  {
    timestamps: true,
  }
);

// La logica base del parcial vive en backend para que todos los clientes
// reciban el mismo calculo y no dependan del frontend.
userSchema.pre('save', function (next) {
  this.descuento = this.valorVenta * (this.porcentajeDescuento / 100);
  this.totalFinal = this.valorVenta - this.descuento;

  if (this.porcentajeDescuento <= 10) {
    this.clasificacion = 'Bajo';
  } else if (this.porcentajeDescuento <= 25) {
    this.clasificacion = 'Medio';
  } else {
    this.clasificacion = 'Alto';
  }

  next();
});

module.exports = mongoose.model('User', userSchema);
