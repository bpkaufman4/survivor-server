module.exports = function handlePick({ payload, clientsByLeague }) {
  const { leagueId } = payload;
  const clients = clientsByLeague.get(leagueId);
  if (!clients) return;

  for (const client of clients) {
    if (client.readyState === 1) {
      client.send(JSON.stringify({
        type: 'pick_made',
        payload,
      }));
    }
  }
};