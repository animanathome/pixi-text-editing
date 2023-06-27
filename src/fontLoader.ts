import * as PIXI from 'pixi.js';
import fontkit from 'fontkit-next';

export enum FONT_STATUS {
    ADDED = 0,
    LOADING = 1,
    LOADED = 2,
    FAILED = 3
};

const VERBOSE = false;

export class FontLoader extends PIXI.utils.EventEmitter{
    sourceUrl = undefined;
    font = undefined;
    status = FONT_STATUS.ADDED;

    async load() {
        this.status = FONT_STATUS.LOADING;
        try {
            const response = await fetch(this.sourceUrl);
            console.log('response', response);
            console.log('has arrayBuffer', typeof response.arrayBuffer === 'function')
            const blob = await response.blob();
            const buffer = await blobToBuffer(blob);
            const font = fontkit.create(buffer);
            this.status = FONT_STATUS.LOADED;
            this.font = font;
            this.emit('loaded');
            VERBOSE && console.log(`loaded font ${this.sourceUrl}`);
        }
        catch (e) {
            this.status = FONT_STATUS.FAILED;
            this.emit('error');
            console.log(`unable to load font ${this.sourceUrl}`);
            throw e;
        }
    }

    async onLoaded() {
        if (this.loaded()) {
            return;
        }
        await new Promise<void>((resolve, reject) => {
            this.on('loaded', () => {
                resolve();
            })
            this.on('error', () => {
                reject();
            })
        });
    }

    loaded() {
        return this.status === FONT_STATUS.LOADED;
    }
}

function blobToBuffer(blob) {
    return new Promise((resolve, reject) => {
        if (typeof Blob === 'undefined' || !(blob instanceof Blob)) {
            reject(new Error('first argument must be a Blob'));
        }

        const reader = new FileReader();

        function onLoadEnd(e) {
            reader.removeEventListener('loadend', onLoadEnd, false);
            if (e.error) {
                reject(e.error);
            }
            else {
                // @ts-ignore
                resolve(Buffer.from(reader.result));
            }
        }

        reader.addEventListener('loadend', onLoadEnd, false);
        reader.readAsArrayBuffer(blob);
    });
}