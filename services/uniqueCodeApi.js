const fetch = require('node-fetch');
const apiUrl = process.env.USER_API + '/api/admin';
const httpBuildQuery = require('../utils/httpBuildQuery')

const apiCredentials = {
  client_id:  process.env.USER_API_CLIENT_ID,
  client_secret: process.env.USER_API_CLIENT_SECRET,
}

const encodedCredentials = "Basic " + Buffer.from(apiCredentials.client_id+":"+apiCredentials.client_secret).toString('base64');

exports.fetch = async(uniqueCodeId) => {

  try {
    let response = await fetch(`${apiUrl}/unique-code/${uniqueCodeId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': encodedCredentials
      },
    })
    if (!response.ok) {
      console.log(response);
      throw new Error('Fetch failed')
    }
    return await response.json();
  } catch(err) {
    console.log(err);
  }



}

exports.fetchAll = async(params) => {

  const query = httpBuildQuery(params);

  try {
    let response = await fetch(`${apiUrl}/unique-codes?${query}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': encodedCredentials
      },
    })
    if (!response.ok) {
      console.log(response);
      throw new Error('Fetch failed')
    }
    return await response.json();
  } catch(err) {
    console.log(err);
  }



}

exports.create = async(params) => {

  const query = httpBuildQuery(params);

  try {
    let response = await fetch(`${apiUrl}/unique-code?${query}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': encodedCredentials
      },
      body: '{}',
    })
    if (!response.ok) {
      console.log(response);
      throw new Error('Fetch failed')
    }
    return await response.json();
  } catch(err) {
    console.log(err);
  }



}

exports.getGeneratorStatus = async(params) => {

  const query = httpBuildQuery(params);

  try {
    let response = await fetch(`${apiUrl}/unique-code/generator-status?${query}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': encodedCredentials
      },
    })
    if (!response.ok) {
      console.log(response);
      throw new Error('Fetch failed')
    }
    let result =  await response.json();
    return result
  } catch(err) {
    console.log(err);
  }
  


}

exports.reset = async(uniqueCodeId) => {

  try {
    let response = await fetch(`${apiUrl}/unique-code/${uniqueCodeId}/reset`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': encodedCredentials
      },
      body: '{}',
    })
    if (!response.ok) {
      console.log(response);
      throw new Error('Fetch failed')
    }
    return await response.json();
  } catch(err) {
    console.log(err);
  }



}

exports.delete = async(uniqueCodeId) => {

  try {
    let response = await fetch(`${apiUrl}/unique-code/${uniqueCodeId}/delete`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': encodedCredentials
      },
      body: '{}',
    })
    if (!response.ok) {
      console.log(response);
      throw new Error('Fetch failed')
    }
    return await response.json();
  } catch(err) {
    console.log(err);
  }



}
