const fetchWrapper = require('./fetchWrapper');

function SmashGG(API_KEY){
    this.API_KEY = API_KEY;
    this._fetch = new fetchWrapper('https://api.smash.gg/gql/alpha', API_KEY);
}

SmashGG.prototype.getTournamentByName = async function getTournamentByName(name) {
  console.log('test');
  const query = `
        query TournamentQuery($slug: String) {
            tournament(slug: $slug){
                id
                name
                state
                startAt
                events {
                    id
                    name
                }
            }
        }
    `;

    const variables = `
        {
            "slug": "${name}"
        }
    `;

    return this._fetch.queryAPI(query, variables);
}

SmashGG.prototype.getEventEntrants = async function getEventEntrants(eventID, perPage = 50) {
    const query = `
        query EventEntrants($eventId: ID!,$page:Int!,$perPage:Int!){
            event(id:$eventId){
            name
            entrants(query:{
                page:$page
                perPage:$perPage
            }){
                pageInfo{
                    total
                    totalPages
                }
                nodes{
                    id
                    name
                    participants{
                        gamerTag
                    }
                }
                }
            }
            }
    `;

    let page = 1;
    let variables= () => `{
        "eventId": ${eventID},
        "page": ${page},
        "perPage": ${perPage}
      }`;

    let entrants = [];    
    let result;

    do {
        result = await this._fetch.queryAPI(query, variables());
        page += 1;
        result.event.entrants.nodes.forEach(x => {
            entrants.push({name: x.participants[0].gamerTag, id: x.id});
        })
    } while (result.event.entrants.pageInfo.totalPages >= page)

    return entrants;
}

SmashGG.prototype.getEventSets = async function getEventSets(eventID, perPage = 50) {
  const query = `query EventSets($eventId: ID!, $page:Int!, $perPage:Int!){
      event(id:$eventId){
        id
        name
        sets(
          page: $page
          perPage: $perPage
          sortType: STANDARD
        ){
          pageInfo{
            total
            totalPages
          }
          nodes{
            id
            displayScore
            winnerId
            entrant1Score
            entrant2Score
            slots{
              entrant{
                id
                participants {
                  gamerTag
                }
              }
            }
          }
        }
      }
    }`;

  let page = 1;

  let variables = () => `{
      "eventId": ${eventID},
      "page": ${page},
      "perPage": ${perPage}
    }`;

  let sets = [];    
  let result;

  do {
      result = await this._fetch.queryAPI(query, variables());
      page += 1;

      result.event.sets.nodes.forEach(x => {
          sets.push(x);
      })
  } while (result.event.sets.pageInfo.totalPages >= page)

  let formattedSets = [];
  sets.forEach( (x) => {
      let winner = x.slots.find(y => y.entrant.id === x.winnerId);
      let loser = x.slots.find(y => y.entrant.id !== x.winnerId);

      formattedSets.push({
          id: x.id,
          winner: winner,
          loser: loser,
          winnerScore: x.entrant1Score,
          loserScore: x.entrant2Score,
          DQ: (x.displayScore==="DQ")
      });
  });

  return formattedSets;
}

SmashGG.prototype.getEventSets_old = async function getEventSets(eventID, perPage = 50) {
    const query = `query EventSets($eventId: ID!, $page:Int!, $perPage:Int!){
        event(id:$eventId){
          id
          name
          sets(
            page: $page
            perPage: $perPage
            sortType: STANDARD
          ){
            pageInfo{
              total
              totalPages
            }
            nodes{
              displayScore
              winnerId
              slots{
                entrant{
                  id
                  name
                }
              }
            }
          }
        }
      }`;

    let page = 1;

    let variables = () => `{
        "eventId": ${eventID},
        "page": ${page},
        "perPage": ${perPage}
      }`;

    let sets = [];    
    let result;

    do {
        result = await this._fetch.queryAPI(query, variables());
        page += 1;

        result.event.sets.nodes.forEach(x => {
            sets.push(x);
        })
    } while (result.event.sets.pageInfo.totalPages >= page)

    let formattedSets = [];
    sets.forEach( (x) => {
        let winner = x.slots.filter(y => y.entrant.id === x.winnerId);
        let loser = x.slots.filter(y => y.entrant.id !== x.winnerId);

        formattedSets.push({
            winner: winner[0],
            loser: loser[0],
            DQ: (x.displayScore==="DQ")
        });
    });

    return formattedSets;
}

SmashGG.prototype.getEventInfo = async function getEventInfo(eventID) {
  const query = ` query TournamentQuery {
    event(id: ${eventID}) {
      id
      name
    }
  }
  `;

  let result = await this._fetch.queryAPI(query);
  return result.event;
}
SmashGG.prototype.getEventStandings = async function getEventStandings(eventID, perPage = 100) {
    const query = `query EventStandings($page: Int!, $perPage: Int!) {
      event(id: ${eventID}) {
        name
        standings(query: {
          perPage: $perPage,
          page: $page
        }){
          nodes {
            placement
            entrant {
              participants {
                gamerTag
              }
            }
          }
        }
      }
    }
      `;

    let page = 1;

    let variables = () => `{
        "page": ${page},
        "perPage": ${perPage}
      }`;

    let result = await this._fetch.queryAPI(query, variables());

    return result.event.standings.nodes;
}

SmashGG.prototype.getEventSeed = async function getEventSeed(eventID, perPage = 50) {
    const query = `query EventSeeds($eventId: ID!, $page: Int!, $perPage: Int!){
      event(id:$eventId){
      name
      phases{
        id
        name
        numSeeds
        seeds(query:{
          page: $page
          perPage: $perPage
        }){
          nodes{
            id
            players{
              gamerTag
            }
            seedNum
          }
        }
      }
      }
    }`;

    let page = 1;
    let variables = () => `{
      "eventId": ${eventID},
      "page": 1,
      "perPage": 50
    }`;

    
    let result = await this._fetch.queryAPI(query, variables());
    return result.event.phases;
}

SmashGG.prototype.updatePhaseSeeding = async function updatePhaseSeeding(phaseID, seedMapping) {
  const query = `mutation UpdatePhaseSeeding ($phaseId: ID!, $seedMapping: [UpdatePhaseSeedInfo]!) {
    updatePhaseSeeding (phaseId: $phaseId, seedMapping: $seedMapping) {
      id
    }
  }`;

  let page = 1;
  let variables = () => `{
    "phaseId": ${phaseID},
    "seedMapping": ${seedMapping}
  }`;

  
  let result = await this._fetch.queryAPI(query, variables());
  console.log(result);
  return result;
}

SmashGG.prototype.customQuery = function customQuery(query, variables){
    return this._fetch.queryAPI(query, variables);
}

module.exports = SmashGG;