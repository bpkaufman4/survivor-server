const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { Team, Survey, TeamSurvey, TeamAnswer, AnswerOption, Episode, Question } = require('../../../models');
const { Op } = require('sequelize');

router.get('/:leagueId', (req, res) => {
  const token = req.headers.authorization;
  const leagueId = req.params.leagueId;

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if(decoded) {
      const team = await Team.findOne({
        where: {
          leagueId,
          ownerId: decoded.id
        }
      });

      const teamData = team.get({plain: true});

      const currentDate = new Date();

      const surveys = await Survey.findAll({
        order: [['episode', 'airDate', 'DESC']],
        include: [
          {
            model: Question,
            as: 'questions',
            include: [
              {
                model: TeamAnswer,
                as: 'teamAnswers',
                include: [
                  'answerOption',
                  {
                    model: TeamSurvey,
                    as: 'teamSurvey',
                    where: {
                      teamId: teamData.teamId
                    }
                  }
                ]
              },
              'answerOptions'
            ]
          },
          {
            model: Episode,
            as: 'episode',
            where: {
              airDate: {
                [Op.lt]: currentDate,
              },
              season: process.env.CURRENT_SEASON
            }
          }
        ]
      })
      const data = surveys.map(survey => {
        const plainSurvey = survey.get({ plain: true });

        let totalPoints = 0;

        plainSurvey.questions.forEach(question => {
          question.teamAnswers.forEach(answer => {
            if (answer.answerOption?.correct) {
              totalPoints += question.points || 0;
            }
          });
        });

        return {
          ...plainSurvey,
          totalPointsAwarded: totalPoints
        };
      });

      res.json({status: 'success', data});
    }
  })
})

module.exports = router;