require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

const app = express();

app.use(cors());

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,

    contentSecurityPolicy: {
  directives: {

        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.tailwindcss.com",
          "https://cdnjs.cloudflare.com",
          "https://unpkg.com"
        ],

        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com"
        ],

        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com",
          "data:"
        ],

        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https:"
        ],

        connectSrc: [
          "'self'",
          "https:"
        ]
      }
    }
  })
);

app.use(compression());

app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// API
app.use('/api', require('./routes'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('🚀 Servidor iniciado');
  console.log(`🌐 http://localhost:${PORT}`);
});