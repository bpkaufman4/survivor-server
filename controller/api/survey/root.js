const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { Survey, Question } = require('../../../models');

router.get('/', (req, res) => {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded && decoded.userType === 'ADMIN') {
      Survey.findAll({
        include: [
          'episode',
          {
            model: Question,
            as: 'questions',
            include: ['answerOptions']
          }
        ]
      })
      .then(dbData => {
        console.log(dbData);
        res.json({status: 'success', data: dbData});
      })
      .catch(err => {
        console.log(err);
        res.json({status: 'fail', err});
      })
    }

    if(err) {
      res.json({status: 'fail', err});
    }
  })
})

router.post('/', (req, res) => {
  const token = req.headers.authorization;
  const body = req.body;
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded && decoded.userType === 'ADMIN') {
      console.log(body);
      if(!body.surveyId) {
        Survey.create({episodeId: body.episodeId})
        .then(dbData => {
          const survey = dbData.get({plain: true});
          const questions = body.questions.map(q => {
            return {prompt: q.prompt, type: q.type, points: q.points, answerCount: q.answerCount, surveyId: survey.surveyId}
          })

          Question.bulkCreate(questions)
          .then(dbData => {
            console.log(dbData);
          })
        })
      }
    } else {
      res.json({status: 'fail'});
    }
  })
})

module.exports = router;