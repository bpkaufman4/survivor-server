const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { TeamSurvey, Team, TeamAnswer } = require('../../../models');

router.post('/', (req, res) => {
  const token = req.headers.authorization;
  const { leagueId, surveyId, questions, teamSurveyId } = req.body;
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded) {
      Team.findOne({
        where: {
          leagueId,
          ownerId: decoded.id
        }
      })
      .then(async teamDbData => {
        const { teamId } = teamDbData.get({plain: true});

        let newTeamSurveyId = teamSurveyId;

        if(!teamSurveyId) {
          newTeamSurveyId = await TeamSurvey.create({
            teamId,
            surveyId
          })
          .then(teamSurveyCreate => teamSurveyCreate.get({ plain: true }))
          .then(teamSurveyCreateData => teamSurveyCreateData.teamSurveyId)
          .catch(err => {
            console.log(err);
            throw err;
          });
        }

        await TeamAnswer.destroy({where: {teamSurveyId: newTeamSurveyId}})
        .catch(err => {
          console.log(err);
          throw err;
        })

        let teamAnswers = [];

        questions.forEach(q => {
          if(q.answers) {
            q.answers.forEach(a => {
              teamAnswers.push({
                teamSurveyId: newTeamSurveyId,
                questionId: q.questionId,
                answerOptionId: a
              })
            })
          }
        })

        const teamAnswerCreate = await TeamAnswer.bulkCreate(teamAnswers)
        .catch(err => {
          console.log(err);
          throw err;
        })

        return teamAnswerCreate;
      })
      .then(reply => {
        res.json({status: 'success', data: reply});
      })
      .catch(err => {
        console.log(err);
        res.json({status: 'fail', err});
      })
    } else {
      console.log(err);
      res.json({status: 'fail', err})
    }
  })
})

module.exports = router;