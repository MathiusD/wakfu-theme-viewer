/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
import * as components from "vuetify/components";

// Composables
import { createVuetify } from "vuetify";

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  components: {
    ...components,
  },
  theme: {
    // Cf here : https://stackoverflow.com/questions/56393880/how-do-i-detect-dark-mode-using-javascript
    defaultTheme:
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light",
  },
  defaults: {
    VCard: {
      variant: "tonal",
    },
  },
});
