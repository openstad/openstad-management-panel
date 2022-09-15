const fetch = require('node-fetch');
const rp = require('request-promise');
const apiUrl = process.env.USER_API + '/api/admin';
const nestedObjectAssign = require('nested-object-assign');
const httpBuildQuery = require('../utils/httpBuildQuery')

const apiCredentials = {
    client_id:  process.env.USER_API_CLIENT_ID,
    client_secret: process.env.USER_API_CLIENT_SECRET,
}

const encodedCredentials = "Basic " + Buffer.from(apiCredentials.client_id+":"+apiCredentials.client_secret).toString('base64');

exports.fetch = async(clientId, withUserRoles=false, excludingRoles=[]) => {
  const excludingRolesParam = excludingRoles.join(',');

  const response = await fetch(`${apiUrl}/client/${clientId}?withUserRoles=${withUserRoles}&excludingRoles=${excludingRolesParam}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': encodedCredentials
    },
  });
  return await response.json();
}

exports.fetchAll = (params) => {
  const query = params ? httpBuildQuery(params) : '';

  return rp({
    method: 'GET',
    uri: `${apiUrl}/clients?${query}`,
    headers: {
        'Accept': 'application/json'
    },
    body: apiCredentials,
    json: true // Automatically parses the JSON string in the response
  })
//  .then(response => response.json());
};


exports.create = (data) => {
  let body = nestedObjectAssign(data, apiCredentials);

  return rp({
      method: 'POST',
      uri: `${apiUrl}/client`,
      headers: {
          'Accept': 'application/json'
      },
      body: body,
      json: true // Automatically parses the JSON string in the response
  });
}

exports.update = (clientId, data) => {
  return rp({
    method: 'POST',
    uri: `${apiUrl}/client/${clientId}`,
    headers: {
        'Accept': 'application/json',
    },
    body: nestedObjectAssign(data, apiCredentials),
    json: true // Automatically parses the JSON string in the response
  });
}

exports.delete = (clientId) => {
  return rp({
    method: 'POST',
    uri: `${apiUrl}/client/${clientId}/delete`,
    json: true, // Automatically parses the JSON string in the response
    body: apiCredentials,
  });
}
