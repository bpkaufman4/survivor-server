const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { AnswerOption, Question, Survey } = require('../../../models');
const { Op } = require('sequelize');

router.post('/:surveyId', (req, res) => {

  const token = req.headers.authorization;
  const body = req.body;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded) {
      AnswerOption.findAll({
        include: {
          model: Question,
          as: 'question',
          where: { surveyId: req.params.surveyId },
          attributes: []
        }
      })
      .then(dbAnswerOptionData => dbAnswerOptionData.map(a => a.get({plain: true})))
      .then(answerOptionData => {
        
        const answerOptionIds = answerOptionData.map(a => a.questionOptionId);

        AnswerOption.update({ correct: false }, {
          where: {
            questionOptionId: {
              [Op.in]: answerOptionIds
            }
          }
        })
        .then(reply => {
          AnswerOption.update({ correct: true }, {
            where: {
              questionOptionId: {
                [Op.in]: body.correctAnswers
              }
            }
          })
          .then(reply => {
            Survey.update({
              graded: true
            }, {
              where: {
                surveyId: req.params.surveyId
              }
            })
            .then(reply => {
              res.json({status: 'success', data: reply});
            })
            .catch(err => {
              res.json({status: 'fail', err});
            })
          })
          .catch(err => {
            res.json({status: 'fail', err});
          })
        })
        .catch(err => {
          res.json({status: 'fail', err});
        })
      })
      .catch(err => {
        res.json({status: 'fail', err});
      })
    } else if(err) {
      res.json({status: 'fail', err});
    } else {
      res.json({status: 'fail', message: 'Decoding error'});
    }
  })

})

module.exports = router;