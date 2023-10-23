const fetch = require('node-fetch');
const apiUrl = process.env.API_URL + '/api';
const siteApiKey =  process.env.SITE_API_KEY;

exports.fetch = async(siteId) => {

  try {
    let response = await fetch(`${apiUrl}/lock/${siteId}`, {
      headers: {
        'Accept': 'application/json',
        "X-Authorization": siteApiKey,
      },
      method: 'GET',
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

exports.fetchAll = async() => {

  try {
    let response = await fetch(`${apiUrl}/lock`, {
      headers: {
        'Accept': 'application/json',
        "X-Authorization": siteApiKey,
      },
      method: 'GET',
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

exports.delete = async(siteId) => {

  try {
    let response = await fetch(`${apiUrl}/lock/${siteId}`, {
      headers: {
        'Accept': 'application/json',
        "X-Authorization": siteApiKey,
      },
      method: 'DELETE',
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
