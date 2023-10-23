const fetch = require('node-fetch');
const apiUrl = process.env.API_URL;
const siteApiKey =  process.env.SITE_API_KEY;

exports.fetchAll = async(siteId) => {

  try {
    let response = await fetch(`${apiUrl}/api/site/${siteId}/choicesguide`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        "X-Authorization": siteApiKey
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

exports.fetch = async(siteId, choicesGuideId) => {

  try {
    let response = await fetch(`${apiUrl}/api/site/${siteId}/choicesguide/${choicesGuideId}?includeChoices=1&includeQuestions=1`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        "X-Authorization": siteApiKey
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

exports.create = async(siteId, json) => {

  let promises = [];

  let choices = json.choices || [];
  delete json.choices;
  let questiongroups = json.questiongroups || [];
  delete json.questiongroups;
  delete json.id;
  json.siteId = siteId;

  let result;
  try {

    let response = await fetch(`${apiUrl}/api/site/${siteId}/choicesguide`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        "X-Authorization": siteApiKey
      },
      body: JSON.stringify(json, null, 2),
    })
    if (!response.ok) {
      console.log(response);
      throw new Error('Fetch failed')
    }

    result =  await response.json();
    let choicesGuideId = result.id

    for (let choice of choices) {

      delete choice.id;
      choice.choicesGuideId = choicesGuideId;

      let response = await fetch(`${apiUrl}/api/site/${siteId}/choicesguide/${choicesGuideId}/choice`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          "X-Authorization": siteApiKey
        },
        body: JSON.stringify(choice, null, 2),
      })
      if (!response.ok) {
        console.log(response);
        throw new Error('Fetch failed')
      }

    }

    for (let questiongroup of questiongroups) {

      let choices = questiongroup.choices || [];
      delete questiongroup.choices;
      let questions = questiongroup.questions || [];
      delete questiongroup.questions;
      questiongroup.choicesGuideId = choicesGuideId;

      let response = await fetch(`${apiUrl}/api/site/${siteId}/choicesguide/${choicesGuideId}/questiongroup`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          "X-Authorization": siteApiKey
        },
        body: JSON.stringify(questiongroup, null, 2),
      })
      if (!response.ok) {
        console.log(response);
        throw new Error('Fetch failed')
      }

      result =  await response.json();
      let questionGroupId = result.id

      for (let choice of choices) {

        delete choice.id;
        choice.questionGroupId = questionGroupId;

        let response = await fetch(`${apiUrl}/api/site/${siteId}/choicesguide/${choicesGuideId}/questiongroup/${questionGroupId}/choice`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            "X-Authorization": siteApiKey
          },
          body: JSON.stringify(choice, null, 2),
        })
        if (!response.ok) {
          console.log(response);
          throw new Error('Fetch failed')
        }

      }

      for (let question of questions) {

        delete question.id;
        question.questionGroupId = questionGroupId;

        let response = await fetch(`${apiUrl}/api/site/${siteId}/choicesguide/${choicesGuideId}/questiongroup/${questionGroupId}/question`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            "X-Authorization": siteApiKey
          },
          body: JSON.stringify(question, null, 2),
        })
        if (!response.ok) {
          console.log(response);
          throw new Error('Fetch failed')
        }
        
      }
      
    }

  } catch(err) {
    console.log(err);
  }

}

exports.delete = async(token, siteId, choicesGuideId) => {

  try {
    let response = await fetch(apiUrl + `/api/site/${siteId}/choicesguide/${choicesGuideId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        "X-Authorization": siteApiKey
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

exports.update = async(token, siteId, data) => {

  console.log('update.:', token, siteId, data.extraData);

  try {
    let response = await fetch(`${apiUrl}/api/site/${siteId}/choicesguide/${data.id}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        "X-Authorization": siteApiKey
      },
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
