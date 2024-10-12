<template>
  <v-card class="ma-2">
    <v-btn :href="currentColors" target="_blank" download="colors.xml">
      Generate current colors.xml
    </v-btn>
    <v-btn :href="currentColorsWithoutRedundant" target="_blank" download="colors.xml">
      Generate current colors.xml (Without redundant)
    </v-btn>
    <v-btn :href="originalColors" target="_blank" download="colors.xml">
      Generate default colors.xml
    </v-btn>
    <v-btn @click="resetCustomColors">
      Reset custom colors
    </v-btn>
  </v-card>
</template>

<script>
import { ThemeParser } from "../core/theme-parser.js";
import { localStorageColorFormatSelected } from "../core/utils.js";

export default {
  name: 'ColorsUtils',

  props: ['colorsRefreshFunction'],

  methods: {
    generateColorsXml(originalOnly = false, excludeRedundant = false) {
      let colorFormatSelected = localStorage.getItem(localStorageColorFormatSelected);
      let useHex = colorFormatSelected != null ? colorFormatSelected == 'hexa' : false;

      let stringify = "<?xml version=\"1.0\" encoding \"utf-8\"?>\n";
      stringify += "<colors>\n";
      ThemeParser.getColors().forEach(color => {
        if (
          !originalOnly &&
          excludeRedundant &&
          !ThemeParser.colorIsOverrided(color.id)
        ) return;

        stringify += '\t' + color.resolveColorDeclaration(useHex, originalOnly) + "\n";
      });
      stringify += "<colors/>\n";
      let data = new Blob([stringify], { type: "application/xml" });
      return window.URL.createObjectURL(data);
    },
    resetCustomColors() {
      ThemeParser.clearCustomColors();
      this.colorsRefreshFunction();
    },
  },
  computed: {
    currentColors() {
      return this.generateColorsXml();
    },
    currentColorsWithoutRedundant() {
      return this.generateColorsXml(false, true);
    },
    originalColors() {
      return this.generateColorsXml(true);
    }
  }

}
</script>
