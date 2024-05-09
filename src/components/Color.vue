<template>
  <v-card class="ma-2" :variant="vCardVariant">
    <v-card-title>{{ color.id }}</v-card-title>
    <v-card-text>
      <v-color-picker class="ma-2" v-model="colorObject" v-model:mode="mode" :modes="modes" hide-mode-switch>
      </v-color-picker>
      <v-select class="ma-2" v-model="mode" :items="modes" style="max-width: 300px" />
      <v-btn @click="refreshColorAttributes()" text="Reset Color to default" />
      <v-text-field
        v-model="colorDeclaration"
        append-inner-icon="mdi-content-copy"
        label="Color declaration"
        type="text"
        variant="outlined"
        readonly
        @click:append-inner="copyColorDeclaration"
      ></v-text-field>
      <v-text-field
        v-model="defaultColorDeclaration"
        append-inner-icon="mdi-content-copy"
        label="Default Color declaration"
        type="text"
        variant="outlined"
        readonly
        @click:append-inner="copyDefaultColorDeclaration"
      ></v-text-field>
      Since : {{ color.since }} <br />
      <span v-if="color.colorUsed">ColorUsed : {{ color.colorUsed }}</span>
      <Usage v-if="color.usage" :usage="color.usage" />
    </v-card-text>
  </v-card>
</template>

<script>
import Usage from "./Usage.vue";
import { localStorageColorFormatSelected, colorToWakfuColor, colorDeclaration } from '../core/utils.js';

let colorFormatSelected = localStorage.getItem(localStorageColorFormatSelected);
colorFormatSelected = colorFormatSelected != null ? colorFormatSelected : "rbga";

export default {
  name: 'Color',
  props: ['color', 'vCardVariant'],
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
    },
    color() {
      this.refreshColorAttributes();
    },
    colorObject() {
      this.refreshColorDeclaration(false);
    }
  },

  methods: {
    refreshColorAttributes() {
      this.refreshColorObject();
      this.refreshColorDeclaration();
    },
    refreshColorObject() {
      this.colorObject = {
        r: this.color.resolveRed(),
        g: this.color.resolveGreen(),
        b: this.color.resolveBlue(),
        a: this.color.resolveAlpha() / 100,
      }
    },
    refreshColorDeclaration(useDefault = true) {
      let useHexa = this.mode =='hexa';
      if (useDefault) {
        this.defaultColorDeclaration = this.color.resolveColorDeclaration(useHexa);
        this.colorDeclaration = this.defaultColorDeclaration;
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
