const fetch = require('node-fetch');
const apiUrl = process.env.API_URL + '/api';
const siteApiKey =  process.env.SITE_API_KEY;

exports.fetch = async(siteId) => {

  try {
    let response = await fetch(`${apiUrl}/site/${siteId}`, {
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
    return await response.json();
  } catch(err) {
    console.log(err);
  }

}

exports.fetchAll = async() => {

  try {
    let response = await fetch(`${apiUrl}/site`, {
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
    return await response.json();
  } catch(err) {
    console.log(err);
  }

}

exports.fetchAllWithIssues = async(siteId) => {

  try {
    let response = await fetch(`${apiUrl}/site/issues`, {
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
    return await response.json();
  } catch(err) {
    console.log(err);
  }

}

exports.anonymize = async(token, siteId) => {

  try {
    let response = await fetch(`${apiUrl}/site/${siteId}/do-anonymize-all-users`, {
      headers: {
        'Accept': 'application/json',
        "X-Authorization": siteApiKey
      },
      method: 'PUT',
      body: {},
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

exports.delete = async(token, siteId) => {

  try {
    let response = await fetch(`${apiUrl}/site/${siteId}`, {
      headers: {
        'Accept': 'application/json',
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
    let response = await fetch(`${apiUrl}/site/${siteId}`, {
      headers: {
        'Accept': 'application/json',
        "Content-type": "application/json",
        "X-Authorization": siteApiKey
      },
      method: 'PUT',
      body: JSON.stringify(data)
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


exports.create = async(data) => {

  try {
    let response = await fetch(`${apiUrl}/site`, {
      headers: {
        'Accept': 'application/json',
        "Content-type": "application/json",
        "X-Authorization": siteApiKey
      },
      method: 'POST',
      body: JSON.stringify(data)
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
