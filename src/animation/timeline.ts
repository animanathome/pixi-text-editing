import * as PIXI from 'pixi.js'

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


export class ProgressTimeline {
    start = 0
    end = 100
    value(time) {
        if (time < this.start) {
            return 0
        }
        if (time > this.end) {
            return 1;
        }
        return (time - this.start) / (this.end - this.start);
    }
}

export class PingPongTimeline {
    start = 0
    duration = 100
    effect = 20;

    get end() {
        return this.start + this.duration
    }

    value(time) {
        if (time <= this.start) {
            return 0
        }
        if (time >= this.end) {
            return 0;
        }
        // intro
        if (time > this.start && time < this.start + this.effect) {
            return (time - this.start) / this.effect;
        }
        // outro
        else if (time < this.end && time > this.end - this.effect) {
            return (this.end - time) / this.effect;
        }
        // inbetween
        return 1;
    }
}