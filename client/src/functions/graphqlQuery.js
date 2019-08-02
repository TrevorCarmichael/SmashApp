module.exports = function queryAPI(query, variables) {
  const body = JSON.stringify({ query, variables });
  const headers = { 'Content-Type': 'application/json' };
  console.log(process.env.VUE_APP_ENDPOINT);
  return fetch(process.env.VUE_APP_ENDPOINT, {
    method: 'POST',
    headers,
    body,
  }).then(response => response.json()).then(json => json.data);
};
