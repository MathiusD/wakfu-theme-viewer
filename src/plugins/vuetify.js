import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    // Cf here : https://stackoverflow.com/questions/56393880/how-do-i-detect-dark-mode-using-javascript
    dark:
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches,
  },
});
