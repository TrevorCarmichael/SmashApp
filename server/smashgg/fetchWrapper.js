const fetch = require('node-fetch');

function fetchWrapper(endpoint, API_KEY) {
    this.endpoint = endpoint;
    this.API_KEY = API_KEY;
}

fetchWrapper.prototype.queryAPI = async function(query, variables) {
    const body = JSON.stringify({query: query, variables: variables});
    const headers = {'Content-Type' : 'application/json', 'Authorization' : 'Bearer' + this.API_KEY};

    return fetch(this.endpoint, {
        method: 'POST', 
        headers: headers,
        body: body
    }).then( (response) => response.json() ).then( (response) => response.data);
}

module.exports = fetchWrapper;