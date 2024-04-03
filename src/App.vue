<template>
  <v-app>
    <v-main>
      <ThemeViewer :vCardVariant="vCardVariant" />
    </v-main>
    <v-footer app>
      <small><a target="_blank" href="https://www.wakfu.com/fr/mmorpg">WAKFU MMORPG : © {{new Date().getFullYear()}}
          Ankama Studio. All rights reserved</a> "wakfu-theme-viewer" and it's derivative services are unofficial
        websites without any connection with Ankama.</small>
      <v-spacer />
      <v-btn size="x-small" href="https://wakfu.cdn.ankama.com/gamedata/theme/theme.zip">
        Download theme.zip
      </v-btn>
      <v-btn-toggle :v-model="vCardVariant == 'tonal' ? 0 : 1">
        <v-btn @click="vCardVariant = 'tonal'" size="x-small">
          Tonal Card
        </v-btn>

        <v-btn @click="vCardVariant = 'text'" size="x-small">
          Text Card
        </v-btn>
      </v-btn-toggle>
      <v-btn-toggle :v-model="theme.global.current.value.dark ? 0 : 1">
        <v-btn @click="theme.global.name.value = 'dark'" size="x-small">
          Dark
        </v-btn>

        <v-btn @click="theme.global.name.value = 'light'" size="x-small">
          Light
        </v-btn>
      </v-btn-toggle>
    </v-footer>
  </v-app>
</template>

<script setup>
import { useTheme } from 'vuetify';

const theme = useTheme();
</script>

<script>
import ThemeViewer from './components/ThemeViewer.vue';

export default {
  name: 'App',

  components: {
    ThemeViewer,
  },

  data: () => ({
    vCardVariant: 'tonal',
  })
};
</script>

<style>
  .v-application .text-center {
    text-align: left !important;
  }
</style>
