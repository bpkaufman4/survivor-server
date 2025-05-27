const router = require('express').Router();

router.get('/', (req, res) => {
  console.log(req.params.id);
  res.json({status: 'success', message: req.params.id});
})