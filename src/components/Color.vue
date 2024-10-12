<template>
  <v-card class="ma-2" :variant="vCardVariant">
    <v-card-title>{{ color.id }}</v-card-title>
    <v-card-text>
      <v-color-picker class="ma-2" v-model="colorObject" v-model:mode="mode" :modes="modes" hide-mode-switch />
      <v-select class="ma-2" v-model="mode" :items="modes" style="max-width: 300px" />
      <v-btn class="ma-2" @click="clearColor()" text="Reset Color to default" />
      <v-text-field class="ma-2"
        v-model="colorDeclaration"
        append-inner-icon="mdi-content-copy"
        label="Color declaration"
        type="text"
        variant="outlined"
        readonly
        @click:append-inner="copyColorDeclaration"
      ></v-text-field>
      <v-text-field class="ma-2"
        v-model="defaultColorDeclaration"
        append-inner-icon="mdi-content-copy"
        label="Default Color declaration"
        type="text"
        variant="outlined"
        readonly
        @click:append-inner="copyDefaultColorDeclaration"
      ></v-text-field>
      <v-label class="ma-2">Since : {{ color.since }}</v-label><br />
      <v-label class="ma-2" v-if="color.colorUsed">ColorUsed : {{ color.colorUsed }}</v-label><br />
      <Usage v-if="color.usage" :usage="color.usage" />
    </v-card-text>
  </v-card>
</template>

<script>
import Usage from "./Usage.vue";
import { ThemeParser } from '../core/theme-parser.js';
import {
  localStorageColorFormatSelected, localStorageCustomColors,
  colorToWakfuColor, colorDeclaration
} from '../core/utils.js';

let colorFormatSelected = localStorage.getItem(localStorageColorFormatSelected);
colorFormatSelected = colorFormatSelected != null ? colorFormatSelected : "rbga";

let customColors = localStorage.getItem(localStorageCustomColors);
customColors = customColors != null ? JSON.parse(customColors) : {};

export default {
  name: 'Color',
  props: ['color', 'vCardVariant', 'colorRefreshFunction'],
  components: { Usage },

  data: () => ({
    modes: ['rgba', 'hexa'],
    mode: colorFormatSelected,
    colorObject: null,
    colorDeclaration: null,
    defaultColorDeclaration: null,
  }),

  mounted() {
    this.refreshColorAttributes();
  },

  watch: {
    mode() {
      localStorage.setItem(localStorageColorFormatSelected, this.mode);
      this.refreshColorDeclaration(false);
      // To refresh format used in generated file
      this.colorRefreshFunction();
    },
    color() {
      this.refreshColorAttributes();
    },
    colorObject() {
      this.refreshColorDeclaration(false, false);
      this.addCustomColor();
    },
  },

  methods: {
    addCustomColor() {
      let colorObject = {
        r: this.colorObject.r,
        g: this.colorObject.g,
        b: this.colorObject.b,
        a: this.colorObject.a
      };
      let color = this.colorAsColorObject();
      let isCustomColor = this.isCustomColor();
      // Because js == operator sucks
      if (!isCustomColor && colorObject.r == color.r && colorObject.g == color.g && colorObject.b == color.b && colorObject.a == color.a) {
        this.deleteCustomColor();
      } else {
        customColors[this.color.id] = colorObject;
        this.saveCustomColors();
        ThemeParser.addCustomColor(this.color.id, this.colorObject);
      }
    },
    deleteCustomColor() {
      ThemeParser.removeCustomColor(this.color.id);

      if (!Object.keys(customColors).includes(this.color.id)) return;

      delete customColors[this.color.id];
      this.saveCustomColors();
    },
    saveCustomColors() {
      localStorage.setItem(localStorageCustomColors, JSON.stringify(customColors));
      this.colorRefreshFunction();
    },
    clearColor() {
      this.deleteCustomColor();
      this.refreshColorAttributes(false);
    },
    refreshColorAttributes(extractSavedColor = true) {
      this.refreshColorObject();
      this.refreshColorDeclaration();
      if (extractSavedColor) {
        let savedColor = customColors[this.color.id];
        if (savedColor) {
          this.colorObject = savedColor;
        }
      }
    },
    colorAsColorObject() {
      return {
        r: this.color.resolveRed(),
        g: this.color.resolveGreen(),
        b: this.color.resolveBlue(),
        a: this.color.resolveAlpha() / 100,
      }
    },
    isCustomColor() {
      return this.color.colorIsOverrided();
    },
    refreshColorObject() {
      this.colorObject = this.colorAsColorObject();
    },
    refreshColorDeclaration(useDefault = true, formatDefault = true) {
      let useHexa = this.mode =='hexa';
      if (formatDefault) {
        this.defaultColorDeclaration = this.color.resolveColorDeclaration(useHexa, true);
      }
      if (useDefault) {
        this.colorDeclaration = this.color.resolveColorDeclaration(useHexa, false);
      } else {
        this.colorDeclaration = colorDeclaration(
          this.color.id,
          colorToWakfuColor(this.colorObject.r, this.colorObject.g, this.colorObject.b, this.colorObject.a * 100, useHexa)
        );
      }
    },
    async copyColorDeclaration() {
      await navigator.clipboard.writeText(this.colorDeclaration);
    },
    async copyDefaultColorDeclaration() {
      await navigator.clipboard.writeText(this.colorDefaultDeclaration);
    },
  }

}
</script>
