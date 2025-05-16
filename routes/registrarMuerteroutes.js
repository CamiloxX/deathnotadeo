const express = require('express');
const router = express.Router();
const bodyparser = require('body-parser');
const PersonasMuertas = require('../schemas/personasMuertasSchema');
const multer = require('multer');

router.use(bodyparser.urlencoded({ extended: false }));

// Configuración de multer con filtro de tipo de archivo
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({ storage, fileFilter });

router.get("/", async (req, res) => {
    try {
        const personasMuertas = await PersonasMuertas.find({});
        const successMessage = req.app.locals.successMessage || null;
        req.app.locals.successMessage = null;
        res.status(200).render("registrarMuerte", { personasMuertas, successMessage });
    } catch (err) {
        console.error("Error al obtener los datos:", err);
        res.status(500).send("Error al cargar la página");
    }
});

router.post("/", upload.single('Foto'), async (req, res) => {
    const { Nombre, CausaMuerte } = req.body;
    const Foto = req.file ? req.file.buffer : null;
    const payload = req.body;

    console.log("Datos recibidos:", { Nombre, CausaMuerte, Foto });

    if (!req.file) {
        payload.errorMessage = "Solo se permiten archivos de imagen válidos (JPEG, PNG).";
        return res.status(200).render("registrarMuerte", payload);
    }

    if (!Nombre || Nombre.trim() === "") {
        payload.errorMessage = "Asegúrate de que el campo 'Nombre' tenga un valor válido.";
        return res.status(200).render("registrarMuerte", payload);
    }

    try {
        const existingPerson = await PersonasMuertas.findOne({ Nombre: Nombre });

        if (existingPerson) {
            payload.errorMessage = "El nombre ya está registrado.";
            return res.status(200).render("registrarMuerte", payload);
        }

        const estadoInicial = (Nombre && CausaMuerte && Foto) ? "Pendiente" : "Vivo";

        const data = {
            Nombre: Nombre.trim(),
            CausaMuerte: CausaMuerte && CausaMuerte.trim() !== "" ? CausaMuerte.trim() : "Ataque al corazón",
            Foto: Foto,
            Estado: estadoInicial
        };

        const nuevaPersona = await PersonasMuertas.create(data);

        if (estadoInicial === "Pendiente") {
            setTimeout(async () => {
                try {
                    await PersonasMuertas.findByIdAndUpdate(nuevaPersona._id, {
                        Estado: "Muerto",
                        FechaMuerte: new Date()
                    });
                    console.log(`Estado actualizado a "Muerto" para: ${nuevaPersona.Nombre}`);
                    req.app.locals.successMessage = `Estado actualizado a "Muerto" para: ${nuevaPersona.Nombre}`;
                } catch (err) {
                    console.error("Error al actualizar el estado a 'Muerto':", err);
                }
            }, 40000); // 40 segundos
        }

        return res.redirect("/");
    } catch (err) {
        console.error(err);
        payload.errorMessage = "Algo salió mal.";
        return res.status(200).render("registrarMuerte", payload);
    }
});

module.exports = router;
