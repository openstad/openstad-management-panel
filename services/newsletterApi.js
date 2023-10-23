const fetch = require('node-fetch');
const apiUrl = process.env.API_URL;
const siteApiKey =  process.env.SITE_API_KEY;

exports.fetchAll = async(siteId) => {

  try {
    let response = await fetch(`${apiUrl}/api/site/${siteId}/newslettersignup`, {
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
