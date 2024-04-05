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
            <v-btn @click="reloadThemeData()" icon="mdi-refresh" />
          </v-card-title>
          <v-data-table :headers="headers" :items="result" :search="search" @click:row="pickElement" dense>

          </v-data-table>
        </v-card>
      </v-col>
      <v-col col="6" v-if="'pixmap' === radioType && currentPixmap">
        <Pixmap :pixmap="currentPixmap" :vCardVariant="vCardVariant" />
      </v-col>
      <v-col col="6" v-else-if="'themeElement' === radioType && currentThemeElement">
        <ThemeElement :theme-element="currentThemeElement" :vCardVariant="vCardVariant" />
      </v-col>
      <v-col col="6" v-else-if="'color' === radioType && currentColor">
        <Color :color="currentColor" :vCardVariant="vCardVariant" />
      </v-col>
      <v-col col="6" v-else></v-col>
    </v-row>

  </div>
</template>

<script>
import { ThemeParser } from "../core/theme-parser.js";
import Pixmap from "./Pixmap.vue";
import ThemeElement from "./ThemeElement.vue";
import Color from "./Color.vue";

import { localStorageElementSelected, localStorageRadioTypeSelected } from '../core/utils.js';

let selectedRadioType = localStorage.getItem(localStorageRadioTypeSelected);
selectedRadioType = selectedRadioType != null ? selectedRadioType : "pixmap";
let selectedElement = localStorage.getItem(localStorageElementSelected);

const getDefaultElementPerRadioType = (radioType) => {
  if (radioType == 'pixmap') {
    return "pmEcosystemFlaskFrame";
  } else if (radioType == 'themeElement') {
    return "windowBackground";
  } else if (radioType == 'color') {
    return "defaultLightColor";
  }
}
if (!selectedElement) {
  selectedElement = getDefaultElementPerRadioType(selectedRadioType);
}

export default {
  name: 'ThemeViewer',

  props: ['vCardVariant'],

  components: {
    Color,
    ThemeElement,
    Pixmap,
  },

  mounted() {
    ThemeParser.loadTheme().then(() => {
      this.loaded = true;
      this.reloadDataTable();
      this.loadSelectedElement();
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
    radioType: selectedRadioType,
    search: ""
  }),

  watch: {
    radioType() {
      localStorage.setItem(localStorageRadioTypeSelected, this.radioType);
      this.reloadDataTable();
      selectedElement = getDefaultElementPerRadioType(this.radioType);
      this.loadSelectedElement();
    }
  },

  methods: {
    loadSelectedElement() {
      if (this.radioType == 'pixmap') {
        this.currentPixmap = ThemeParser.getPixmap(selectedElement);
      } else if (this.radioType == 'themeElement') {
        this.currentThemeElement = ThemeParser.getThemeElement(selectedElement);
      } else if (this.radioType == 'color') {
        this.currentColor = ThemeParser.getColor(selectedElement, true);
      }
    },

    reloadDataTable() {
      this.headers = this.generateHeaders();
      this.result = this.generateResult();
    },

    reloadThemeData() {
      ThemeParser.loadTheme(true).then(() => {
        this.reloadDataTable();
        this.loadSelectedElement();
      });
    },

    generateResult() {
      if ("pixmap" === this.radioType) return ThemeParser.getPixmaps();
      if ("themeElement" === this.radioType) return ThemeParser.getThemeElements();
      if ("color" === this.radioType) return ThemeParser.getColors(true);
    },

    generateHeaders() {
      if ("pixmap" === this.radioType) return [
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
      else if ("themeElement" === this.radioType) return [
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
      else if ("color" === this.radioType) return [
        {
          title: "ID",
          key: 'id',
          align: 'left',
          width: '400px'
        }, {
          title: 'Red',
          key: 'red',
          value: color => color.resolveRed(),
          align: 'left',
        }, {
          title: 'Green',
          key: 'green',
          value: color => color.resolveGreen(),
          align: 'left',
        }, {
          title: 'Blue',
          key: 'blue',
          value: color => color.resolveBlue(),
          align: 'left',
        }, {
          title: 'Alpha',
          key: 'alpha',
          value: color => color.resolveAlpha(),
          align: 'left',
        }, {
          title: 'Hex',
          key: 'hex',
          value: color => color.resolveHex(),
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
      selectedElement = element.id;
      localStorage.setItem(localStorageElementSelected, selectedElement);
      if ("pixmap" === this.radioType) {
        this.currentPixmap = element;
      } else if ("themeElement" === this.radioType) {
        this.currentThemeElement = element;
      } else if ("color" === this.radioType) {
        this.currentColor = element;
      }
    }
  }
}
</script>
