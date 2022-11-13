// Since PIXI doesn't support wireframe render
import * as PIXI from 'pixi.js';
export function drawRectangle(bounds: PIXI.Rectangle) {
    const {x, y, width, height} = bounds;
    const graphics = new PIXI.Graphics();
    graphics.lineStyle(2, 0x000000, 1);
    graphics.drawRect(x, y, width, height);
    return graphics;
}

export function drawPosition(x: number, y: number) {
    const graphics = new PIXI.Graphics();
    graphics.lineStyle(1, 0x000000, 1);
    graphics.drawRect(x - 1, y, 3, 1);
    graphics.drawRect(x, y - 1, 1, 3);
    return graphics;
}