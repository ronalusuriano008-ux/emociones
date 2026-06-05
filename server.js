const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sirviendo archivos estáticos desde /public
// Al usar extensions: ['html'], Express buscará index.html automáticamente en las subcarpetas
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

// --- APIS ---

// Leer helper
const readDB = (file) => JSON.parse(fs.readFileSync(path.join(__dirname, 'db', file), 'utf-8'));
const writeDB = (file, data) => fs.writeFileSync(path.join(__dirname, 'db', file), JSON.stringify(data, null, 2));

// Obtener emociones
app.get('/api/emociones', (req, res) => {
    try { res.json(readDB('emociones.json')); } 
    catch (error) { res.status(500).json({ error: 'Error leyendo emociones' }); }
});

// Obtener estadísticas
app.get('/api/estadisticas', (req, res) => {
    try {
        const usuarios = readDB('usuarios.json');
        res.json({
            dedicatorias: 2847563 + Math.floor(Math.random() * 50), // Simula crecimiento en vivo
            usuarios: usuarios.total,
            experiencias: 156789 + Math.floor(Math.random() * 10),
            visualizaciones: 12456892 + Math.floor(Math.random() * 200)
        });
    } catch (error) { res.status(500).json({ error: 'Error leyendo estadísticas' }); }
});

// Crear dedicatoria (Guarda en usuarios.json como historial simple)
app.post('/api/dedicatorias', (req, res) => {
    try {
        const { emocion, nombre, mensaje } = req.body;
        if (!emocion || !mensaje) return res.status(400).json({ error: 'Faltan datos' });

        // Aquí podrías guardar en un archivo dedicatorias.json dedicado
        // Por ahora solo simulamos el éxito
        console.log(`Nueva dedicatoria creada: Emoción: ${emocion}, Nombre: ${nombre}`);
        
        res.status(201).json({ success: true, message: 'Dedicatoria creada con éxito' });
    } catch (error) { res.status(500).json({ error: 'Error guardando dedicatoria' }); }
});

// Fallback para SPA / Rutas no encontradas -> index.html
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`EmotiArt corriendo en http://localhost:${PORT}`);
});