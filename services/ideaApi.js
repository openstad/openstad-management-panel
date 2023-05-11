const fetch = require('node-fetch');
const apiUrl = process.env.API_URL;
const siteApiKey =  process.env.SITE_API_KEY;

exports.fetch = async(token, siteId) => {

  try {
    let response = await fetch(`${apiUrl}/api/site/${siteId}`, {
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
        "X-Authorization": siteApiKey
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

exports.create = async(token, siteId, body) => {

  try {
    let response = await fetch( `${apiUrl}/api/site/${siteId}/idea`, {
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
        "X-Authorization": siteApiKey
      },
      method: 'POST',
      body: JSON.stringify(body),
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

exports.fetchAll = async(token, siteId) => {

  try {
    let response = await fetch( `${apiUrl}/api/site/${siteId}/idea`, {
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
        "X-Authorization": siteApiKey
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

exports.delete = async(token, siteId, ideaId) => {

  try {
    let response = await fetch( apiUrl + `/api/site/${siteId}/idea/${ideaId}`, {
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
        "X-Authorization": siteApiKey
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

exports.update = async(token, siteId, data) => {

  try {
    let response = await fetch(`${apiUrl}/api/site/${siteId}/idea/${data.id}`, {
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
        "X-Authorization": siteApiKey
      },
      method: 'PUT',
      body: JSON.stringify(data),
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
