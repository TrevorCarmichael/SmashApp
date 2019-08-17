<template>
    <v-list>
        <v-list-item-group>
            <v-list-item v-for="tournament in tournaments" v-bind:key="tournament.id">
                <v-list-item-content>
                    <v-list-item-title v-text="tournament.name"></v-list-item-title>
                    <v-list-item-subtitle>{{tournament.formattedDate}}</v-list-item-subtitle>
                </v-list-item-content>
            </v-list-item>
        </v-list-item-group>
    </v-list>
</template>

<script>
import queryAPI from '../functions/graphqlQuery';

export default {
  components: {

  },
  mounted() {
    console.log(`hi ${process.env.VUE_APP_ENDPOINT}`);

    queryAPI(`
      query gettourn {
        tournaments{
          name
          date
          formattedDate
        }
      }
      `).then((response) => {
      this.tournaments = response.tournaments.sort((a,b) => a.date < b.date ? 1 : -1);
    });
  },
  data() {
    return {
      tournaments: [],
    };
  },
  methods: {

  },
};
</script>
