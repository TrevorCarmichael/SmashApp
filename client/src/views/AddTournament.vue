<template>
    <v-stepper v-model="e1">
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

                <v-btn @click="e1=1" color="primary">Continue</v-btn>
                <v-btn text @click="e1=2" color="red">Back</v-btn>
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
      selectedEvent: ''
    };
  },
  methods: {
    step1() {
      queryAPI(`
            query tournament {
                tournament(slug: "${this.tournamentSlug}") {
                    name
                    id
                    date
                    events {
                        id
                        name
                    }
                }
            }
          `).then((results) => {
        this.tournament = results.tournament;
        console.log('Testing:');
        console.log(this.tournament);
        console.log(this.tournament.events);
        this.e1 = 2;
      });
    },
    step2() {
      console.log(this.selectedEvent);
    },
  },
};
</script>
