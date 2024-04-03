<template>
  <div class="ma-6">
    <v-row>
      <v-col col="7">
        <v-card :variant="vCardVariant">
          <v-card-title class="d-flex flex-row">
            <v-radio-group v-model="radioType" inline>
              <v-radio label="Pixmap" value="pixmap" />
              <v-radio label="Theme Element" value="themeElement" />
              <v-radio label="Color" value="color" />
            </v-radio-group>
            <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line />
          </v-card-title>
          <v-data-table :headers="headers" :items="result" :search="search" @click:row="pickElement" dense>

          </v-data-table>
        </v-card>
      </v-col>
      <v-col col="6" v-if="'pixmap' === radioType && currentPixmap">
        <Pixmap :pixmap="currentPixmap" :vCardVariant="vCardVariant" />
      </v-col>
      <v-col col="6" v-else-if="'themeElement' === radioType && currentThemeElement">
        <v-card class="ma-2" :variant="vCardVariant">
          <v-card-title>{{ currentThemeElement.id }}</v-card-title>
          <v-card-text>
            <span v-if="currentThemeElement.type">Type : {{ currentThemeElement.type }} <br /></span>
            <span v-if="currentThemeElement.name">Name : {{ currentThemeElement.name }} <br /></span>
            <span v-if="currentThemeElement.since">Since : {{ currentThemeElement.since }} <br /></span>
            <span v-if="currentThemeElement.usage">Usage : {{ currentThemeElement.usage.join(", ") }}</span>
          </v-card-text>
        </v-card>
        <Pixmap v-for="pixmap of currentThemeElement.pixmaps" :pixmap="pixmap"
          :forcedUsages="currentThemeElement.usage ? currentThemeElement.usage.filter(x => pixmap.usage && !pixmap.usage.includes(x)) : undefined"
          :key="pixmap.id" />
      </v-col>
      <v-col col="6" v-else-if="'color' === radioType && currentColor">
        <Color :color="currentColor" :vCardVariant="vCardVariant" />
      </v-col>
      <v-col col="6" v-else></v-col>
    </v-row>

  </div>
</template>

<script>
import {ThemeParser} from "../core/theme-parser.js";
import Pixmap from "./Pixmap.vue";
import Color from "./Color.vue";


export default {
  name: 'ThemeViewer',

  props: ['vCardVariant'],

  components: {
    Color,
    Pixmap
  },

  mounted() {
    ThemeParser.loadTheme().then(() => {
      this.loaded = true;
      this.headers = this.generateHeaders();
      this.result = this.generateResult();
      this.currentPixmap = ThemeParser.getPixmap("pmEcosystemFlaskFrame");
    });
  },

  data: () => ({
    components: [],
    currentColor: undefined,
    currentPixmap: undefined,
    currentThemeElement: undefined,
    headers: [],
    result: undefined,
    loaded: false,
    radioType: "pixmap",
    search: ""
  }),

  watch: {
    radioType() {
      this.headers = this.generateHeaders();
      this.result = this.generateResult();
    }
  },

  methods: {
    generateResult() {
      if("pixmap" === this.radioType) return ThemeParser.getPixmaps();
      if("themeElement" === this.radioType) return ThemeParser.getThemeElements();
      if("color" === this.radioType) return ThemeParser.getColors(true);
    },

    generateHeaders() {
      if("pixmap" === this.radioType) return [
        {
          title: "ID",
          key: 'id',
          align: 'left',
          width: '400px'
        }, {
          title: 'Texture',
          key: 'texture',
          align: 'left',
          width: '200px'
        }, {
          title: 'Usage',
          key: 'usage.length',
          align: 'left',
        }, {
          title: 'X',
          key: 'x',
          align: 'left',
        }, {
          title: 'Y',
          key: 'y',
          align: 'left',
        }, {
          title: 'Width',
          key: 'width',
          align: 'left',
        }, {
          title: 'Height',
          key: 'height',
          align: 'left',
        }
      ]
      else if("themeElement" === this.radioType) return [
        {
          title: "ID",
          key: 'id',
          align: 'left',
          width: '400px'
        }, {
          title: 'Pixmaps',
          key: 'pixmaps.length',
          align: 'left',
        }, {
          title: 'Usage',
          key: 'usage.length',
          align: 'left',
        }, {
          title: 'Type',
          key: 'type',
          align: 'left',
        }
      ]
      else if("color" === this.radioType) return [
        {
          title: "ID",
          key: 'id',
          align: 'left',
          width: '400px'
        }, {
          title: 'Red',
          key: 'resolvedRed',
          align: 'left',
        }, {
          title: 'Green',
          key: 'resolvedGreen',
          align: 'left',
        }, {
          title: 'Blue',
          key: 'resolvedBlue',
          align: 'left',
        }, {
          title: 'Alpha',
          key: 'resolvedAlpha',
          align: 'left',
        }, {
          title: 'Usage',
          key: 'usage.length',
          align: 'left',
        }, {
          title: 'Color Used',
          key: 'colorUsed',
          align: 'left',
        }
      ]
    },

    pickElement(event, data) {
      let element = data.item;
      if("pixmap" === this.radioType) return this.currentPixmap = element;
      else if("themeElement" === this.radioType) return this.currentThemeElement = element;
      else if("color" === this.radioType) return this.currentColor = element;
    }
  }
}
</script>
