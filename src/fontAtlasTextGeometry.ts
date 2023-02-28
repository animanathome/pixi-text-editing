import * as PIXI from "pixi.js";
import {average, dist} from "./utils";

export const LEFT = 0;
export const RIGHT = 1;

export class FontAtlasTextGeometry {
    _vertexArray = [];
    _uvArray = [];
    _indexArray = [];
    _glyph = [];
    _glyphCenters = [];

    // why do we need this here?
    atlasResolution = 256; // atlas atlasResolution

    clear() {
        this._vertexArray = [];
        this._uvArray = [];
        this._indexArray = [];
        this._glyph = [];
        this._glyphCenters = [];
    }

    moveGlyph(index, xOffset, yOffset) {
        const start = this._glyph[index].vertexRange[0];

        // x
        this._vertexArray[start] += xOffset;
        this._vertexArray[start + 2] += xOffset;
        this._vertexArray[start + 4] += xOffset;
        this._vertexArray[start + 6] += xOffset;

        // y
        this._vertexArray[start + 1] += yOffset;
        this._vertexArray[start + 3] += yOffset;
        this._vertexArray[start + 5] += yOffset;
        this._vertexArray[start + 7] += yOffset;
    }

    containsGlyph(x: number, y: number,
                  glyphRange: { start: number, end: number }
    ) : [number, number] {
        for (let i = glyphRange.start; i <= glyphRange.end; i++) {
            if (this._containsGlyph(i, x, y)) {
                const edge = this._closestEdgeToGlyph(i, x)
                return [i, edge];
            }
        }
        return [-1, 0]
    }

    _closestEdgeToGlyph(index: number, x: number) {
        const vertexArray = this._getGlyphVertexArray(index);
        const x0 = vertexArray[4]; // left
        const x1 = vertexArray[0]; // right

        const left = x - x0;
        const right = x1 - x;
        return left < right ? LEFT : RIGHT
    }

    _containsGlyph(index: number, x: number, y: number) {
        const vertexArray = this._getGlyphVertexArray(index);

        const x0 = vertexArray[4];
        const x1 = vertexArray[0];
        const y0 = vertexArray[5];
        const y1 = vertexArray[1];

        const width = x1 - x0;
        const height = y1 - y0;

        if (width <= 0 || height <= 0)
        {
            return false;
        }
        if (x >= x0 && x < x0 + width)
        {
            if (y >= y0 && y < y0 + height)
            {
                return true;
            }
        }
        return false;
    }

    // TODO: add a glyphRangeContains to speed up process
    // !!!TODO: use contain instead of closest
    closestGlyph(
        x: number,
        y: number,
        glyphRange: {start: number, end: number}
    ) : [number, number] {
        if (this._glyphCenters.length === 0) {
            this._cacheGlyphCenters();
        }
        let shortestDistance = Infinity;
        let index = -1;
        for (let i = glyphRange.start; i <= glyphRange.end; i++) {
            // @ts-ignore
            // if (PIXI.TextMetrics.isNewline(this._glyph[i].id)) {
            //     continue;
            // }

            const distance = dist(this._glyphCenters[i], {x, y});
            if (shortestDistance > distance) {
                shortestDistance = distance;
                index = i;
            }
        }

        let edge = LEFT;
        if (index !== -1) {
            edge = this._closestEdgeToGlyph(index, x)
        }

        return [index, edge];
    }

    getGlyphCenter(index) {
        if (this._glyphCenters.length === 0) {
            this._cacheGlyphCenters();
        }
        return this._glyphCenters[index];
    }

    _cacheGlyphCenters() {
        for (let i = 0; i < this._glyph.length; i++) {
            this._glyphCenters.push(this._getGlyphCenter(i));
        }
    }

    // TODO: we need more information
    //  - to select the start and end of a word
    //  - to select spaces
    _getGlyphCenter(index) {
        const vertexArray = this._getGlyphVertexArray(index);
        const p1 = {
            x: vertexArray[4],
            y: vertexArray[5],
        }
        const p2 = {
            x: vertexArray[0],
            y: vertexArray[1],
        }
        return average(p1, p2);
    }

    printGlyphBounds() {
        for (let i = 0; i < this._glyph.length; i++) {
            const bounds = this._getGlyphBounds(i);
        }
        console.log(JSON.stringify(this._vertexArray));
    }

