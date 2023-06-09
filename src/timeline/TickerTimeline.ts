import * as PIXI from "pixi.js";

export class TickerTimeline {
    _ticker: PIXI.Ticker;
    _playing = false;
    _time = 0;
    duration = 1000; // time in milliseconds
    constructor(ticker: PIXI.Ticker) {
        this._ticker = ticker;
        this._ticker.add(this._update, this);
    }

    play() {
        this._playing = true;
    }

    stop() {
        this._playing = false;
        this._time = 0;
    }

    get playing() {
        return this._playing;
    }

    get time() {
        return this._time;
    }

    set time(value: number) {
        this._time = value;
    }

    _update() {
        if (!this.playing) {
            return
        }
        this._time += this._ticker.deltaMS;
        if (this._time > this.duration) {
            this._time = 0;
        }
    }

    destroy() {
        this._ticker.destroy();
        this._ticker = undefined;
    }
}