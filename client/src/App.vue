<template>
  <v-app>
    <smashNavigation/>

    <v-content>
      <v-container>
        <router-view />
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import smashNavigation from '@/components/smashNavigation.vue';

export default {
  name: 'App',
  components: {
    smashNavigation,
  },
  data: () => ({
    //
  }),
};
</script>
