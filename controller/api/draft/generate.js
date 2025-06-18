const { Draft, DraftOrder, DraftPick } = require('../../../models');
const jwt = require('jsonwebtoken');
const router = require('express').Router();

router.post('/:leagueId', (req, res) => {
  try {
    const token = req.headers.authorization;
    const body = req.body;

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (decoded) {

        await Draft.destroy({ where: { leagueId: req.params.leagueId } });

        const draft = await Draft.create({ leagueId: req.params.leagueId, startDate: body.draftDate });
        const draftPlain = draft.get({ plain: true });

        const order = body.draftOrder.map((id, i) => ({ draftId: draftPlain.draftId, teamId: id, pickNumber: (i + 1) }));

        const draftOrder = await DraftOrder.bulkCreate(order);

        const numTeams = order.length;
        const maxRounds = Math.floor(18 / numTeams);
        const picksArray = [];

        for (let r = 0; r < maxRounds; r++) {
          const roundTeams = r % 2 === 0 ? order : [...order].reverse();
          roundTeams.forEach((team, i) => {
            picksArray.push({
              draftId: draftPlain.draftId,
              pickNumber: r * numTeams + i + 1,
              teamId: team.teamId
            });
          });
        }

        const picks = await DraftPick.bulkCreate(picksArray);

        res.json({ status: 'success', data: { draft, draftOrder, picks } });


      } else if (err) {
        throw new Error(err);
      } else {
        throw new Error("JWT error");
      }
    })
  } catch (err) {
    console.log(err);
    res.json({ status: 'fail', err })
  }
})

module.exports = router;