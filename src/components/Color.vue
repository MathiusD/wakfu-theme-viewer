<template>
  <v-card class="ma-2">
    <v-card-title>{{ color.id }}</v-card-title>
    <v-card-text>
      <v-color-picker
          class="ma-2"
          hide-mode-switch
          mode="rgba"
          v-model="colorObject"
          disabled
      ></v-color-picker>
      Since : {{ color.since }} <br/>
      <span v-if="color.usage">Usage : {{ color.usage.join(", ") }}</span>
      <span v-if="color.colorUsed">ColorUsed : {{ color.colorUsed }}</span>
    </v-card-text>
  </v-card>
</template>

<script>

export default {
  name: 'Color',
  props: ['color'],

  computed: {
    colorObject() {
      return {
        r: this.color.resolvedRed,
        g: this.color.resolvedGreen,
        b: this.color.resolvedBlue,
        a: this.color.resolvedAlpha,
      };
    }
  }

}
</script>
