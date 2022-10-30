export class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  length() {
		return Math.sqrt( this.x * this.x + this.y * this.y );
	}

  normalize() {
    const length = this.length() || 1 ;
    return {
      x: this.x / length,
      y: this.y / length
    }
  }
}