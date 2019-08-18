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
            <v-stepper-step :complete="e1 > 2" step="2">Two</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step step="3">Three</v-stepper-step>
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

                    <v-card max-width="500" class="mx-auto">
                      <v-list dense>
                        <v-subheader>Existing Players</v-subheader>
                        <v-list-item-group>
                          <v-list-item v-for="(player, i) in existingPlayers" :key="i">
                            <v-list-item-content><v-list-item-title>{{ player }}</v-list-item-title></v-list-item-content>
                          </v-list-item>
                        </v-list-item-group>
                      </v-list>
                    </v-card>

                    <v-card max-width="500" class="mx-auto my-2">
                      <v-list dense>
                        <v-subheader>New Players</v-subheader>
                        <v-list-item-group>
                          <v-list-item v-for="(player, i) in missingPlayers" :key="i">
                            <v-list-item-content><v-list-item-title>{{ player }}</v-list-item-title></v-list-item-content>
                          </v-list-item>
                        </v-list-item-group>
                      </v-list>
                    </v-card>

              <v-btn @click="step3" color="primary">Add the Players</v-btn>
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
      tournament: {},
      selectedEvent: '',
      entrants: [],
      existingPlayers: [],
      missingPlayers: [],
      snackbar: false,
      snackText: '',
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
        this.e1 = 2;
      });
    },
    async step2() {
      console.log(this.selectedEvent);
      await queryAPI(`
        query getEntrants{
	        entrants_smashgg(eventID:${this.selectedEvent}){
            id
    				name
          }
        }`).then((results) => {
        this.entrants = results.entrants_smashgg;
        this.entrants.sort((x, y) => (x.name > y.name ? 1 : -1));
      });

      const userList = this.entrants.map(x => x.name);

      console.log(JSON.stringify(userList));
      await queryAPI(`
        query getPlayers{
          players(names: ${JSON.stringify(userList)}){
            name
          }
        }`).then((results) => {
        this.existingPlayers = results.players;
      });

      this.existingPlayers = this.existingPlayers.map(x => x.name.toLowerCase());
      // userList = userList.map((x) => x.toLowerCase());

      this.missingPlayers = this.entrants.filter(x =>
        // console.log(x.name);
        // console.log(!(x.name in userList));
        !(this.existingPlayers.includes(x.name.toLowerCase()))).map(x => x.name);

      this.e1 = 3;
    },
    step3() {
      queryAPI(`
        mutation addTournament {
          addTournament(slug:"${this.tournamentSlug}", eventID: ${this.selectedEvent}){
            tournamentID
            eventID
          }
        }`).then((results) => {
        this.snackText = 'Tournament Added Successfully!';
        this.snackbar = true;
        this.e1 = 1;
      });
    },
  },
};
</script>
