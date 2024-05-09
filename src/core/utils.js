export const localStorageThemeKey = 'theme';
export const localStorageVCardVariant = "vCardVariant";
export const localStorageJsonThemeData = 'jsonThemeData';
export const localStorageJsonThemeDataLastFetch = "jsonThemeDataLastFetch";
export const localStorageTextureKey = "texture";
export const localStorageRadioTypeSelected = "radioTypeSelected";
export const localStorageElementSelected = "elementSelected";
export const localStorageColorFormatSelected = "colorFormatSelected";
export const localStorageDataViewerPosition = "dataViewerPosition";
export const localStorageCustomColors = "customColors";

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
 * @param {Number} alpha (optional) must be in [0-100]
 * @returns hex
 */
export const RGBAToHexA = (red, green, blue, alpha = null) => {
    let redHex = byteToHex(red);
    let greenHex = byteToHex(green);
    let blueHex = byteToHex(blue);
    let alphaHex = alpha != null && alpha != 100 ? byteToHex(decimalToByte(alpha / 100)) : null;
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
    return parseFloat(float.toFixed(digit));
}

/**
 * Format color as rgba colors.xml declaration
 * @param {Number} red must be in [0-255]
 * @param {Number} green must be in [0-255]
 * @param {Number} blue must be in [0-255]
 * @param {Number} alpha (optional) must be in [0-100]
 * @returns r,g,b(,a)?
 */
export const RGBAToWakfuColor = (red, green, blue, alpha = null) => {
    let colorCode = floatWithMaxDigit(red / 255, 2) + ','
        + floatWithMaxDigit(green / 255, 2) + ','
        + floatWithMaxDigit(blue / 255, 2);
    if (alpha && alpha != 100) {
        colorCode += ',' + floatWithMaxDigit(alpha / 100, 2);
    }
    return colorCode;
}

/**
 * Format color as wakfu colors.xml declaration
 * @param {Number} red must be in [0-255]
 * @param {Number} green must be in [0-255]
 * @param {Number} blue must be in [0-255]
 * @param {Number} alpha (optional) must be in [0-100]
 * @param {boolean} useHex  (optional) if color declaration have hex format or rbga format
 * @returns r,g,b(,a)?/hex
 */
export const colorToWakfuColor = (red, green, blue, alpha = null, useHex = true) => {
    if (useHex) {
        return RGBAToHexA(red, green, blue, alpha);
    } else {
        return RGBAToWakfuColor(red, green, blue, alpha);
    }
}

/**
 * Format color as colors.xml declaration
 * @param {String} name color identifier
 * @param {String} colorCode color wakfu code (r,g,b(,a)?|hex|colorRef(@a)?)
 * @returns color declaration
 */
export const colorDeclaration = (name, colorCode) => {
    return '<color id="' + name + '" color="' + colorCode + '" />';
}