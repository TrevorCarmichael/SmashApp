<template>
<div>
  <v-system-bar dark></v-system-bar>
  <v-app-bar dark>
    <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    <v-toolbar-title class="headline text-uppercase">
      <span>NH Smash: </span>
      <span class="font-weight-light">{{ this.$route.meta.title }}</span>
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn text href="https://twitter.com/Googlrr" target="_blank">
      <span class="mr-2">TWITTER</span>
    </v-btn>
  </v-app-bar>
  <v-navigation-drawer v-model="drawer" absolute temporary>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title class="title">{{ this.$route.meta.title }}</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-divider></v-divider>
    <v-list nav>
      <v-list-item to="/">
        <v-list-item-icon><v-icon>mdi-home</v-icon></v-list-item-icon>
        <v-list-item-title>Home</v-list-item-title>
      </v-list-item>
      <v-list-item to="/Players">
        <v-list-item-icon><v-icon>mdi-account-multiple</v-icon></v-list-item-icon>
        <v-list-item-title>Players</v-list-item-title>
      </v-list-item>
      <v-list-item to="/Tournaments">
        <v-list-item-icon><v-icon>mdi-gamepad</v-icon></v-list-item-icon>
        <v-list-item-title>Tournaments</v-list-item-title>
      </v-list-item>

      <v-list-group prepend-icon="mdi-settings">
        <template v-slot:activator>
          <v-list-item-title>Admin</v-list-item-title>
        </template>
        <v-list-item to="/AddTournament">
          <v-list-item-icon></v-list-item-icon>
          <v-list-item-title>Add Tournaments</v-list-item-title>
        </v-list-item>
      </v-list-group>
    </v-list>
  </v-navigation-drawer>
</div>
</template>

<script>

export default {
  data(){
    return {
      drawer: false
    }
  }
}
</script>