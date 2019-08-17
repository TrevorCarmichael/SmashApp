<template>
  <p>There's nothing here I'm not really sure why I added this page</p>
</template>

<script>


export default {
  components: {

  },
  mounted() {
    console.log(process.env.VUE_APP_ENDPOINT);
  },
};
</script>
