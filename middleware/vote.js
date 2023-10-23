const fetch             = require('node-fetch');
const apiUrl            = process.env.API_URL;
const cache             = require('../services/cache').cache;
const cacheLifespan     = 10*60;   // set lifespan of 10 minutes;

exports.allForSite = async (req, res, next) => {

  let voteKey = 'votesForSite' + req.params.siteId;
  let votesForSite = cache.get(voteKey);

  if (votesForSite) {
    req.votes = votesForSite;
    res.locals.votes = votesForSite;
    next();
  } else {

    try {
      let response = await fetch(`${apiUrl}/api/site/${req.params.siteId}/vote`, {
        headers: {
          "X-Authorization": process.env.SITE_API_KEY,
        },
        method: 'GET',
      })
      if (!response.ok) {
        console.log(response);
        throw new Error('Fetch failed')
      }

      let votes = await response.json();

      const allVotes = votes;
      const userVotedCount = votes;
      req.votes = allVotes;
      res.locals.votes = allVotes;
      cache.set(voteKey, allVotes, { life: cacheLifespan });
      return next();

    } catch(err) {
      console.log(err);
      return next(err)
    }
  }

}