    _getGlyphBounds(index : number) {
        if (typeof index !== "number") {
            throw Error(`Invalid type ${typeof index} -- Expected number`)
        }
        if (!this._glyph[index]) {
            throw Error(`Invalid glyph index ${index} -- max id = ${this._glyph.length - 1}`);
        }
        const x1Index = this._glyph[index].vertexRange[0];
        const y1Index = this._glyph[index].vertexRange[0] + 1;
        const x0Index = this._glyph[index].vertexRange[0] + 4;
        const y0Index = this._glyph[index].vertexRange[0] + 5;

        const x1 = this._vertexArray[x1Index];
        const y1 = this._vertexArray[y1Index];
        const x0 = this._vertexArray[x0Index];
        const y0 = this._vertexArray[y0Index];

        const width = x1 - x0;
        const height = y1 - y0;

        const bounds = new PIXI.Rectangle(x0, y0, width, height);
        return bounds;
    }

    getBounds(glyphIndexArray: number[]) {
        if (glyphIndexArray.length === 0) {
            return new PIXI.Rectangle();
        }
        const bounds = this._getGlyphBounds(glyphIndexArray[0]);
        for (let i = 1; i < glyphIndexArray.length; i++) {
            bounds.enlarge(this._getGlyphBounds(glyphIndexArray[i]))
        }
        return bounds;
    }

    addWhitespace(id, width, height) {
        const metrics = {
            x: 0,
            y: 0,
            width,
            height,
            textureId: 0,
            advanceWidth: 0,
            advanceHeight: 0,
            leftBearing: 0,
            topBearing: 0,
        }
        return this.addGlyph(id, metrics)
    }

    addGlyph(id, metrics, multi = 1) {
        const vertices = this._generateGlyphVertices(metrics, multi);

        // vertex order to create a triangle/polygon
        const indexOffset = this._glyph.length * 4;
        const indices = [
            0 + indexOffset, 1 + indexOffset, 2 + indexOffset,
            2 + indexOffset, 3 + indexOffset, 0 + indexOffset,
        ];

        const uvs = this._generateGlyphUVs(metrics);

        this._vertexArray = this._vertexArray.concat(vertices);
        this._indexArray = this._indexArray.concat(indices);
        this._uvArray = this._uvArray.concat(uvs);

        const glyphIndex = this._glyph.length;

        const vertexStart = this._glyph.length * 8;
        const vertexEnd = ((this._glyph.length + 1) * 8) - 1;

        this._glyph.push({
            vertexRange: [vertexStart, vertexEnd],
            id
        });

        return glyphIndex;
    }

    get glyphCount() {
        return this._glyph.length
    }

    _getGlyphVertexArray(index) {
        const vertexRange = this._glyph[index]?.vertexRange;
        if (!vertexRange) {
            // throw Error(`Invalid index ${index} -- max ${this._glyph.length}`);
            return [];
        }
        const vertexArray = this._vertexArray.slice(vertexRange[0], vertexRange[1] + 1);
        return vertexArray;
    }

    // renaming to vertex array
    _generateGlyphVertices(metrics, multi) {
        const x0 = (0 + metrics.leftBearing) * multi;
        const x1 = (metrics.width + metrics.leftBearing) * multi;
        const y0 = (0 + metrics.topBearing) * multi;
        const y1 = (metrics.height + metrics.topBearing) * multi;

        const glyphVertices = [
            x1, y1,
            x1, y0,
            x0, y0,
            x0, y1,
        ];
        return glyphVertices;
    }

    _generateGlyphUVs(metrics) {
        const x0 = metrics.x / this.atlasResolution;
        const x1 = (metrics.x + metrics.width) / this.atlasResolution;
        const y0 = (-metrics.y - metrics.height) / this.atlasResolution;
        const y1 = (-metrics.y) / this.atlasResolution;

        const glyphUVs = [
            x1, y1,
            x1, y0,
            x0, y0,
            x0, y1,
        ];
        return glyphUVs;
    }

    build() : PIXI.Geometry {
        const geometry = new PIXI.Geometry();
        geometry.addAttribute('aVertexPosition', this._vertexArray, 2);
        geometry.addAttribute('aUvs', this._uvArray, 2);
        geometry.addIndex(this._indexArray);
        return geometry;
    }

    buildBounds() : PIXI.Bounds {
        const bounds = new PIXI.Bounds;
        bounds.addVertexData(this._vertexArray as any, 0, this._vertexArray.length);
        return bounds;
    }
}
