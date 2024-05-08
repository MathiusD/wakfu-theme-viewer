<template>
  <v-card class="ma-2" :variant="vCardVariant">
    <v-card-title>{{ color.id }}</v-card-title>
    <v-card-text>
      <v-color-picker class="ma-2" v-model="colorObject" v-model:mode="mode" :modes="modes" hide-mode-switch disabled>
      </v-color-picker>
      <v-select class="ma-2" v-model="mode" :items="modes" style="max-width: 300px" />
      <v-text-field
        v-model="colorDeclaration"
        append-inner-icon="mdi-content-copy"
        label="Color declaration"
        type="text"
        variant="outlined"
        readonly
        @click:append-inner="copyColorDeclaration"
      ></v-text-field>
      Since : {{ color.since }} <br />
      <span v-if="color.colorUsed">ColorUsed : {{ color.colorUsed }}</span>
      <Usage v-if="color.usage" :usage="color.usage" />
    </v-card-text>
  </v-card>
</template>

<script>
import Usage from "./Usage.vue";
import { localStorageColorFormatSelected } from '../core/utils.js';

let colorFormatSelected = localStorage.getItem(localStorageColorFormatSelected);
colorFormatSelected = colorFormatSelected != null ? colorFormatSelected : "rbga";

export default {
  name: 'Color',
  props: ['color', 'vCardVariant'],
  components: { Usage },

  data: () => ({
    modes: ['rgba', 'hexa'],
    mode: colorFormatSelected,
    colorDeclaration: null,
  }),

  mounted() {
    this.refreshColorDeclaration();
  },

  watch: {
    mode() {
      localStorage.setItem(localStorageColorFormatSelected, this.mode);
      this.refreshColorDeclaration();
    },
    color() {
      this.refreshColorDeclaration();
    }
  },

  computed: {
    colorObject() {
      return {
        r: this.color.resolveRed(),
        g: this.color.resolveGreen(),
        b: this.color.resolveBlue(),
        a: this.color.resolveAlpha() / 100,
      };
    },
  },

  methods: {
    refreshColorDeclaration() {
      this.colorDeclaration = this.color.resolveColorDeclaration(this.mode == 'hexa');
    },
    async copyColorDeclaration() {
      await navigator.clipboard.writeText(this.colorDeclaration);
    },
  }

}
</script>
