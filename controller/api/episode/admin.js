const { Episode } = require('../../../models');

const router = require('express').Router();

router.get('/', (req, res) => {
  Episode.findAll({
    where: {
      season: process.env.CURRENT_SEASON
    },
    order: [[`airDate`, 'ASC']]
  })
  .then(dbData => {
    return dbData.map(row => row.get({plain: true}));
  })
  .then(data => {
    res.json({status: 'success', data})
  })
  .catch(err => {
    res.json({status: 'fail', err});
  })
})

module.exports = router;