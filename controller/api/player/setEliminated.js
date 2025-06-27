const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { Player } = require('../../../models');

router.post('/:playerId', (req, res) => {
  const token = req.headers.authorization;
  const eliminatedId = req.body.episodeId;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err || !decoded) {
      return res.json({ status: 'fail', message: 'Invalid token' });
    }

    Player.update(
      { eliminatedId },
      { where: { playerId: req.params.playerId } }
    )
      .then(data => {
        res.json({ status: 'success', data });
      })
      .catch(err => {
        console.error(err);
        res.json({ status: 'fail', message: 'Error updating player status' });
      });
  });
});

module.exports = router;