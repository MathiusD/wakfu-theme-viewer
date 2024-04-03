export const localStorageThemeKey = 'theme';
export const localStorageVCardVariant = "vCardVariant";

// Cf here : https://stackoverflow.com/questions/56393880/how-do-i-detect-dark-mode-using-javascript
export const defaultWindowTheme = () => {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}