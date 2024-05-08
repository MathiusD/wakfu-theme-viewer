export const localStorageThemeKey = 'theme';
export const localStorageVCardVariant = "vCardVariant";
export const localStorageJsonThemeData = 'jsonThemeData';
export const localStorageJsonThemeDataLastFetch = "jsonThemeDataLastFetch";
export const localStorageTextureKey = "texture";
export const localStorageRadioTypeSelected = "radioTypeSelected";
export const localStorageElementSelected = "elementSelected";
export const localStorageColorFormatSelected = "colorFormatSelected";
export const localStorageDataViewerPosition = "dataViewerPosition";

// Cf here : https://stackoverflow.com/questions/56393880/how-do-i-detect-dark-mode-using-javascript
export const defaultWindowTheme = () => {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Return an byte number from decimal
 * @param {Number} number number must be in [0-1]
 * @returns byte
 */
export const decimalToByte = (number) => {
    return Math.round(number * 255);
}

/**
 * Return an hexadecimal number from byte
 * @param {Number} byte byte must be in [0-255]
 * @returns hex
 */
export const byteToHex = (byte) => {
    return byte.toString(16);
}

/**
 * Return an hexadecimal number with two digit and upper case
 * @param {string} hex hexadecimal value in [0-FF]
 * @returns hex
 */
export const formatHex = (hex) => {
    return (hex.length === 1 ? "0" + hex : hex).toUpperCase();
}

/**
 * Convert rgba color to hexadecimal representation
 * @param {Number} red must be in [0-255]
 * @param {Number} green must be in [0-255]
 * @param {Number} blue must be in [0-255]
 * @param {Number} alpha (optionnal) must be in [0-100]
 * @returns hex
 */
export const RGBAToHexA = (red, green, blue, alpha = null) => {
    let redHex = byteToHex(red);
    let greenHex = byteToHex(green);
    let blueHex = byteToHex(blue);
    let alphaHex = alpha != null ? byteToHex(decimalToByte(alpha / 100)) : null;
    return (
      "#" +
      formatHex(redHex) +
      formatHex(greenHex) +
      formatHex(blueHex) +
      (alphaHex != null ? formatHex(alphaHex) : "")
    );
};

/**
 * Format float with maximum n digit
 * @param {Number} float float to format
 * @param {Number} digit max digit expected in final number
 * @returns number formated
 */
export const floatWithMaxDigit = (float, digit) => {
    return parseFloat(float.toFixed(2));
}