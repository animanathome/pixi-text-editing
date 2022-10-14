import {add} from '../src/utils';
import { expect } from 'chai';
import * as PIXI from 'pixi.js'
describe('util', () => {
    it('can add', () => {
        expect(add(2, 3)).to.equal(5);
    })
    it('can test pixi', () => {
        const app = new PIXI.Application();
    })
})