import * as PIXI from "pixi.js";
import {TickerTimeline} from "./timeline/TickerTimeline";
import {FontAtlasText} from "./fontAtlasText";
import {FontAtlas} from "./fontAtlas";
import {FontLoader} from "./fontLoader";

const VERBOSE = false;
export class TextPlayground extends PIXI.utils.EventEmitter {
    _dirty = true;
    _timeline: TickerTimeline;
    _ticker: PIXI.Ticker;
    _container: PIXI.Container;
    _renderer: PIXI.Renderer;
    _atlas: FontAtlas;
    _loader: FontLoader;

    constructor() {
        super();
        this._ticker = new PIXI.Ticker();
        this._timeline = new TickerTimeline(this._ticker);
        this._container = new PIXI.Container();
        this._renderer = new PIXI.Renderer({
            width: 512,
            height: 512,
            antialias: true,
            backgroundAlpha: 0,
        });
        this._ticker.add(this._render, this);
        this._loadInitialSources()
        this._ticker.start();
    }

    _loadInitialSources() {
        VERBOSE && console.log('loading initial sources');
        this._loader = new FontLoader();
        this._loader.sourceUrl = 'http://127.0.0.1:8080/resources/Roboto-Regular.ttf';

        // what do we do with this error?
        this._loader.load().catch((e) => console.error(e));

        this._atlas = new FontAtlas({
            fontLoader: this._loader,
            resolution: 512,
            fontSize: 24,
        })
    }

    get fontLoader() {
        return this._loader;
    }

    get fontAtlas() {
        return this._atlas;
    }

    get ticker() {
        return this._ticker;
    }

    _render() {
        VERBOSE && console.log('_render');
        this._atlas.update();

        this._container.children.forEach(child => {
            (child as FontAtlasText).anim.time = this._timeline.time;
        });

        // how do we know if something has changed during an update?
        this._renderer.render(this._container);
    }

    get renderer() {
        return this._renderer
    }

    get view() {
        return this.renderer.view;
    }

    play() {
       this._timeline.play();
    }

    stop() {
        this._timeline.stop();
    }

    get currentTime() {
        return this._timeline.time;
    }

    set currentTime(value: number) {
        this._timeline.time = value;
    }

    get assets() {
        return this._container.children;
    }

    addText(text : string = 'Hello World') {
        const textAsset = new FontAtlasText();
        textAsset.atlas = this._atlas; // we should make this part of the constructor
        textAsset.text = text;
        this._container.addChild(textAsset);
        return textAsset;
    }

    destroy() {
        if (this.view.parentElement) {
            this.view.parentElement.removeChild(this.view);
        }

        this._ticker.stop();
        // TODO: figure out why this is throwing an error
        // this._ticker.destroy();
        this._timeline.destroy();
        this._container.destroy(true);
        this._renderer.destroy();
        this._atlas.destroy();
        this._loader = undefined;
    }
}