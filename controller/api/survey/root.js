const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { Survey, Question } = require('../../../models');
const { Op } = require('sequelize');

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
        res.json({status: 'success', data: dbData});
      })
      .catch(err => {
        res.json({status: 'fail', err});
      })
    }

    if(err) {
      res.json({status: 'fail', err});
    }
  })
})

router.get('/:surveyId', (req, res) => {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded && decoded.userType === 'ADMIN') {
      Survey.findOne({
        where: {
          surveyId: req.params.surveyId
        },
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
        res.json({status: 'success', data: dbData});
      })
      .catch(err => {
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
      if(!body.surveyId) {
        Survey.create({episodeId: body.episodeId})
        .then(dbData => {
          const survey = dbData.get({plain: true});
          const questions = body.questions.map(q => {
            return {prompt: q.prompt, type: q.type, points: q.points, answerCount: q.answerCount, surveyId: survey.surveyId}
          })

          Question.bulkCreate(questions)
          .then(dbData => {
            res.json({status: 'success', data: dbData.map(data => data.get({plain: true}))})
          })
        })
      } else {
        const cleanedQuestions = body.questions.map(q => ({
          questionId: isNaN(q.questionId) ? q.questionId : undefined,
          prompt: q.prompt,
          type: q.type,
          points: q.points,
          answerCount: q.answerCount,
          surveyId: body.surveyId 
        }));

        const incomingIds = body.questions
          .filter(q => !isNaN(q.questionId))
          .map(q => q.questionId);

        Question.destroy({
          where: {
            surveyId: body.surveyId,
            ...(incomingIds.length > 0 && {
              quetionId: {
                [Op.notIn]: incomingIds
              }
            })
          }
        })
        .then(() => {
          Question.bulkCreate(cleanedQuestions, {
            updateOnDuplicate: ['prompt', 'type', 'points', 'answerCount']
          })
          .then(dbData => {
            res.json({status: 'success', data: dbData});
          })
          .catch(err => {
            res.json({status: 'fail', err});
          })
        })
        .catch(err => {
          res.json({status: 'fail', err});
        })

      }
    } else {
      res.json({status: 'fail'});
    }
  })
})


router.delete('/:surveyId', (req, res) => {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded && decoded.userType === 'ADMIN') {
      Survey.destroy({
        where: {
          surveyId: req.params.surveyId
        }
      })
      .then(dbData => {
        if(dbData) {
          res.json({status: 'success', dbData});
        } else {
          res.json({status: 'fail', dbData})
        }
      })
      .catch(err => {
        res.json({status: 'fail', err});
      })
    } else {
      res.json({status: 'fail', err});
    }
  })
})

module.exports = router;