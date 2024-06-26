import { getImage, getJson } from "./requester.js";
import {
    RGBAToHexA,
    localStorageJsonThemeData,
    localStorageJsonThemeDataLastFetch,
    colorToWakfuColor,
    colorDeclaration,
} from "./utils.js";

const cdnUrl = "https://wakfu.cdn.ankama.com/gamedata/";
const themeUrl = `${cdnUrl}theme/theme.json`;
const themeImagePath = (name) => `${cdnUrl}theme/images/${name}.png`;
const themeImageFileName = (path) => (path.split('theme/images/'))[1].split('.tga')[0];
const themeSkinPartFileName = (path) => (path.split('theme/appSkin/'))[1].split('.png')[0];

const cacheResultDuration = 1800000; // 30 min

class ThemeParserClass {
    _theme = undefined;
    _textures = new Map();
    _pixmaps = new Map();
    _colors = new Map();
    _themeElements = new Map();
    _appSkinParts = new Map();

    /**
     * Load and resolve theme
     *  - From localStorage if isn't expired
     *  - From wakfu.cdn othewise
     * @param {boolean} force To force reload of theme from cdn
     * @returns promise or load, empty promise if theme is already loaded
     */
    loadTheme(force = false) {
        if (!force) {
            if (this._theme != null) return new Promise(resolve => { resolve(); });

            let localStorageTheme = localStorage.getItem(localStorageJsonThemeData);
            let localStorageThemeLastFetch = localStorage.getItem(localStorageJsonThemeDataLastFetch);

            if (localStorageTheme != null && localStorageThemeLastFetch != null &&
                    Date.now() - localStorageThemeLastFetch <= cacheResultDuration) {
                return new Promise(resolve => {
                    this._theme = JSON.parse(localStorageTheme);
                    this.loadTextures().then(() => {
                        this.loadPixmaps();
                        this.loadColors();
                        this.loadThemeElements();
                        this.loadAppSkinParts();
                        resolve();
                    });
                });
            }
        }

        return new Promise(resolve => {
            getJson(themeUrl).then(result => {
                this._theme = result;
                localStorage.setItem(localStorageJsonThemeDataLastFetch, Date.now());
                localStorage.setItem(localStorageJsonThemeData, JSON.stringify(this._theme));
                this.loadTextures().then(() => {
                    this.loadPixmaps();
                    this.loadColors();
                    this.loadThemeElements();
                    this.loadAppSkinParts();
                    resolve();
                })
            })
        });
    }

    /**
     * Load an resolve each texture of theme
     * @returns promise of load of all textures
     */
    loadTextures() {
        return new Promise(resolve => {
            const promises = []
            for (const texture of this._theme.textures) {
                const texturePathName = themeImageFileName(texture.path);
                const futureImage = getImage(themeImagePath(texturePathName));
                futureImage.then(result => {
                    this._textures.set(texture.id, result);
                    this._textures.set(texturePathName, result)
                });
                promises.push(futureImage)
            }
            Promise.all(promises).then(() => resolve());
        })
    }

    /**
     * Load each definition of pixmap
     */
    loadPixmaps() {
        for (const pixmap of this._theme.pixmaps) {
            pixmap.image = this._textures.get(pixmap.texture);
            this._pixmaps.set(pixmap.id, pixmap);
        }
    }

    /**
     * Load each definition of colors
     * Colors loaded are some additional methods :
     *  * resolveRed
     *  * resolveGreen
     *  * resolveBlue
     *  * resolveAlpha
     *  * resolveHex
     */
    loadColors() {
        for (const color of this._theme.colors) {
            let newColor = {
                /**
                 * Resolve red component
                 * @returns red component of color
                 */
                resolveRed: () => {
                    return ThemeParser.getRedOfColor(color.id);
                },
                /**
                 * Resolve green component
                 * @returns green component of color
                 */
                resolveGreen: () => {
                    return ThemeParser.getBlueOfColor(color.id);
                },
                /**
                 * Resolve blue component
                 * @returns blue component of color
                 */
                resolveBlue: () => {
                    return ThemeParser.getGreenOfColor(color.id);
                },
                /**
                 * Resolve alpha
                 * @returns alpha of color
                 */
                resolveAlpha: () => {
                    return ThemeParser.getAlphaOfColor(color.id);
                },
                /**
                 * Resolve hex representation
                 * @returns hex representation of color
                 */
                resolveHex: () => {
                    return ThemeParser.getHexOfColor(color.id);
                },
                /**
                 * Resolve wakfu color declaration
                 * @param {bool} useHex color format must be hex or rgba
                 * @returns wakfu color declaration of color
                 */
                resolveColorDeclaration: (useHex = true) => {
                    return ThemeParser.getColorDeclaration(color.id, useHex);
                },
            };
            for (const key in color) {
                newColor[key] = color[key];
            }
            this._colors.set(color.id, newColor);
        }
    }

    /**
     * Load each theme elements
     */
    loadThemeElements() {
        for (const element of this._theme.themeElement) {
            // data copy
            const flattened = JSON.parse(JSON.stringify(element));
            flattened.pixmaps = [];
            this.flattenThemeElement(flattened, element)
            this._themeElements.set(element.id, flattened)
        }
    }

