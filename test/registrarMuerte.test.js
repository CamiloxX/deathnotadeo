const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

// Importa la ruta
const registrarMuerteRoutes = require('../routes/registrarMuerteroutes');

// Mock del modelo PersonasMuertas
jest.mock('../schemas/personasMuertasSchema', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn()
}));

const PersonasMuertas = require('../schemas/personasMuertasSchema');

// Configuración del servidor Express para pruebas
const app = express();
app.set("view engine", "pug"); // Simulación
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'test', resave: false, saveUninitialized: false }));
app.use('/', registrarMuerteRoutes);

// Simula .render para pruebas sin vistas reales
app.response.render = function(view, options) {
  this.status(200).json({ rendered: view, ...options });
};

// Tests
describe('POST /registrarMuerte', () => {

  test('debe mostrar error si el nombre ya existe', async () => {
    PersonasMuertas.findOne.mockResolvedValue({ Nombre: 'Goku' });

    const res = await request(app)
      .post('/')
      .field('Nombre','Goku')
      .field('CausaMuerte', 'Causa')
      .attach('Foto', Buffer.from('fake image'), 'foto.jpg');

    expect(res.statusCode).toBe(200);
    expect(res.body.rendered).toBe('registrarMuerte');
    expect(res.body.errorMessage).toBe('El nombre ya está registrado.');
  });

test('debe rechazar archivo que no sea imagen', async () => {
  const res = await request(app)
    .post('/')
    .field('Nombre', 'Pedro')
    .field('CausaMuerte', 'Causa')
    .attach('Foto', Buffer.from('fake content'), 'documento.pdf');

  expect(res.statusCode).toBe(200);
  expect(res.body.rendered).toBe('registrarMuerte');
  expect(res.body.errorMessage).toBe("Solo se permiten archivos de imagen válidos (JPEG, PNG).");
  // O puedes usar esto si prefieres regex:
  // expect(res.body.errorMessage).toMatch(/archivos de imagen válidos/i);
});

test('debe mostrar error si el nombre está vacío', async () => {
  const res = await request(app)
    .post('/')
    .field('Nombre', '')
    .field('CausaMuerte', 'Causa')
    .attach('Foto', Buffer.from('fake image'), 'foto.jpg');

  expect(res.statusCode).toBe(200);
  expect(res.body.rendered).toBe('registrarMuerte');
  expect(res.body.errorMessage).toBe("Asegúrate de que el campo 'Nombre' tenga un valor válido.");
});
test('debe usar causa por defecto si no se proporciona', async () => {
  PersonasMuertas.findOne.mockResolvedValue(null);
  PersonasMuertas.create.mockResolvedValue({ _id: '123', Nombre: 'Ana' });

  const res = await request(app)
    .post('/')
    .field('Nombre', 'Ana')
    .field('CausaMuerte', '')
    .attach('Foto', Buffer.from('fake image'), 'foto.jpg');

  expect(PersonasMuertas.create).toHaveBeenCalledWith(
    expect.objectContaining({
      CausaMuerte: 'Ataque al corazón'
    })
  );
});
test('debe asignar estado "Vivo" si no se sube imagen', async () => {
  PersonasMuertas.findOne.mockResolvedValue(null);
  PersonasMuertas.create.mockResolvedValue({ _id: '456', Nombre: 'Carlos' });

  await request(app)
    .post('/')
    .field('Nombre', 'Carlos')
    .field('CausaMuerte', 'Natural');

  expect(PersonasMuertas.create).toHaveBeenCalledWith(
    expect.objectContaining({
      Estado: 'Vivo'
    })
  );
});


});
