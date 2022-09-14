const fetch = require('node-fetch');
const apiUrl = process.env.USER_API + '/api/admin';
const nestedObjectAssign = require('nested-object-assign');
const httpBuildQuery = require('../utils/httpBuildQuery');
console.log('apiUrl', apiUrl)

const apiCredentials = {
    client_id: process.env.USER_API_CLIENT_ID,
    client_secret: process.env.USER_API_CLIENT_SECRET,
}

const encodedCredentials = "Basic " + Buffer.from(apiCredentials.client_id+":"+apiCredentials.client_secret).toString('base64');

exports.fetch = async (userId) => {
  const response = await fetch(`${apiUrl}/user/${userId}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': encodedCredentials
    },
  });
  return await response.json();
}

exports.fetchAll = async (params) => {
  const response = await fetch(`${apiUrl}/users?${params ? httpBuildQuery(params) : ''}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': encodedCredentials
    },
  });
  return await response.json();
}

exports.create = (data) => {
  return fetch(`${apiUrl}/user`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(nestedObjectAssign(data, apiCredentials)),
  });
}

exports.update = async (userId, data) => {
  const body = nestedObjectAssign(data, apiCredentials)
  const res = await fetch(`${apiUrl}/user/${userId}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
    });
    return await res.json()
}

exports.delete = (userId, data) => {
  return fetch(`${apiUrl}/user/${userId}/delete`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(nestedObjectAssign(data, apiCredentials)),
  });
}
