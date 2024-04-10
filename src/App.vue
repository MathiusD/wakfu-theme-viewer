<template>
  <v-app>
    <v-system-bar app>
      <span>Wakfu Theme Viewer</span>
      <v-spacer />
      <v-btn size="x-small" :href="documentationLink" target="_blank">
        Documentation (Forum Post)
      </v-btn>
      <v-btn size="x-small" href="https://wakfu.cdn.ankama.com/gamedata/theme/theme.zip">
        Download theme.zip
      </v-btn>
    </v-system-bar>
    <v-main>
      <ThemeViewer :vCardVariant="vCardVariant" :dataViewerPosition="dataViewerPosition" />
    </v-main>
    <v-footer app>
      <small><a target="_blank" href="https://www.wakfu.com/fr/mmorpg">WAKFU MMORPG : © {{ new Date().getFullYear() }}
          Ankama Studio. All rights reserved</a> "wakfu-theme-viewer" and it's derivative services are unofficial
        websites without any connection with Ankama.</small>
      <v-spacer />
      <small>Data Viewer : </small>
      <v-btn-toggle v-model="dataViewerPositionBtnToggle">
        <v-btn @click="setDataViewerPosition()" size="x-small">
          Not Sticky
        </v-btn>

        <v-btn @click="setDataViewerPosition('sticky')" size="x-small">
          Sticky
        </v-btn>
      </v-btn-toggle>
      <v-btn-toggle v-model="vCardVariantBtnToggle">
        <v-btn @click="setVCardVariant('tonal')" size="x-small">
          Tonal Card
        </v-btn>

        <v-btn @click="setVCardVariant('text')" size="x-small">
          Text Card
        </v-btn>
      </v-btn-toggle>
      <v-btn-toggle v-model="globalThemeBtnToggle">
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
</script>

<script>
import ThemeViewer from './components/ThemeViewer.vue';
import { useTheme } from 'vuetify';
import { localStorageThemeKey, localStorageVCardVariant, localStorageDataViewerPosition, defaultWindowTheme } from './core/utils.js';

let definedVCardVariant = localStorage.getItem(localStorageVCardVariant);
definedVCardVariant = definedVCardVariant != null ? definedVCardVariant : 'tonal';
const definedTheme = localStorage.getItem(localStorageThemeKey);
const themeIsDefined = definedTheme == null;
let selectedDataViewerPosition = localStorage.getItem(localStorageDataViewerPosition);
selectedDataViewerPosition = selectedDataViewerPosition != null ? selectedDataViewerPosition : '';

let language = window.navigator.userLanguage || window.navigator.language;

export default {
  name: 'App',

  setup() {
    const theme = useTheme();

    return {
      theme
    }
  },

  components: {
    ThemeViewer,
  },

  data: () => ({
    vCardVariant: definedVCardVariant,
    followWindowTheme: themeIsDefined,
    dataViewerPosition: selectedDataViewerPosition,
    vCardVariantBtnToggle: definedVCardVariant == 'tonal' ? 0 : 1,
    globalThemeBtnToggle: themeIsDefined ? 0 : this.theme.global.current.value.dark ? 1 : 2,
    dataViewerPositionBtnToggle: selectedDataViewerPosition == 'sticky' ? 1 : 0,
    documentationLink: language.includes("fr") ?
      "https://www.wakfu.com/fr/forum/514-themes-personnalises/425922-installation-creation-themes-interface-personnalises" :
      "https://www.wakfu.com/en/forum/332-development/241635-installing-creating-custom-ui-themes"
      ,
  }),

  methods: {
    setVCardVariant(variant) {
      this.vCardVariant = variant;
      localStorage.setItem(localStorageVCardVariant, variant);
    },
    setGlobalTheme(themeName) {
      this.theme.global.name.value = themeName;
      localStorage.setItem(localStorageThemeKey, themeName);
      this.followWindowTheme = false;
    },
    setThemeFollowWindowTheme() {
      let windowTheme = defaultWindowTheme();
      this.theme.global.name.value = windowTheme;
      localStorage.removeItem(localStorageThemeKey);
      this.followWindowTheme = true;
    },
    setDataViewerPosition(position) {
      this.dataViewerPosition = position;
      localStorage.setItem(localStorageDataViewerPosition, position);
    }
  }
};
</script>

<style>
.v-application .text-center {
  text-align: left !important;
}
</style>
