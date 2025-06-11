const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { EpisodeStatistic } = require('../../../models');

router.get('/:playerId', (req, res) => {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded) {
      EpisodeStatistic.findAll({
        where: {
          playerId: req.params.playerId
        },
        include: ['episode', 'statistic']
      })
      .then(dbData => dbData.map(episode => episode.get({plain: true})))
      .then(data => {
        let episodes = [];
        let episodesJSON = {};

        data.forEach(s => {
          if(!episodesJSON[s.episodeId]) {
            episodesJSON[s.episodeId] = {
              episodeId: s.episodeId,
              episodeScore: 0,
              scores: [],
              title: s.episode.title,
              airDate: s.episode.airDate
            }
          }

          episodesJSON[s.episodeId].scores.push(s);
          episodesJSON[s.episodeId].episodeScore += s.points;
        })

        for(const key in episodesJSON) {
          episodes.push(episodesJSON[key]);
        }

        res.json({status: 'success', data: episodes})
      })
      .catch(err => {
        res.json({status: 'fail', err});
      })
    } else if(err) {
      res.json({status: 'fail', err});
    } else {
      res.json({status: 'fail', err: 'Something went wrong'});
    }
  })
})

module.exports = router;