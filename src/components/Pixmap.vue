<template>
  <v-card class="ma-2" :variant="vCardVariant">
    <v-card-title>{{ pixmap.id }}</v-card-title>
    <v-card-subtitle>Texture : <a :href="`${pixmap.image.src}`" target="_blank">{{ pixmap.texture
        }}</a></v-card-subtitle>
    <v-card-text>
      <div class="ma-2">
        Position : {{ pixmap.position }} <br />
        Coords : {{ pixmap.x }};{{ pixmap.y }} <br />
        Size : {{ pixmap.width }};{{ pixmap.height }} <br />
        Since : {{ pixmap.since }} <br />
        {{ pixmap.flipHorizontally ? "Flipped horizontally. " : "" }}
        {{ pixmap.flipVertically ? "Flipped vertically" : "" }} <br />
        <Usage v-if="displayUsage" :usage="usage" />
      </div>
      <canvas ref="canvas" />
    </v-card-text>
  </v-card>
</template>

<script>
import Usage from './Usage.vue';

export default {
  name: 'Pixmap',
  components: { Usage },
  props: ['forcedUsages', 'pixmap', 'vCardVariant'],

  mounted() {
    this.refreshPixmap()
  },

  methods: {
    refreshPixmap() {
      const canvas = this.$refs['canvas'];
      const context = canvas.getContext('2d');
      const pixmap = this.pixmap;
      context.clearRect(0, 0, canvas.width, canvas.height);
      canvas.width = pixmap.width;
      canvas.height = pixmap.height;
      context.drawImage(pixmap.image, pixmap.x, pixmap.y, pixmap.width, pixmap.height, 0, 0, pixmap.width, pixmap.height);
    }
  },

  computed: {
    displayUsage() {
      return this.forcedUsages || (this.pixmap.usage && this.pixmap.usage.length > 0 && !this.forcedUsages);
    },
    usage() {
      return this.forcedUsages ? this.forcedUsages : this.pixmap.usage;
    },
  },

  watch: {
    pixmap() {
      this.refreshPixmap()
    }
  }
}
</script>