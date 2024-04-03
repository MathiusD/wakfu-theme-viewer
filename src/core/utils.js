export const localStorageThemeKey = 'theme';
export const localStorageVCardVariant = "vCardVariant";
export const localStorageJsonThemeData = 'jsonThemeData';
export const localStorageJsonThemeDataLastFetch = "jsonThemeDataLastFetch";
export const localStorageTextureKey = "texture";
export const localStorageRadioTypeSelected = "radioTypeSelected";
export const localStorageElementSelected = "elementSelected";

// Cf here : https://stackoverflow.com/questions/56393880/how-do-i-detect-dark-mode-using-javascript
export const defaultWindowTheme = () => {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}