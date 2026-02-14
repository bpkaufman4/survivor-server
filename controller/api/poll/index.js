const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { Poll, PollQuestion, PollOption, PollVote, User } = require('../../../models');

// Get active poll(s) with questions, options, and current user's vote
router.get('/', (req, res) => {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err || !decoded) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const polls = await Poll.findAll({
        where: { isActive: true },
        include: [
          {
            model: PollQuestion,
            as: 'questions',
            include: [
              {
                model: PollOption,
                as: 'options',
                order: [['order', 'ASC']]
              },
              {
                model: PollVote,
                as: 'votes',
                required: false,
                where: { userId: decoded.id }
              }
            ],
            order: [['order', 'ASC']]
          }
        ],
        order: [['createdAt', 'DESC'], [{ model: PollQuestion, as: 'questions' }, 'order', 'ASC']]
      });

      // Filter out polls the user has already voted in (if that logic is desired server-side)
      // The user requested "hide polls that users have voted in". 
      // We can do this by checking if any question has user votes.
      const plainPolls = polls.map(p => p.get({ plain: true }));
      let activePolls = plainPolls;

      if (req.query.isAdmin !== 'true') {
        activePolls = plainPolls.filter(poll => {
          // If the poll has questions, check if any question has votes from this user.
          // Since we included `PollVote` with `where: { userId: decoded.id }`,
          // if `q.votes` is not empty, it means the user voted.
          const hasVoted = poll.questions.some(q => q.votes && q.votes.length > 0);
          return !hasVoted;
        });
      }

      res.status(200).json(activePolls);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  });
});

// Admin creates a new poll
router.post('/', (req, res) => {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err || !decoded) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Only admins
    if (decoded.userType !== 'ADMIN') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const newPoll = await Poll.create({
        title: req.body.title,
        description: req.body.description,
        createdBy: decoded.id
      });

      if (req.body.questions && req.body.questions.length > 0) {
        for (let i = 0; i < req.body.questions.length; i++) {
          const q = req.body.questions[i];
          const newQuestion = await PollQuestion.create({
            pollId: newPoll.pollId,
            text: q.text,
            questionType: q.questionType,
            order: i
          });

          if (q.options && q.options.length > 0) {
            for (let j = 0; j < q.options.length; j++) {
              const opt = q.options[j];
              await PollOption.create({
                pollQuestionId: newQuestion.pollQuestionId,
                text: opt.text,
                order: j
              });
            }
          }
        }
      }

      // Fetch the complete poll to return
      const createdPoll = await Poll.findByPk(newPoll.pollId, {
        include: [
          {
            model: PollQuestion,
            as: 'questions',
            include: [
              {
                model: PollOption,
                as: 'options'
              }
            ]
          }
        ]
      });

      res.status(200).json(createdPoll);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  });
});

// Vote on a poll question
router.post('/vote', (req, res) => {
  // Expected body:
  // {
  //   pollId: "uuid",
  //   votes: [
  //      { pollQuestionId: "uuid", pollOptionId: "uuid" }
  //   ]
  // }
  // Or for single question vote?
  // Let's assume the user submits votes for the whole poll or parts of it.
  // The requirement says "each user should only be allowed one vote".
  // This usually means one vote per question or one submission per poll.
  // Assuming one vote per question for now.

  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err || !decoded) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const userId = decoded.id;
      const { pollId, votes } = req.body;

      if (!votes || !Array.isArray(votes)) {
        return res.status(400).json({ message: 'Invalid votes format' });
      }

      // Check if poll is active
      const poll = await Poll.findOne({ where: { pollId, isActive: true } });
      if (!poll) {
        return res.status(404).json({ message: 'Poll not found or inactive' });
      }

      // Process votes
      // Better approach: Group votes by question.
      const votesByQuestion = {};
      for (const vote of votes) {
        if (!votesByQuestion[vote.pollQuestionId]) {
          votesByQuestion[vote.pollQuestionId] = [];
        }
        votesByQuestion[vote.pollQuestionId].push(vote.pollOptionId);
      }

      for (const qId in votesByQuestion) {
        const optionIds = votesByQuestion[qId];

        // Clear existing votes for this question by this user
        await PollVote.destroy({
          where: {
            pollId,
            pollQuestionId: qId,
            userId
          }
        });

        // Insert new votes
        for (const optId of optionIds) {
          await PollVote.create({
            pollId,
            pollQuestionId: qId,
            pollOptionId: optId,
            userId
          });
        }
      }

      res.status(200).json({ message: 'Vote submitted' });

    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  });
});

// Delete poll
router.delete('/:pollId', (req, res) => {
  const token = req.headers.authorization;
  const pollId = req.params.pollId;

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err || !decoded) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Only admins
    if (decoded.userType !== 'ADMIN') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      // First delete associated votes
      await PollVote.destroy({ where: { pollId } });
      
      // Delete options
      // Actually, if we use cascade delete in database or Sequelize association 'onDelete: cascade', 
      // we might just need to delete the Poll.
      // Assuming manual cleanup or reliable cascading:
      
      // Let's rely on cascading or clean up manually if needed. 
      // Safest to just try destroying the Poll if configured correctly.
      // But typically Sequelize needs explicit include/cascade or database level FK constraints.
      
      // For now, let's just attempt to destroy the poll.
      await Poll.destroy({ where: { pollId } });

      res.json({ message: 'Poll deleted' });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  });
});

// Get poll results (Admin only)
router.get('/:pollId/results', (req, res) => {
  const token = req.headers.authorization;
  const pollId = req.params.pollId;

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err || !decoded) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (decoded.userType !== 'ADMIN') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const poll = await Poll.findByPk(pollId, {
        include: [
          {
            model: PollQuestion,
            as: 'questions',
            include: [
              {
                model: PollOption,
                as: 'options',
                include: [
                  {
                    model: PollVote,
                    as: 'votes',
                    include: [
                      {
                        model: User,
                        attributes: ['username', 'firstName', 'lastName']
                      }
                    ]
                  }
                ],
                order: [['order', 'ASC']]
              }
            ],
            order: [['order', 'ASC']]
          }
        ],
        order: [['createdAt', 'DESC'], [{ model: PollQuestion, as: 'questions' }, 'order', 'ASC']]
      });

      if (!poll) {
        return res.status(404).json({ message: 'Poll not found' });
      }

      // Structure data for easy cumulative display
      // The frontend can handle most of calculation, but let's ensure we send all votes.
      res.json(poll);

    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  });
});

module.exports = router;
