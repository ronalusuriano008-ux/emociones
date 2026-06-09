const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────
// MIDDLEWARES
// ─────────────────────────────────────────

app.use(cors());

app.use(express.json({
    limit: '50mb'
}));

app.use(express.urlencoded({
    extended: true,
    limit: '50mb'
}));

// ─────────────────────────────────────────
// ARCHIVOS ESTÁTICOS
// ─────────────────────────────────────────

// Sitio principal
app.use(
    express.static(
        path.join(__dirname, 'public'),
        { extensions: ['html'] }
    )
);

// Módulos propios reutilizables
app.use(
    '/modulos',
    express.static(
        path.join(__dirname, 'modulos')
    )
);

// Three.js desde node_modules
app.use(
    '/three',
    express.static(
        path.join(
            __dirname,
            'node_modules',
            'three',
            'build'
        )
    )
);

// Ejemplos de Three
app.use(
    '/three-examples',
    express.static(
        path.join(
            __dirname,
            'node_modules',
            'three',
            'examples',
            'jsm'
        )
    )
);

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

function readDB(file) {
    return JSON.parse(
        fs.readFileSync(
            path.join(__dirname, 'db', file),
            'utf8'
        )
    );
}

function writeDB(file, data) {
    fs.writeFileSync(
        path.join(__dirname, 'db', file),
        JSON.stringify(data, null, 2)
    );
}

// ─────────────────────────────────────────
// API
// ─────────────────────────────────────────

app.get('/api/emociones', (req, res) => {

    try {

        res.json(
            readDB('emociones.json')
        );

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: 'Error leyendo emociones'
        });

    }

});

app.get('/api/estadisticas', (req, res) => {

    try {

        const usuarios =
            readDB('usuarios.json');

        res.json({
            dedicatorias:
                2847563 +
                Math.floor(Math.random() * 50),

            usuarios:
                usuarios.total,

            experiencias:
                156789 +
                Math.floor(Math.random() * 10),

            visualizaciones:
                12456892 +
                Math.floor(Math.random() * 200)
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: 'Error leyendo estadísticas'
        });

    }

});

app.post('/api/dedicatorias', (req, res) => {

    try {

        const {
            emocion,
            nombre,
            mensaje
        } = req.body;

        if (!emocion || !mensaje) {

            return res.status(400).json({
                error: 'Faltan datos'
            });

        }

        console.log(
            'Nueva dedicatoria:',
            emocion,
            nombre
        );

        res.status(201).json({
            success: true
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: 'Error guardando dedicatoria'
        });

    }

});

// ─────────────────────────────────────────
// 404
// ─────────────────────────────────────────

app.use((req, res) => {

    res.status(404).sendFile(
        path.join(
            __dirname,
            'public',
            'index.html'
        )
    );

});

// ─────────────────────────────────────────
// START
// ─────────────────────────────────────────

app.listen(PORT, () => {

    console.log('');
    console.log('════════════════════════════');
    console.log(`Servidor: http://localhost:${PORT}`);
    console.log(`ThreeJS:  http://localhost:${PORT}/three/three.module.js`);
    console.log(`Modulos:  http://localhost:${PORT}/modulos`);
    console.log('════════════════════════════');
    console.log('');

});