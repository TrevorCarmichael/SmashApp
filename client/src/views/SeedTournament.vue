<template>
    <v-stepper v-model="e1">
        <v-snackbar
          v-model="snackbar"
          color="success"
        >
          {{ snackText }}
          <v-btn color="white" text @click="snackbar = false">
            Close
          </v-btn>
        </v-snackbar>
        <v-stepper-header>
            <v-stepper-step :complete="e1 > 1" step="1">Select Tournament</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step :complete="e1 > 2" step="2">Select Event</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step :complete="e1 > 3" step="3">Select Phase</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step :complete="e1 > 4" step="4">Set Seeding</v-stepper-step>
        </v-stepper-header>

        <v-stepper-items>
            <v-stepper-content step="1">
                <v-text-field v-model="tournamentSlug" label="Tournament Slug" required></v-text-field>
                <v-btn v-on:click="step1" color="primary">Continue</v-btn>
            </v-stepper-content>
            <v-stepper-content step="2">
                <v-select :items="tournament.events" label="Select Event" item-text="name" item-value="id" v-model="selectedEvent"></v-select>
                <v-btn @click="step2" color="primary">Continue</v-btn>
                <v-btn text @click="e1=1" color="red">Back</v-btn>
            </v-stepper-content>
            <v-stepper-content step="3">
              <v-select :items="phases" label="Select Phase" item-text="name" item-value="id" v-model="selectedPhase"></v-select>
              <v-btn @click="step3" color="primary">Continue</v-btn>
              <v-btn text @click="e1=1" color="red">Reset</v-btn>
            </v-stepper-content>
            <v-stepper-content step="4">
              <v-select :items="rankings" label="Select Ranking to seed by" item-text="name" item-value="id" v-model="selectedRanking" @change="changedRanking"></v-select>
              <v-card max-width="500" class="mx-auto">
                <v-list dense>
                  <v-subheader>Current Seeding</v-subheader>
                  <v-list-item-group>
                    <v-list-item v-for="(player, i) in currentSeeding" :key="i">
                      <v-list-item-content><v-list-item-title>{{i+1}} {{ player.name }}</v-list-item-title></v-list-item-content>
                    </v-list-item>
                  </v-list-item-group>
                </v-list>
              </v-card> 
              <v-card max-width="500" class="mx-auto">
                <v-list dense>
                  <v-subheader>Proposed Seeding</v-subheader>
                  <v-list-item-group>
                    <v-list-item v-for="(player, i) in proposedSeeding" :key="i">
                      <v-list-item-content><v-list-item-title>{{i+1}} {{ player.name }}</v-list-item-title></v-list-item-content>
                    </v-list-item>
                  </v-list-item-group>
                </v-list>
              </v-card>              
              <v-btn @click="step4" color="primary">Seed Phase</v-btn>
              <v-btn text @click="e1=1" color="red">Reset</v-btn>
            </v-stepper-content>
        </v-stepper-items>
    </v-stepper>
</template>

<script>
import queryAPI from '../functions/graphqlQuery';

export default {
  components: {

  },
  mounted() {

  },
  data() {
    return {
      e1: 1,
      tournamentSlug: '',
      phases: [],
      rankings: [],
      tournament: {},
      selectedEvent: '',
      selectedPhase: '',
      entrants: [],
      existingPlayers: [],
      missingPlayers: [],
      snackbar: false,
      snackText: '',
      selectedRanking: '',
      currentSeeding: [],
      rankedPlayers: [],
      proposedSeeding: []
    };
  },
  methods: {
    step1() {
      queryAPI(`
        query getTournament{
          tournament_smashgg(slug:"${this.tournamentSlug}"){
            tournamentID
            name
            date
            events {
              name
              id
            }
            slug
          }
        }`).then((results) => {
        this.tournament = results.tournament_smashgg;
        console.log(this.tournament.events.length);
        if (this.tournament.events.length === 1) {
          this.selectedEvent = this.tournament.events[0].id;
          this.step2();
        } else {
          this.e1 = 2;
        }
      });
    },
    async step2() {
      console.log(this.selectedEvent);
      await queryAPI(`
      query seeds{
        event_seeds(eventID:${this.selectedEvent}){
          id 
          name  
          numSeeds 
          players{
            name
            id
            seedNum
          }
        }
      }`).then((results) => {
        this.phases = results.event_seeds;
        this.e1 = 3;
      });
    },
    async step3() {
      let phase = this.phases.find((x) => x.id === this.selectedPhase);
      this.currentSeeding = phase.players;
      console.log(this.currentSeeding);
      let rankings = await queryAPI(`
      query rankings{
        rankings{
          name
          id
          formattedStartDate
          formattedEndDate
        }
      }
      `).then((results) => {
        this.rankings = results.rankings;
        this.e1 = 4;
      });
    },
    step4() {
      let newSeeds = [];
      this.proposedSeeding.forEach((x, i) => {
        newSeeds.push(x.id);
      });

      let seeding = JSON.stringify(newSeeds);
      let query = `
        mutation seedit{
          seedTournament(phaseID:${this.selectedPhase}, seeds: "${seeding}"){
            result
          }
        }
      `;

      console.log(query);
      queryAPI(query).then(results => {
        console.log(results);
        console.log("we're good!");
      })
    },

    changedRanking(){
      console.log(this.selectedRanking);
      queryAPI(`
      query rankings{
        ranking(id:"${this.selectedRanking}"){
          name
          id
          formattedStartDate
          formattedEndDate
          players{
            name
            rating
            rating_deviation
          }
        }
      }`).then((results) => {
        this.rankedPlayers = results.ranking.players;
        console.log(this.rankedPlayers);
        this.proposedSeeding = this.currentSeeding.slice();
        this.proposedSeeding.sort((a, b) => {
          let getPlayer = (name) => this.rankedPlayers.find((x) => x.name.toLowerCase() === name.toLowerCase());
          let a_rank = getPlayer(a.name);
          let b_rank = getPlayer(b.name);
          let a_rating = a_rank ? a_rank.rating - (2 * a_rank.rating_deviation) : 0;
          let b_rating = b_rank ? b_rank.rating - (2 * b_rank.rating_deviation) : 0;

          return a_rating < b_rating ? 1 : -1;
        });
        console.log(this.proposedSeeding);
      });
    }
  },
};
</script>
