const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { Survey, Question, Player, Tribe, AnswerOption, TeamSurvey } = require('../../../models');
const { Op } = require('sequelize');
const sequelize = require('../../../config/connection');

router.get('/', (req, res) => {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded && decoded.userType === 'ADMIN') {
      Survey.findAll({
        include: ['episode'],
        order: [['episode', 'airDate', 'DESC']],
        attributes: {
          include: [
            [sequelize.literal(`(SELECT COUNT(*) FROM question q WHERE q.surveyId = survey.surveyId)`), 'questionCount'],
            [sequelize.literal(`(SELECT COUNT(*) FROM teamsurvey ts WHERE ts.surveyId = survey.surveyId)`), 'submissionCount']
          ]
        }
      })
      .then(dbData => {
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
          .then(async dbData => {
              // create the question answer options

            const needsAnswerOptions = dbData
              .map(q => q.get({plain: true}));

            const [allPlayers, allTribes] = await Promise.all([
              Player.findAll({
                where: {
                  season: process.env.CURRENT_SEASON
                },
                raw: true
              })
              .then(dbData => {
                return dbData;
              }),
              Tribe.findAll({
                where: {
                  season: process.env.CURRENT_SEASON
                },
                raw: true
              })
              .then(dbData => {
                return dbData;
              })
            ])

            const allAnswerOptions =[];

            needsAnswerOptions.forEach(q => {
              let options;

              console.log(q);

              if(q.type === 'all-players') {
                options = allPlayers.map(p => ({
                  questionId: q.questionId,
                  display: `${p.firstName} ${p.lastName}`,
                  answer: p.playerId
                }))
              } else if(q.type === 'remaining-players') {
                options = allPlayers.filter(p => p.eliminatedId === null).map(p => ({
                  questionId: q.questionId,
                  display: `${p.firstName} ${p.lastName}`,
                  answer: p.playerId
                }))
              } else if (q.type === 'tribes') {
                options = allTribes.map(t => ({
                  questionId: q.questionId,
                  display: t.name,
                  answer: t.tribeId
                }))
              } else {
                options = [];
              }

              allAnswerOptions.push(...options);
            })

            let answerOptions = {};

            if(allAnswerOptions.length > 0) {
              AnswerOption.bulkCreate(allAnswerOptions, {returning: true})
              .then(dbData => dbData.map(d => d.get({plain: true})))
              .then(data => {
                console.log(data);
                res.json({status: 'success', data: answerOptions, dbData: data});
              })
              .catch(err => {
                res.json({status: 'fail', err});
              });
            } else {
              res.json({status: 'success', data: {answerOptions, dbData}})
            }
            
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
          .filter(q => isNaN(q.questionId))
          .map(q => q.questionId);

        Survey.update(
          {
            episodeId: body.episodeId
          },
          {
            where: {
              surveyId: body.surveyId
            }
          }
        ).then(dbData => {
          Question.destroy({
            where: {
              surveyId: body.surveyId,
              ...(incomingIds.length > 0 && {
                questionId: {
                  [Op.notIn]: incomingIds
                }
              })
            }
          })
          .then(() => {
            Question.bulkCreate(cleanedQuestions, {
              updateOnDuplicate: ['prompt', 'type', 'points', 'answerCount'],
              returning: true
            })
            .then(async dbData => {
              // create the question answer options

              const needsAnswerOptions = dbData
                .map(q => q.get({plain: true}))
                .filter(q => !incomingIds.includes(q.questionId));

              const [allPlayers, allTribes] = await Promise.all([
                Player.findAll({
                  where: {
                    season: process.env.CURRENT_SEASON
                  },
                  raw: true
                })
                .then(dbData => {
                  return dbData;
                }),
                Tribe.findAll({
                  where: {
                    season: process.env.CURRENT_SEASON
                  },
                  raw: true
                })
                .then(dbData => {
                  return dbData;
                })
              ])

              const allAnswerOptions =[];

              needsAnswerOptions.forEach(q => {
                let options;
                
                if(q.type === 'all-players') {
                  options = allPlayers.map(p => ({
                    questionId: q.questionId,
                    display: `${p.firstName} ${p.lastName}`,
                    answer: p.playerId
                  }))
                } else if(q.type === 'remaining-players') {
                  options = allPlayers.filter(p => p.eliminatedId === null).map(p => ({
                    questionId: q.questionId,
                    display: `${p.firstName} ${p.lastName}`,
                    answer: p.playerId
                  }))
                } else if (q.type === 'tribes') {
                  options = allTribes.map(t => ({
                    questionId: q.questionId,
                    display: t.name,
                    answer: t.tribeId
                  }))
                } else {
                  options = [];
                }

                allAnswerOptions.push(...options);
              })

              let answerOptions = {};

              if(allAnswerOptions.length > 0) {
                AnswerOption.bulkCreate(allAnswerOptions, {returning: true})
                .then(dbData => dbData.map(d => d.get({plain: true})))
                .then(data => {
                  console.log(data);
                  res.json({status: 'success', data: answerOptions, dbData: data});
                })
                .catch(err => {
                  res.json({status: 'fail', err});
                });
              } else {
                res.json({status: 'success', data: {answerOptions, dbData}})
              }
              
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
      }
    } else {
      res.json({status: 'fail', err});
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