    /**
     * Resolve each pixmap of theme element
     * @param {any} flattened JSON of theme element without pixmaps
     * @param {any} element JSON of theme element with all args
     */
    flattenThemeElement(flattened, element) {
        if(element.specificPixmaps != null) {
            for (const pixmap of element.specificPixmaps) {
                pixmap.image = this._textures.get(pixmap.texture);
                flattened.pixmaps.push(pixmap);
            }
        }

        if(element.childrenThemeElements != null) {
            for (const sub of element.childrenThemeElements) {
                this.flattenThemeElement(flattened, sub);
            }
        }
    }

    /**
     * Load each app skin parts
     */
    loadAppSkinParts() {
        for (const _appSkinPart of this._theme.appSkinParts) {
            // data copy
            let appSkinPart = JSON.parse(JSON.stringify(_appSkinPart));
            appSkinPart.id = themeSkinPartFileName(appSkinPart.path);
            appSkinPart.assetUrl = `${cdnUrl}${appSkinPart.path}`;
            this._appSkinParts.set(appSkinPart.id, appSkinPart);
        }
    }

    /**
     * To get all pixmaps
     * @returns array of pixmaps
     */
    getPixmaps() {
        return Array.from(this._pixmaps.values());
    }

    /**
     * To get all colors
     * @returns array of color
     */
    getColors() {
        return Array.from(this._colors.values());
    }

    /**
     * To get all theme elements
     * @returns array of theme elements
     */
    getThemeElements() {
        return Array.from(this._themeElements.values());
    }

    /**
     * To get all app skin parts
     * @returns array of app skin parts
     */
    getAppSkinParts() {
        return Array.from(this._appSkinParts.values());
    }

    /**
     * Get specific pixmap by id
     * @param {String} name id of pixmap
     * @returns pixmap related, null otherwise
     */
    getPixmap(name) {
        return this._pixmaps.get(name);
    }

    /**
     * Get specific theme element by id
     * @param {String} name id of theme element
     * @returns theme element related, null otherwise
     */
    getThemeElement(name) {
        return this._themeElements.get(name);
    }

    /**
     * Get specific app skin part by id
     * @param {String} name id of app skin part
     * @returns app skin part related, null otherwise
     */
    getAppSkinPart(name) {
        return this._appSkinParts.get(name);
    }

    /**
     * Get specific color by id
     * @param {String} name id of color
     * @returns color related, null otherwise
     */
    getColor(name) {
        return this._colors.get(name);
    }

    /**
     * Resolve red component of color
     * @param {String} name id of color
     * @returns red component, null if color isn't exist
     */
    getRedOfColor(name) {
        let color = this._colors.get(name);
        if (color.colorUsed) {
            return this.getRedOfColor(color.colorUsed);
        } else if (color != null) {
            return color.red;
        } else {
            return null;
        }
    }

    /**
     * Resolve green component of color
     * @param {String} name id of color
     * @returns green component, null if color isn't exist
     */
    getGreenOfColor(name) {
        let color = this._colors.get(name);
        if (color.colorUsed) {
            return this.getGreenOfColor(color.colorUsed);
        } else if (color != null) {
            return color.green;
        } else {
            return null;
        }
    }

    /**
     * Resolve blue component of color
     * @param {String} name id of color
     * @returns blue component, null if color isn't exist
     */
    getBlueOfColor(name) {
        let color = this._colors.get(name);
        if (color.colorUsed) {
            return this.getBlueOfColor(color.colorUsed);
        } else if (color != null) {
            return color.blue;
        } else {
            return null;
        }
    }

    /**
     * Resolve alpha of color
     * @param {String} name id of color
     * @returns alpha, null if color isn't exist
     * (or alpha isn't specified)
     */
    getAlphaOfColor(name) {
        let color = this._colors.get(name);
        if (color.colorUsed && !color.alpha) {
            return this.getAlphaOfColor(color.colorUsed);
        } else if (color != null) {
            return color.alpha;
        } else {
            return null;
        }
    }

    /**
     * Resolve hex representation of color
     * @param {String} name id of color
     * @returns hex representation, null if color isn't exist
     */
    getHexOfColor(name) {
        let red = this.getRedOfColor(name);
        if (red == null) return null;

        let green = this.getGreenOfColor(name);
        if (green == null) return null;

        let blue = this.getBlueOfColor(name);
        if (blue == null) return null;

        let alpha = this.getAlphaOfColor(name);
        // Alpha isn't mandatory

        return RGBAToHexA(red, green, blue, alpha);
    }

    /**
     * Resolve wakfu color declaration of specific color
     * @param {String} name id of color
     * @param {bool} useHex color format must be hex or rgba
     * @returns wakfu color 
     */
    getColorDeclaration(name, useHex = true) {
        let color = this.getColor(name);
        let colorCode = '';
        if (color.colorUsed) {
            colorCode = color.colorUsed;
            if (color.alpha && color.alpha != 100) {
                colorCode += '@' + color.alpha / 100;
            }
        } else if (color) {
            colorCode = colorToWakfuColor(color.red, color.green, color.blue, color.alpha, useHex);
        } else {
            return null;
        }
        return colorDeclaration(name, colorCode);
    }
}

export const ThemeParser = new ThemeParserClass();