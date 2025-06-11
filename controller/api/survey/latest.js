const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { Survey, Team, Episode, TeamSurvey, AnswerOption, Question, TeamAnswer } = require('../../../models');
const { Op } = require('sequelize');

router.get('/:leagueId', (req, res) => {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded) {
      Team.findOne({
        where: {
          leagueId: req.params.leagueId,
          ownerId: decoded.id
        }
      })
      .then(dbData => dbData.get({plain: true}))
      .then(teamData => {

        const currentDate = new Date();
        currentDate.setHours(currentDate.getHours() - 2);

        Episode.findOne({
          where: {
            airDate: {
              [Op.gt]: currentDate
            }
          },
          include: [
            {
              model: Survey,
              as: 'survey',
              include: [
                {
                  model: Question,
                  as: 'questions',
                  include: [
                    {
                      model: AnswerOption,
                      as: 'answerOptions'
                    }
                  ]
                },
                {
                  model: Episode,
                  as: 'episode'
                }
              ]
            }
          ],
          order: [['airDate', 'ASC']]
        })
        .then(dbData => dbData.get({plain: true}))
        .then(episodeData => {
          console.log(episodeData);
          
          if(episodeData.survey) {
            TeamSurvey.findOne({
              where: {
                teamId: teamData.teamId,
                surveyId: episodeData.survey.surveyId
              },
              include: 'teamAnswers'
            })
            .then(teamSurveyData => {
              const lockDown = episodeData.airDate < new Date();
              res.json({status: 'success', data: {teamSurvey: teamSurveyData, survey: episodeData.survey, lockDown}});
            })
            .catch(err => {
              console.log(err);
              res.json({status: 'fail', err});
            })
          } else {
            res.json({status: 'success', data: {teamSurvey: null, survey: null, lockDown: false}});
          }
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
      res.json({status: 'fail', err: 'Error verifying token'});
    }
  })
})

module.exports = router;