const fetch = require('node-fetch');
const apiUrl = process.env.USER_API + '/api/admin';

const apiCredentials = {
    client_id:  process.env.USER_API_CLIENT_ID,
    client_secret: process.env.USER_API_CLIENT_SECRET,
}

const encodedCredentials = "Basic " + Buffer.from(apiCredentials.client_id+":"+apiCredentials.client_secret).toString('base64');

exports.fetchAll = async(token) => {

  try {
    let response = await fetch(`${apiUrl}/roles`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': encodedCredentials
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

};
