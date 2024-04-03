/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
import * as components from "vuetify/components";
import { localStorageThemeKey, defaultWindowTheme } from "../core/utils.js";

// Composables
import { createVuetify } from "vuetify";

let definedTheme = localStorage.getItem(localStorageThemeKey);

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  components: {
    ...components,
  },
  theme: {
    defaultTheme: definedTheme != null ? definedTheme : defaultWindowTheme(),
  }
});
