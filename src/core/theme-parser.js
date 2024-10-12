import { getImage, getJson } from "./requester.js";
import {
    RGBAToHexA,
    localStorageJsonThemeData,
    localStorageJsonThemeDataLastFetch,
    colorToWakfuColor,
    colorDeclaration,
    localStorageCustomColors,
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
    _modifiedColors = new Map();
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
                        this.loadCustomColors();
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
                    this.loadCustomColors();
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
            let newColor = this.addMethodsOfColor(color);
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

    loadCustomColors() {
        let customColors = localStorage.getItem(localStorageCustomColors);
        customColors = customColors != null ? JSON.parse(customColors) : {};
        for (const name of Object.keys(customColors)) {
            ThemeParser.addCustomColor(name, customColors[name]);
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
     * @param {boolean} originalOnly must be resolve
     * only theme declaration or user defined declaration
     * @returns color related, null otherwise
     */
    getColor(name, originalOnly = false) {
        if (!originalOnly && this._modifiedColors.has(name)) {
            return this._modifiedColors.get(name);
        } else {
            return this._colors.get(name);
        }
    }

    /**
     * Add utility methods in new objects and copy attributes of colors supplied
     * @param {Object} color color object with at least, id, red, green, blue
     * @returns color copy with utility methods
     */
    addMethodsOfColor(color) {
        let newColor = {
            /**
             * Resolve red component
             * @param {boolean} originalOnly must be resolve
             * only theme declaration or user defined declaration
             * @returns red component of color
             */
            resolveRed: (originalOnly = false) => {
                return ThemeParser.getRedOfColor(color.id, originalOnly);
            },
            /**
             * Resolve green component
             * @param {boolean} originalOnly must be resolve
             * only theme declaration or user defined declaration
             * @returns green component of color
             */
            resolveGreen: (originalOnly = false) => {
                return ThemeParser.getGreenOfColor(color.id, originalOnly);
            },
            /**
             * Resolve blue component
             * @param {boolean} originalOnly must be resolve
             * only theme declaration or user defined declaration
             * @returns blue component of color
             */
            resolveBlue: (originalOnly = false) => {
                return ThemeParser.getBlueOfColor(color.id, originalOnly);
            },
            /**
             * Resolve alpha
             * @param {boolean} originalOnly must be resolve
             * only theme declaration or user defined declaration
             * @returns alpha of color
             */
            resolveAlpha: (originalOnly = false) => {
                return ThemeParser.getAlphaOfColor(color.id, originalOnly);
            },
            /**
             * Resolve hex representation
             * @param {boolean} originalOnly must be resolve
             * only theme declaration or user defined declaration
             * @returns hex representation of color
             */
            resolveHex: (originalOnly = false) => {
                return ThemeParser.getHexOfColor(color.id, originalOnly);
            },
            /**
             * Resolve wakfu color declaration
             * @param {bool} useHex color format must be hex or rgba
             * @param {boolean} originalOnly must be resolve
             * @returns wakfu color declaration of color
             */
            resolveColorDeclaration: (useHex = true, originalOnly = false) => {
                return ThemeParser.getColorDeclaration(color.id, useHex, originalOnly);
            },
            /**
             * To known if color is overrided
             * @returns true of color have custom definition
             * false otherwise
             */
            colorIsOverrided: () => {
                return ThemeParser.colorIsOverrided(color.id);
            },
        };
        for (const key in color) {
            newColor[key] = color[key];
        }
        return newColor;
    }

    /**
     * Resolve red component of color
     * @param {String} name id of color
     * @param {boolean} originalOnly must be resolve
     * only theme declaration or user defined declaration
     * @returns red component, null if color isn't exist
     */
    getRedOfColor(name, originalOnly = false) {
        let color = this.getColor(name, originalOnly);
        if (color.colorUsed) {
            return this.getRedOfColor(color.colorUsed, originalOnly);
        } else if (color != null) {
            return color.red;
        } else {
            return null;
        }
    }

    /**
     * Resolve green component of color
     * @param {String} name id of color
     * @param {boolean} originalOnly must be resolve
     * only theme declaration or user defined declaration
     * @returns green component, null if color isn't exist
     */
    getGreenOfColor(name, originalOnly = false) {
        let color = this.getColor(name, originalOnly);
        if (color.colorUsed) {
            return this.getGreenOfColor(color.colorUsed, originalOnly);
        } else if (color != null) {
            return color.green;
        } else {
            return null;
        }
    }

    /**
     * Resolve blue component of color
     * @param {String} name id of color
     * @param {boolean} originalOnly must be resolve
     * only theme declaration or user defined declaration
     * @returns blue component, null if color isn't exist
     */
    getBlueOfColor(name, originalOnly = false) {
        let color = this.getColor(name, originalOnly);
        if (color.colorUsed) {
            return this.getBlueOfColor(color.colorUsed, originalOnly);
        } else if (color != null) {
            return color.blue;
        } else {
            return null;
        }
    }

    /**
     * Resolve alpha of color
     * @param {String} name id of color
     * @param {boolean} originalOnly must be resolve
     * only theme declaration or user defined declaration
     * @returns alpha, null if color isn't exist
     * (or alpha isn't specified)
     */
    getAlphaOfColor(name, originalOnly = false) {
        let color = this.getColor(name, originalOnly);
        if (color.colorUsed && !color.alpha) {
            return this.getAlphaOfColor(color.colorUsed, originalOnly);
        } else if (color != null) {
            return color.alpha;
        } else {
            return null;
        }
    }

    /**
     * Resolve hex representation of color
     * @param {String} name id of color
     * @param {boolean} originalOnly must be resolve
     * only theme declaration or user defined declaration
     * @returns hex representation, null if color isn't exist
     */
    getHexOfColor(name, originalOnly = false) {
        let red = this.getRedOfColor(name, originalOnly);
        if (!red) return null;

        let green = this.getGreenOfColor(name, originalOnly);
        if (!green) return null;

        let blue = this.getBlueOfColor(name, originalOnly);
        if (!blue) return null;

        let alpha = this.getAlphaOfColor(name, originalOnly);
        // Alpha isn't mandatory

        return RGBAToHexA(red, green, blue, alpha);
    }

    /**
     * Resolve wakfu color declaration of specific color
     * @param {String} name id of color
     * @param {bool} useHex color format must be hex or rgba
     * @param {boolean} originalOnly must be resolve
     * only theme declaration or user defined declaration
     * @returns wakfu color 
     */
    getColorDeclaration(name, useHex = true, originalOnly = false) {
        let color = this.getColor(name, originalOnly);
        let colorCode = '';
        if (color.colorUsed) {
            colorCode = color.colorUsed;
            if (color.alpha && color.alpha != 100) {
                colorCode += '@' + color.alpha / 100;
            }
        } else if (color) {
            colorCode = colorToWakfuColor(
                this.getRedOfColor(name, originalOnly),
                this.getGreenOfColor(name, originalOnly),
                this.getBlueOfColor(name, originalOnly),
                this.getAlphaOfColor(name, originalOnly),
                useHex
            );
        } else {
            return null;
        }
        return colorDeclaration(name, colorCode);
    }
    
    /**
     * Add custom definition of color
     * @param {String} name id of color defined
     * @param {any} colorData color data at rgba format
     * rgb in [0-255] and a in [0-1]
     * @returns color added if different of default color, default color otherwise
     */
    addCustomColor(name, colorData) {
        let color = this.getColor(name, true);
        if (
            color.resolveRed(true) == colorData.r &&
            color.resolveGreen(true) == colorData.g &&
            color.resolveBlue(true) == colorData.b &&
            color.resolveAlpha(true) == (colorData.a * 100)
        ) {
            if (this._modifiedColors.has(name)) {
                this.removeCustomColor(name);
            }
            return color;
        } else {
            let newColor = {
                red: colorData.r,
                green: colorData.g,
                blue: colorData.b,
                alpha: colorData.a * 100
            };
            for (const key in color) {
                if ([
                    "red", "green", "blue", "alpha",
                    "resolveRed", "resolveGreen",
                    "resolveBlue", "resolveAlpha",
                    "resolveHex", "resolveColorDeclaration",
                    "colorUsed", "hasCustomColor"
                ].includes(key)) continue;

                newColor[key] = color[key];
            }
            newColor = this.addMethodsOfColor(newColor);
            this._modifiedColors.set(name, newColor);
            return newColor;
        }
    }

    /**
     * Remove custom definition of color
     * @param {String} name id of color
     */
    removeCustomColor(name) {
        this._modifiedColors.delete(name);
    }

    /**
     * To known if color is overrided
     * @param {String} name id of color
     * @returns true of color have custom definition
     * false otherwise
     */
    colorIsOverrided(name) {
        return this._modifiedColors.has(name);
    }

    /**
     * To remove each custom colors definied
     */
    clearCustomColors() {
        this._modifiedColors.clear();
    }
}

export const ThemeParser = new ThemeParserClass();