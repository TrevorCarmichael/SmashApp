<template>
  <v-app>
    <smashNavigation/>

    <v-content>
      <router-view />
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
