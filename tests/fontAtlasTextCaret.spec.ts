import * as fs from "fs";
import { expect } from 'chai';
import {CARET_POSITION, FontAtlasTextCaret} from "../src/fontAtlasTextCaret";

import {createFontAtlasTextApp} from '../tests/utils'

describe('FontAtlasTextCaret', () => {
    describe('can draw caret', () => {
        it('at the start', async() => {
            // Assemble
            const {app, text} = await createFontAtlasTextApp('hello', 28, 28)
            const caret = new FontAtlasTextCaret(text);
            caret.caretWidth = 1;
            app.stage.addChild(caret);

            // Act
            caret.glyphIndex = 1;
            caret.glyphPosition = CARET_POSITION.START;
            app.ticker.update();

            // Assert
            const url = app.view.toDataURL()
            const expectedUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAB40lEQVRIS+2TMchpYRjH/1a7ksMggyzEQiYbWX13MKjvDiwGE6V8okiRjErOTYqMinJu3c9AlO9OjmJFTJSysJ3b+w43p47Ld27d5Z53O+95n37v83v+r0oQBMFms2E+n0O0VCpAEMR7N1+JRALFYpHuJJNJFAqFu2dvf6jkAuPxOEqlknzgdDrFZDLB+XyG2+2GjmH+2OFfAdVqNZxOJ6xWK3a7Hex2O1Jvb/jOcQiHw3C5XFitViDnOp0OjEYjpICHwwGRSAT7/R4mkwkcxyGTySAWi/22SpWazWYMBgPo9XqMx2M6jx/v7/jy8kIvEY1Gcblc4PV60W636Z4UkGVZtFotDIdDXK9XCqzX6+j3+2LgbWh4nkcoFMKc5/H19RXr9VoUBgLy+/2SwHw+j+PxiEqlQmtIp8FgEKPR6Dkg6TAQCECr1YqgHo9HEtjtdtHr9UA6JWu73cLn82G5XD4H/MaymM1mSKfTYBgG2WyWzlSn00kCN5sNtVMul2GxWNBsNrFYLFCtVp8D/vz4QCqVooFxOBw4nU5oNBp3Q0MSTnTmcjkYDAaQUdVqNWg0GjFQ8sU+ePhPvXKJQzSl/ylQrrMHdfeVKkCZBhSlMsXdL1OUKko/bUAJzaeVPSr450p/ARuza7xyL5sqAAAAAElFTkSuQmCC';
            expect(url).to.equal(expectedUrl);
        })

        it('at the end', async() => {
            // Assemble
            const {app, text} = await createFontAtlasTextApp('hello', 28, 28)
            const caret = new FontAtlasTextCaret(text);
            caret.caretWidth = 1;
            app.stage.addChild(caret);

            // Act
            caret.glyphIndex = 1;
            caret.glyphPosition = CARET_POSITION.END;
            app.ticker.update();

            // Assert
            const url = app.view.toDataURL()
            const expectedUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAB30lEQVRIS+2TMahpcRzHv2e1KzkM7xpkcWIh07sTvTvKYDAYWAyWe24piSJFMiohKTIqCiUDUTKhWBETpSxs5/b/D/ddde57h1tveJ3//P/2+f0/v++fEQRB4DgOs9kMkg/D4I3nkUqlaCQUCiGZTEqKM48C+ddXpNPpx4Hj8Rij0Qjn8xk2mw1qtfrriRkG3wIqFApYLBYYjUbsdjuYTCaEw2F0u134fD5YrVasViuQe/V6HT+enkSBh8MBfr8f+/0eOp0OnU4H0WgUwWDwY3iqVK/Xo91uQ6PRYDgc0n30ej24XC46RCAQwOVygd1uR61Wg5HjRIHFYhHVahX9fh/X65UCC4UCWq3WLfBzaebzOTweDy2R1+vFer2+UcvzPH69vIgCE4kEjscjstkszZCXut1uDAYDaUDyQqfTCZVKdQP9+fwsCmw0Gmg2myAvJWe73cLhcGC5XEoDlkolTCYTRCIRsCyLWCxGd6pmWVHgZrOhdjKZDAwGAyqVChaLBXK5nDTgdDql5SGFMZvNOJ1OKJfLX5aGNJzojMfj0Gq1IKvK5/NQKpW3QEk/9vMlhgEE4e4YCdCW3p38/4F3K/kdeEypDPyDAVnpN+ohHpWVykrvNiCX5m5lfwv8c6XvpHtlvK1pNVIAAAAASUVORK5CYII=';
            expect(url).to.equal(expectedUrl);

            // const base64Data = url.replace(/^data:image\/png;base64,/, "");
            // fs.writeFile('./tests/test.png', base64Data, 'base64', function (err) {
            //     console.log(err);
            // });
        })
    });
});