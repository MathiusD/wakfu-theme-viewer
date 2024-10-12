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
          <ColorsUtils :key="colorKey" v-if="'color' === radioType"
            :colorsRefreshFunction="forceReRenderOfEachColors" />
          <v-data-table class="theme-viewer" :headers="headers" :items="result" v-model:search="search" v-model:page="page"
            v-model:items-per-page="pageSize" @update:currentItems="setupFirstPage" @update:page="onPageUpdate"
            @update:itemsPerPage="onPageSizeUpdate" @click:row="pickElement" dense :row-props="itemRawProps">
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
            <template v-slot:item.textures="{ item }">
              <div v-if="item.pixmaps && item.pixmaps.length > 0">
                {{ [...new Set(item.pixmaps.filter(p => p.texture).map(p => p.texture))].length }} distinct textures
              </div>
            </template>
            <template v-slot:item.red="{ item }">
              <div v-if="item && !item.colorIsOverrided()">
                {{ item.resolveRed() }}
              </div>
              <v-tooltip v-else :text="'default value : ' + item.resolveRed(true)" location="bottom">
                <template v-slot:activator="{ props }">
                  <div v-bind="props">{{ item.resolveRed(false) }}</div>
                </template>
              </v-tooltip>
            </template>
            <template v-slot:item.green="{ item }">
              <div v-if="item && !item.colorIsOverrided()">
                {{ item.resolveGreen() }}
              </div>
              <v-tooltip v-else :text="'default value : ' + item.resolveGreen(true)" location="bottom">
                <template v-slot:activator="{ props }">
                  <div v-bind="props">{{ item.resolveGreen(false) }}</div>
                </template>
              </v-tooltip>
            </template>
            <template v-slot:item.blue="{ item }">
              <div v-if="item && !item.colorIsOverrided()">
                {{ item.resolveBlue() }}
              </div>
              <v-tooltip v-else :text="'default value : ' + item.resolveBlue(true)" location="bottom">
                <template v-slot:activator="{ props }">
                  <div v-bind="props">{{ item.resolveBlue(false) }}</div>
                </template>
              </v-tooltip>
            </template>
            <template v-slot:item.alpha="{ item }">
              <div v-if="item && !item.colorIsOverrided()">
                {{ item.resolveAlpha() }}
              </div>
              <v-tooltip v-else :text="'default value : ' + item.resolveAlpha(true)" location="bottom">
                <template v-slot:activator="{ props }">
                  <div v-bind="props">{{ item.resolveAlpha(false) }}</div>
                </template>
              </v-tooltip>
            </template>
            <template v-slot:item.hex="{ item }">
              <div v-if="item && !item.colorIsOverrided()">
                {{ item.resolveHex() }}
              </div>
              <v-tooltip v-else :text="'default value : ' + item.resolveHex(true)" location="bottom">
                <template v-slot:activator="{ props }">
                  <div v-bind="props">{{ item.resolveHex(false) }}</div>
                </template>
              </v-tooltip>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
      <v-col col="6" :class="dataViewerClass">
        <Pixmap v-if="'pixmap' === radioType && currentPixmap" :pixmap="currentPixmap" :vCardVariant="vCardVariant" />
        <ThemeElement v-else-if="'themeElement' === radioType && currentThemeElement"
          :theme-element="currentThemeElement" :vCardVariant="vCardVariant" />
        <Color :key="colorElementKey" v-else-if="'color' === radioType && currentColor" :color="currentColor"
          :vCardVariant="vCardVariant" :colorRefreshFunction="forceReRenderOfColors" />
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
import ColorsUtils from "./ColorsUtils.vue";
import { ref, watch } from "vue";

import {
  localStorageElementSelected, localStorageRadioTypeSelected,
  localStorageCurrentSearch, localStorageCurrentPage, localStorageCurrentPageSize
} from '../core/utils.js';

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

let currentSearch = localStorage.getItem(localStorageCurrentSearch);
currentSearch = currentSearch != null ? currentSearch : "";
const search = ref(currentSearch);

