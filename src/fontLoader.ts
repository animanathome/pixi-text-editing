import fontkit from 'fontkit-next';

export enum FONT_STATUS {
    ADDED = 0,
    LOADING = 1,
    LOADED = 2,
    FAILED = 3
};

export class FontLoader {
    sourceUrl = undefined;
    font = undefined;
    status = FONT_STATUS.ADDED;

    async load() {
        this.status = FONT_STATUS.LOADING;
        try {
            const response = await fetch(this.sourceUrl);
            const blob = await response.blob();
            const buffer = await blobToBuffer(blob);
            const font = fontkit.create(buffer);
            this.status = FONT_STATUS.LOADED;
            this.font = font;
        }
        catch (e) {
            this.status = FONT_STATUS.FAILED;
            throw e;
        }
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