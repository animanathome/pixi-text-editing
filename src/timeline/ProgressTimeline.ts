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