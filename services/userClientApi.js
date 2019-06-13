const rp = require('request-promise');
const apiUrl = process.env.USER_API;
const apiCredentials = {
    client_id:  process.env.USER_API_CLIENT_ID,
    client_secret: process.env.USER_API_CLIENT_SECRET,
}

exports.fetch = (token, clientId) => {
  return rp({
    method: 'GET',
    uri: `${apiUrl}/client/${clientId}`,
    headers: {
        'Accept': 'application/json'
    },
    body: apiCredentials,
    json: true // Automatically parses the JSON string in the response
  })
//  .then(response => response.json());
}

exports.fetchAll = (token) => {
  return rp({
    method: 'GET',
    uri: `${apiUrl}/clients`,
    headers: {
        'Accept': 'application/json'
    },
    body: apiCredentials,
    json: true // Automatically parses the JSON string in the response
  })
//  .then(response => response.json());
};
