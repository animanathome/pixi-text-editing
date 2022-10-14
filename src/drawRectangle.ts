// Since PIXI doesn't support wireframe render
import * as PIXI from 'pixi.js';
export function drawRectangle(bounds: PIXI.Rectangle) {
    const {x, y, width, height} = bounds;
    const graphics = new PIXI.Graphics();
    graphics.lineStyle(2, 0x000000, 1);
    graphics.drawRect(x, y, width, height);
    return graphics;
}