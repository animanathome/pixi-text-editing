import { expect } from 'chai';
import * as PIXI from "pixi.js";
import {LOCALHOST} from "./utils";
import {ScaleContainer} from "../src/scaleContainer";
import {ImageContainer} from "../src/imageContainer";
describe('scaleContainer', () => {
    it('can scale from the center', async() => {
        const app = new PIXI.Application({
            backgroundColor: 0xffffff,
            antialias: true,
            width: 200,
            height: 200,
        });
        document.body.appendChild(app.view);

        const scaleContainer = new ScaleContainer();
        scaleContainer.scaleAnchor = [10, 5];
        scaleContainer.scale = [2, 2];
        scaleContainer.x = 100;
        scaleContainer.y = 50;
        app.stage.addChild(scaleContainer as any);

        app.ticker.add((delta) => {
            let scale = scaleContainer.scale[0] + 0.01;
            scale = Math.min(scale, 4.0);
            scaleContainer.scale = [scale, scale]
        });
    });

    it.only('can display', async() => {
        const app = new PIXI.Application({
            backgroundColor: 0xffffff,
            antialias: true,
            width: 200,
            height: 200,
        });
        document.body.appendChild(app.view);

        const url = LOCALHOST + 'wave.jpg';
        const texture = await PIXI.Texture.fromURL(url);
        console.log('texture', texture);

        const container = new ImageContainer()
        container._texture = texture;
        app.stage.addChild(container);
    });
})