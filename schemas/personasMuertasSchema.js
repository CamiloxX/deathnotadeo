const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const personasMuertasSchema = new Schema({
    Nombre: { type: String, required: true, trim: true, unique: true},
    CausaMuerte: { type: String, required: false, trim: "Ataque al corazón", maxlength: 500 },

    Foto: { type: Buffer, required: false, trim: null, unique: false },
    FechaRegistro: { type: Date, default: Date.now },
    FechaMuerte: { type: Date, default: null },
    Estado: { type: String, default: "Vivo" }
}, { timestamps: true });

// Definir el  modelo
const PersonasMuertas = mongoose.model('PersonasMuertas', personasMuertasSchema);

// Exportar el modelo
module.exports = PersonasMuertas;