watch(search, (newValue, oldValue) => {
  localStorage.setItem(localStorageCurrentSearch, newValue);
});

let firstPageSetup = false;

export default {
  name: 'ThemeViewer',

  props: ['vCardVariant', 'dataViewerPosition'],

  components: {
    Pixmap,
    ThemeElement,
    Color,
    AppSkinPart,
    ColorsUtils,
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
    search: search,
    page: ref(1),
    pageSize: ref(10),
    dataViewerClass: "",
    colorKey: ref(0),
    colorElementKey: ref(0),
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
        this.currentColor = ThemeParser.getColor(selectedElement, false);
      } else if (this.radioType == 'appSkinPart') {
        this.currentAppSkinPart = ThemeParser.getAppSkinPart(selectedElement);
      }
    },

    reloadDataTable() {
      this.reloadDataHeader();
      this.result = this.generateResult();
    },

    reloadDataHeader() {
      this.headers = this.generateHeaders();
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
        }, {
          title: 'Textures',
          key: 'textures',
          value: themeElement => themeElement.pixmaps.map(pixmap => pixmap.texture),
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
          value: color => {
            return [
              color.resolveRed(true),
              color.resolveRed(false)
            ]
          },
          align: 'left',
        }, {
          title: 'Green',
          key: 'green',
          value: color => {
            return [
              color.resolveGreen(true),
              color.resolveGreen(false)
            ]
          },
          align: 'left',
        }, {
          title: 'Blue',
          key: 'blue',
          value: color => {
            return [
              color.resolveBlue(true),
              color.resolveBlue(false)
            ]
          },
          align: 'left',
        }, {
          title: 'Alpha',
          key: 'alpha',
          value: color => {
            return [
              color.resolveAlpha(true),
              color.resolveAlpha(false)
            ]
          },
          align: 'left',
        }, {
          title: 'Hex',
          key: 'hex',
          value: color => {
            return [
              color.resolveHex(true),
              color.resolveHex(false)
            ]
          },
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

    itemRawProps({ item }) {
      let selected = item && (item == this.currentAppSkinPart || item == this.currentColor || item == this.currentThemeElement || item == this.currentPixmap);
      let customised = item && "color" === this.radioType && item.colorIsOverrided();
      if (selected && customised) {
        return { class: "selected customised" }
      } else if (selected) {
        return { class: "selected" }
      } else if (customised) {
        return { class: "customised" }
      } else {
        return { class: "" }
      }
    },

    forceReRenderOfColors() {
      this.colorKey += 1;
      // To reload value of r,g,b,a,hex of colors in table
      this.reloadDataHeader();
    },

    forceReRenderOfEachColors() {
      this.forceReRenderOfColors();
      this.colorElementKey += 1;
    },

    setupFirstPage() {
      // Already setup
      if (firstPageSetup) return;

      let currentPageSize = localStorage.getItem(localStorageCurrentPageSize);
      if (currentPageSize != null) {
        this.pageSize = currentPageSize;
      }

      let currentPage = localStorage.getItem(localStorageCurrentPage);
      if (currentPage != null) {
        this.page = currentPage;
      }

      firstPageSetup = true;
    },

    onPageUpdate(pageNumber) {
      // Not setup for now
      if (!firstPageSetup) return;

      localStorage.setItem(localStorageCurrentPage, pageNumber);
    },

    onPageSizeUpdate(pageSize) {
      // Not setup for now
      if (!firstPageSetup) return;

      localStorage.setItem(localStorageCurrentPageSize, pageSize);
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

<style>
.theme-viewer .selected * {
  font-weight: bold;
}
.theme-viewer .customised * {
  font-style: italic;
}
.v-theme--dark .theme-viewer .selected * {
  background-color: rgb(15, 15, 15);
}
.v-theme--light .theme-viewer .selected * {
  background-color: rgb(235, 235, 235);
}
</style>