import * as THREE from 'three';
import * as PIXI from 'pixi.js'

import {FloatBufferResource} from "./FloatBufferResource";

const BITS = 3;

export const buildCurveData = (points, nSegments = 20) => {
    const curve = new THREE.CatmullRomCurve3(points, true, 'catmullrom', 0.825)
    const positions = curve.getSpacedPoints( nSegments );
    const {binormals, tangents} = curve.computeFrenetFrames(nSegments, false);

    const data = {
        positions: positions,
        tangents: tangents,
        normals: binormals,
        length: curve.getLength()
    }
    return data;
}

export const buildCurve = (positions, tangents, normals, parent) => {
    const curve = new PIXI.Graphics();
    curve.lineStyle(2, 0xFF0000);
    parent.addChild(curve);

    const nCurve = new PIXI.Graphics(); // green
    nCurve.lineStyle(2, 0x00FF00);
    parent.addChild(nCurve);

    const tCurve = new PIXI.Graphics(); // blue
    tCurve.lineStyle(2, 0x0000FF);
    parent.addChild(tCurve);

    for (let i = 0; i < positions.length; i++) {
        const pos = positions[i]
        const tan = tangents[i]
        const norm = normals[i]

        // display normals
        nCurve.moveTo(pos.x, pos.y);
        nCurve.lineTo(pos.x + (norm.x * 10), pos.y + (norm.y * 10));

        // display tangents
        tCurve.moveTo(pos.x, pos.y);
        tCurve.lineTo(pos.x + (tan.x * 10), pos.y + (tan.y * 10));

        // display position
        if (i === 0) {
            curve.moveTo(pos.x, pos.y);
        }
        else {
            curve.lineTo(pos.x, pos.y);
        }
    }
    return {
        curve,
        nCurve,
        tCurve,
    };
}

function setTextureValue(index, x, y, o, width, data) {
    const i = BITS * width * (o || 0);
    data[index * BITS + i + 0] = x;
    data[index * BITS + i + 1] = y;
    data[index * BITS + i + 2] = 0;
}

export const createCurveTexture = (positions, normals, tangents) => {
    const width = positions.length;
    const resolution = width * 4 * BITS;
    const data = new Float32Array(resolution);
    for (let i = 0; i < width; i++) {
        setTextureValue(i, positions[i].x,
            positions[i].y, 0, width, data);

        setTextureValue(i, tangents[i].x,
            tangents[i].y, 1, width, data);

        setTextureValue(i, normals[i].x,
            normals[i].y, 2, width, data);
    }
    const resource = new FloatBufferResource(data, {
      width: width,
      height: 4,
      internalFormat: 'RGB32F',
      format: 'RGB', // var RGBFormat = 1022;
      type: 'FLOAT' // var FloatType = 1015;
    });
    const baseDataTexture = new PIXI.BaseTexture(resource, { scaleMode: PIXI.SCALE_MODES.NEAREST });
    const dataTexture = new PIXI.Texture(baseDataTexture);
    baseDataTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
    baseDataTexture.mipmap = PIXI.MIPMAP_MODES.OFF;
    return dataTexture;
}
