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
        <v-btn @click="setVCardVariant('tonal')" size="x-small">
          Tonal Card
        </v-btn>

        <v-btn @click="setVCardVariant('text')" size="x-small">
          Text Card
        </v-btn>
      </v-btn-toggle>
      <v-btn-toggle :v-model="followWindowTheme ? 0 : theme.global.current.value.dark ? 1 : 2">
        <v-btn @click="setThemeFollowWindowTheme()" size="x-small">
          Auto
        </v-btn>

        <v-btn @click="setGlobalTheme('dark')" size="x-small">
          Dark
        </v-btn>

        <v-btn @click="setGlobalTheme('light')" size="x-small">
          Light
        </v-btn>
      </v-btn-toggle>
    </v-footer>
  </v-app>
</template>

<script setup>
import { useTheme } from 'vuetify';
import { localStorageThemeKey, localStorageVCardVariant, defaultWindowTheme } from './core/utils.js';

const theme = useTheme();

let followWindowTheme = localStorage.getItem(localStorageThemeKey) == null;

const setGlobalTheme = (themeName) => {
  theme.global.name.value = themeName;
  localStorage.setItem(localStorageThemeKey, themeName);
  followWindowTheme = false;
}

const setThemeFollowWindowTheme = () => {
  let windowTheme = defaultWindowTheme();
  theme.global.name.value = windowTheme;
  localStorage.removeItem(localStorageThemeKey);
  followWindowTheme = true;
}
</script>

<script>
import ThemeViewer from './components/ThemeViewer.vue';

const definedVCardVariant = localStorage.getItem(localStorageVCardVariant);

export default {
  name: 'App',

  components: {
    ThemeViewer,
  },

  data: () => ({
    vCardVariant: definedVCardVariant != null ? definedVCardVariant : 'tonal',
  }),

  methods: {
    setVCardVariant(variant) {
      this.vCardVariant = variant;
      localStorage.setItem(localStorageVCardVariant, variant);
    },
  }
};
</script>

<style>
  .v-application .text-center {
    text-align: left !important;
  }
</style>
