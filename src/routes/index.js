const router = require('express').Router();

router.get('/', (req, res, next) => {
  res.send("<h1>I'm a public route</h1>");
});

router.use('/', require('./users'));
router.use('/', require('./auth'));
router.use('/', require('./refresh-tokens'));
router.use('/', require('./post'));
router.use('/', require('./profile'));
router.use('/', require('./friend'));

module.exports = router;
