const router = require('express').Router();

router.get('/', (req, res) => {
  res.json({
    ok: true,
    proyecto: 'Dedicatorias Interactivas',
    estado: 'online'
  });
});

module.exports = router;