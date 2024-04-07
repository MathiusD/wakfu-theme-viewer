<template>
  <div class="ma-6">
    <v-row>
      <v-col col="7" class="w-50">
        <v-card :variant="vCardVariant">
          <v-card-title class="d-flex flex-row">
            <v-radio-group v-model="radioType" inline>
              <v-radio label="Pixmap" value="pixmap" />
              <v-radio label="Theme Element" value="themeElement" />
              <v-radio label="Color" value="color" />
              <v-radio label="App Skin Part" value="appSkinPart" />
            </v-radio-group>
            <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line />
            <v-btn @click="reloadThemeData()" icon="mdi-refresh" />
          </v-card-title>
          <v-data-table :headers="headers" :items="result" v-model:search="search" @click:row="pickElement" dense>
            <template v-slot:item.pixmaps="{ item }">
              <div v-if="item.pixmaps && item.pixmaps.length > 0">
                {{ item.pixmaps.length }} ({{ item.pixmaps.filter(p => p.id).length }} named)
              </div>
            </template>
            <template v-slot:item.usage="{ item }">
              <div v-if="item.usage && item.usage.length > 0">
                {{ item.usage.length }}
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
      <v-col col="6" :class="dataViewerClass">
        <Pixmap v-if="'pixmap' === radioType && currentPixmap" :pixmap="currentPixmap" :vCardVariant="vCardVariant" />
        <ThemeElement v-else-if="'themeElement' === radioType && currentThemeElement"
          :theme-element="currentThemeElement" :vCardVariant="vCardVariant" />
        <Color v-else-if="'color' === radioType && currentColor" :color="currentColor" :vCardVariant="vCardVariant" />
        <AppSkinPart v-else-if="'appSkinPart' === radioType && currentAppSkinPart" :appSkinPart="currentAppSkinPart"
          :vCardVariant="vCardVariant" />
      </v-col>
    </v-row>

  </div>
</template>

<script>
import { ThemeParser } from "../core/theme-parser.js";
import Pixmap from "./Pixmap.vue";
import ThemeElement from "./ThemeElement.vue";
import Color from "./Color.vue";
import AppSkinPart from "./AppSkinPart.vue";

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
  } else if (radioType == 'appSkinPart') {
    return "BorderTop";
  }
}
if (!selectedElement) {
  selectedElement = getDefaultElementPerRadioType(selectedRadioType);
}

const getDataViewerClass = (dataViewerPosition) => {
  return dataViewerPosition == 'sticky' ? 'w-50 data-visualiser-sticky' : 'w-50';
}

export default {
  name: 'ThemeViewer',

  props: ['vCardVariant', 'dataViewerPosition'],

  components: {
    Pixmap,
    ThemeElement,
    Color,
    AppSkinPart,
  },

  mounted() {
    ThemeParser.loadTheme().then(() => {
      this.loaded = true;
      this.reloadDataTable();
      this.loadSelectedElement();
    });
    this.dataViewerClass = getDataViewerClass(this.dataViewerPosition);
  },

  data: () => ({
    components: [],
    currentColor: undefined,
    currentPixmap: undefined,
    currentThemeElement: undefined,
    currentAppSkinPart: undefined,
    headers: [],
    result: undefined,
    loaded: false,
    radioType: selectedRadioType,
    search: "",
    dataViewerClass: "",
  }),

  watch: {
    radioType() {
      localStorage.setItem(localStorageRadioTypeSelected, this.radioType);
      this.reloadDataTable();
      selectedElement = getDefaultElementPerRadioType(this.radioType);
      this.loadSelectedElement();
    },
    dataViewerPosition() {
      this.dataViewerClass = getDataViewerClass(this.dataViewerPosition);
    },
  },

  methods: {
    loadSelectedElement() {
      if (this.radioType == 'pixmap') {
        this.currentPixmap = ThemeParser.getPixmap(selectedElement);
      } else if (this.radioType == 'themeElement') {
        this.currentThemeElement = ThemeParser.getThemeElement(selectedElement);
      } else if (this.radioType == 'color') {
        this.currentColor = ThemeParser.getColor(selectedElement);
      } else if (this.radioType == 'appSkinPart') {
        this.currentAppSkinPart = ThemeParser.getAppSkinPart(selectedElement);
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
      if ("color" === this.radioType) return ThemeParser.getColors();
      if ("appSkinPart" == this.radioType) return ThemeParser.getAppSkinParts();
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
          key: 'usage',
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
          key: 'pixmaps',
          value: themeElement => themeElement.pixmaps.map(pixmap => pixmap.id),
          align: 'left',
        }, {
          title: 'Usage',
          key: 'usage',
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
          key: 'usage',
          align: 'left',
        }, {
          title: 'Color Used',
          key: 'colorUsed',
          align: 'left',
        }
      ]
      else if ("appSkinPart" == this.radioType) return [
        {
          title: "ID",
          key: "id",
        }, {
          title: "Path",
          key: "path",
        }
      ]
    },

    pickElement(event, data) {
      let element = data.item;
      let selectedElement;
      selectedElement = element.id;
      localStorage.setItem(localStorageElementSelected, selectedElement);
      if ("pixmap" === this.radioType) {
        this.currentPixmap = element;
      } else if ("themeElement" === this.radioType) {
        this.currentThemeElement = element;
      } else if ("color" === this.radioType) {
        this.currentColor = element;
      } else if ("appSkinPart" === this.radioType) {
        this.currentAppSkinPart = element;
      }
    },
  }
}
</script>

<style scoped>
.data-visualiser-sticky> :not(.not-sticky) {
  position: sticky;
  top: 1.5vh;
}
</style>