const rp = require('request-promise');
const apiUrl = process.env.API_URL + '/api';
const siteApiKey =  process.env.SITE_API_KEY;

exports.fetch = (siteId) => {
  return rp({
    method: 'GET',
    uri: `${apiUrl}/lock/${siteId}`,
    headers: {
        'Accept': 'application/json',
        "X-Authorization": siteApiKey
    },
    json: true // Automatically parses the JSON string in the response
  });
}

exports.fetchAll = () => {
  return rp({
    method: 'GET',
    uri: `${apiUrl}/lock`,
    headers: {
        'Accept': 'application/json',
        "X-Authorization": siteApiKey
    },
    json: true // Automatically parses the JSON string in the response
  });
}

exports.delete = (siteId) => {

  return rp({
    method: 'DELETE',
    uri: `${apiUrl}/lock/${siteId}`,
    headers: {
        'Accept': 'application/json',
        "X-Authorization": siteApiKey
    },
    json: true // Automatically parses the JSON string in the response
  });
}
