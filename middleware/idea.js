const fetch = require('node-fetch');
const apiUrl = process.env.API_URL;
const siteApiKey =  process.env.SITE_API_KEY;

exports.allForSite = async(req, res, next) => {

  try {
    let response = await fetch(`${apiUrl}/api/site/${req.params.siteId}/idea?includeUser=1&includeVoteCount=1&includeUserVote=1`, {
      headers: {
        'Accept': 'application/json',
        "X-Authorization": siteApiKey
      },
      method: 'GET',
    })
    if (!response.ok) {
      console.log(response);
      throw new Error('Fetch failed')
    }
    let ideas =  await response.json();
    req.ideas = ideas;
    res.locals.ideas = ideas;
    return next();
  } catch(err) {
    return next();
  }

}

exports.oneForSite  = async(req, res, next) => {

  try {
    let response = await fetch(`${apiUrl}/api/site/${req.params.siteId}/idea/${req.params.ideaId}?includeUser=1&includeVoteCount=1&includeUserVote=1`, {
      headers: {
        'Accept': 'application/json',
        "X-Authorization": siteApiKey
      },
      method: 'GET',
    })
    if (!response.ok) {
      console.log(response);
      throw new Error('Fetch failed')
    }
    let idea = await response.json();
    req.idea = idea;
    res.locals.idea = idea;
    return next();
  } catch(err) {
    return next();
  }

}
