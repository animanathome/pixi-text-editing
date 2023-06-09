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