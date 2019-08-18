<template>
  <div>
    <v-select :items="rankings" label="Select Event" item-text="name" item-value="id" v-model="selectedRanking" @change="rankingChanged()"></v-select>
    <v-list>
      <v-list-item-group>
        <v-list-item v-for="(player, i) in players" :key="i">
          <v-list-item-avatar>{{ i+1 }}</v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ player.name }}</v-list-item-title>
            <v-list-item-subtitle>{{ player.rating }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </div>
</template>

<script>
import queryAPI from '../functions/graphqlQuery';

export default {
  components: {

  },
  data() {
    return {
      rankings: [],
      selectedRanking: '',
      players: [],
    };
  },
  created() {
    queryAPI(`
      query rank{
        rankings{
          id
          name
          formattedStartDate
          formattedEndDate    
        }
      }
    `).then((results) => {
      this.rankings = results.rankings;
    });
  },
  methods: {
    rankingChanged() {
      console.log(this.selectedRanking);
      queryAPI(`
        query getRankings{
          ranking(id: "${this.selectedRanking}"){
            players{
              name
              rating
              rating_deviation
            }
          }
        }
      `).then((results) => {
        this.players = results.ranking.players.map(p => ({
          name: p.name,
          rating: p.rating - (2 * p.rating_deviation),
        })).sort((a, b) => (a.rating < b.rating ? 1 : -1));
      });
    },
  },
};
</script>
