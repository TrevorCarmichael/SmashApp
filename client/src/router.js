import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { title: 'Home' },
    },
    {
      path: '/players',
      name: 'players',
      meta: { title: 'Players' },
      component: () => import('./views/Players.vue'),
    },
    {
      path: '/tournaments',
      name: 'tournaments',
      meta: { title: 'Tournaments' },
      component: () => import('./views/Tournaments.vue'),
    },
    {
      path: '/addtournament',
      name: 'addtournament',
      meta: { title: 'Add Tournament' },
      component: () => import('./views/AddTournament.vue'),
    },
    {
      path: '/seedtournament',
      name: 'seedtournament',
      meta: { title: 'Seed Tournament' },
      component: () => import('./views/SeedTournament.vue'),
    },
  ],
});
