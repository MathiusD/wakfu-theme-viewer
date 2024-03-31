import {getImage, getJson} from "./requester";

const themeUrl = "https://wakfu.cdn.ankama.com/gamedata/theme/theme.json";
const themeImagePath = (name) => `https://wakfu.cdn.ankama.com/gamedata/theme/images/${name}.png`
const themeImageFileName = (path) => (path.split('theme/images/'))[1].split('.tga')[0];

class ThemeParserClass {
    _theme = undefined;
    _textures = new Map();
    _pixmaps = new Map();
    _colors = new Map();
    _themeElements = new Map();

    loadTheme() {
        if(this._theme) return;
        return new Promise(resolve => {
            getJson(themeUrl).then(result => {
                this._theme = result;
                this.loadTextures().then(() => {
                    this.loadPixmaps();
                    this.loadColors();
                    this.loadThemeElements();
                    resolve();
                })
            })
        });
    }

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

    loadPixmaps() {
        for (const pixmap of this._theme.pixmaps) {
            pixmap.image = this._textures.get(pixmap.texture);
            this._pixmaps.set(pixmap.id, pixmap);
        }
    }

    loadColors() {
        for (const color of this._theme.colors) {
            let newColor = {
                resolveRed: () => {
                    return ThemeParser.getRedOfColor(color.id);
                },
                resolveGreen: () => {
                    return ThemeParser.getBlueOfColor(color.id);
                },
                resolveBlue: () => {
                    return ThemeParser.getGreenOfColor(color.id);
                },
                resolveAlpha: () => {
                    return ThemeParser.getAlphaOfColor(color.id);
                },
            };
            for (const key in color) {
                newColor[key] = color[key];
            }
            this._colors.set(color.id, newColor);
        }
    }

    loadThemeElements() {
        for (const element of this._theme.themeElement) {
            // data copy
            const flattened = JSON.parse(JSON.stringify(element));
            flattened.pixmaps = [];
            this.flattenThemeElement(flattened, element)
            this._themeElements.set(element.id, flattened)
        }
    }

    flattenThemeElement(flattened, element) {
        if(element.specificPixmaps) {
            for (const pixmap of element.specificPixmaps) {
                pixmap.image = this._textures.get(pixmap.texture);
                flattened.pixmaps.push(pixmap);
            }
        }

        if(element.childrenThemeElements) {
            for (const sub of element.childrenThemeElements) {
                this.flattenThemeElement(flattened, sub);
            }
        }
    }

    getPixmaps() {
        return Array.from(this._pixmaps.values());
    }

    getColors(resolveAttribute) {
        let colors = Array.from(this._colors.values());
        if (!resolveAttribute) {
            return colors;
        } else {
            let colorsResolved = [];
            for (const colorIndex in colors) {
                let color = colors[colorIndex];
                let newColor = {
                    resolvedRed: color.resolveRed(),
                    resolvedGreen: color.resolveGreen(),
                    resolvedBlue: color.resolveBlue(),
                    resolvedAlpha: color.resolveAlpha(),
                };
                for (const key in color) {
                    newColor[key] = color[key];
                }
                colorsResolved.push(newColor);
            }
            return colorsResolved;
        }
    }

    getThemeElements() {
        return Array.from(this._themeElements.values());
    }

    getPixmap(name) {
        return this._pixmaps.get(name);
    }

    getColor(name) {
        return this._colors.get(name);
    }

    getRedOfColor(name) {
        let color = this._colors.get(name);
        if (color.colorUsed) {
            return this.getRedOfColor(color.colorUsed);
        } else {
            return color.red;
        }
    }

    getGreenOfColor(name) {
        let color = this._colors.get(name);
        if (color.colorUsed) {
            return this.getGreenOfColor(color.colorUsed);
        } else {
            return color.green;
        }
    }

    getBlueOfColor(name) {
        let color = this._colors.get(name);
        if (color.colorUsed) {
            return this.getBlueOfColor(color.colorUsed);
        } else {
            return color.blue;
        }
    }

    getAlphaOfColor(name) {
        let color = this._colors.get(name);
        if (color.colorUsed && !color.alpha) {
            return this.getAlphaOfColor(color.colorUsed);
        } else {
            return color.alpha;
        }
    }
}

export const ThemeParser = new ThemeParserClass();