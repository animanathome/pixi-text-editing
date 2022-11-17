import { expect } from 'chai';
import {createFontAtlasTextApp, roundBounds, writeDataUrlToDisk} from '../tests/utils'
import {FontAtlasTextManipulator} from "../src/fontAtlasTextManipulator";
import {CARET_POSITION} from "../src/fontAtlasTextCaret";
import {RIGHT} from "../src/fontAtlasTextGeometry";

describe('FontAtlasTextManipulator', () => {
    describe('can display caret', () => {
        it('with no text', async() => {
            // |

            // Assemble
            const displayText = ''
            const {app, text} = await createFontAtlasTextApp({
                displayText,
                width: 64,
                height: 64,
            });
            const manipulator = new FontAtlasTextManipulator(text);
            manipulator.caret.caretVisibleDuration = 0;
            app.stage.addChildAt(manipulator, 0);

            // Act
            manipulator.click(0, 0, false);
            expect(manipulator._activeGlyph()).to.eql([0, 0])
            app.ticker.update();

            // Assert
            expect(manipulator.caret.getBounds().x).to.equal(0);
            expect(manipulator.caret.getBounds().y).to.equal(0);
        });

        describe('by moving left', () => {
            describe('a new line', () => {
                it('with only new lines', async() => {
                    // Assemble
                    const displayText = '\n\n'
                    const {app, text} = await createFontAtlasTextApp({
                        displayText,
                        width: 64,
                        height: 64,
                    });
                    const manipulator = new FontAtlasTextManipulator(text);
                    manipulator.caret.caretVisibleDuration = 0;
                    app.stage.addChildAt(manipulator, 0);

                    // Act
                    // \n
                    // \n
                    //|
                    manipulator.click(48, 48, false);
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(24);

                    // Act
                    // \n
                    // |\n
                    manipulator.arrowLeft()
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(12);

                    // Act
                    // |\n
                    // \n
                    manipulator.arrowLeft()
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(0);

                    // Act
                    // |\n
                    // \n
                    manipulator.arrowLeft()
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(0);
                });

                it('with single characters', async() => {
                    // Assemble
                    const displayText = 'a'
                    const {app, text} = await createFontAtlasTextApp({
                        displayText,
                        width: 64,
                        height: 64,
                    });
                    const manipulator = new FontAtlasTextManipulator(text);
                    manipulator.caret.caretVisibleDuration = 0;
                    app.stage.addChildAt(manipulator, 0);

                    // Act
                    // a|
                    manipulator.click(48, 48, false);
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(Math.ceil(manipulator.caret.getBounds().x)).to.equal(6);
                    expect(manipulator.caret.getBounds().y).to.equal(0);

                    // Act
                    // |a
                    manipulator.arrowLeft()
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(0);
                });

                it('with single characters and new lines', async() => {
                    // Assemble
                    const displayText = 'a\nb\n'
                    const {app, text} = await createFontAtlasTextApp({
                        displayText,
                        width: 64,
                        height: 64,
                    });
                    const manipulator = new FontAtlasTextManipulator(text);
                    manipulator.caret.caretVisibleDuration = 0;
                    app.stage.addChildAt(manipulator, 0);

                    // Act
                    // a\n
                    // b\n
                    // |
                    manipulator.click(48, 48, false);
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(24);

                    // Act
                    // a\n
                    // b|\n
                    manipulator.arrowLeft();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(Math.ceil(manipulator.caret.getBounds().x)).to.equal(7);
                    expect(manipulator.caret.getBounds().y).to.equal(12);

                    // Act
                    // a\n
                    // |b\n
                    manipulator.arrowLeft();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(12);

                    // Act
                    // a|\n
                    // b\n
                    manipulator.arrowLeft();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(Math.ceil(manipulator.caret.getBounds().x)).to.equal(6);
                    expect(manipulator.caret.getBounds().y).to.equal(0);

                    // Act
                    // |a\n
                    // b\n
                    manipulator.arrowLeft();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(0);

                    // Act
                    // |a\n
                    // b\n
                    manipulator.arrowLeft();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');
                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(0);
                });
            });
        });

        describe('by moving right', () => {
            describe('a new line', () => {
                it('with only new lines', async() => {
                    // Assemble
                    const displayText = '\n\n'
                    const {app, text} = await createFontAtlasTextApp({
                        displayText,
                        width: 64,
                        height: 64,
                    });
                    const manipulator = new FontAtlasTextManipulator(text);
                    manipulator.caret.caretVisibleDuration = 0;
                    app.stage.addChildAt(manipulator, 0);

                    // Act
                    // |\n
                    // \n
                    manipulator.click(0, 0, false);
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');

                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(0);

                    // Act
                    // \n
                    // |\n
                    manipulator.arrowRight()
                    app.ticker.update()

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');

                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(12);

                    // Act
                    // \n
                    // \n
                    // |
                    manipulator.arrowRight()
                    app.ticker.update()

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');

                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(24);

                    // Act
                    // \n
                    // \n
                    // |
                    manipulator.arrowRight()
                    app.ticker.update()

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');

                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(24);
                })

                it('with single characters', async() => {
                    // Assemble
                    const displayText = 'a'
                    const {app, text} = await createFontAtlasTextApp({
                        displayText,
                        width: 64,
                        height: 64,
                    });
                    const manipulator = new FontAtlasTextManipulator(text);
                    manipulator.caret.caretVisibleDuration = 0;
                    app.stage.addChildAt(manipulator, 0);

                    // Act
                    // |a
                    manipulator.click(0, 0, false);
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');

                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(0);

                    // Act
                    // a|
                    manipulator.arrowRight();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');

                    expect(Math.ceil(manipulator.caret.getBounds().x)).to.equal(6);
                    expect(manipulator.caret.getBounds().y).to.equal(0);

                    // Act
                    // a|
                    manipulator.arrowRight();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');

                    expect(Math.ceil(manipulator.caret.getBounds().x)).to.equal(6);
                    expect(manipulator.caret.getBounds().y).to.equal(0);
                })

                it('with single characters and new lines', async() => {
                    // Assemble
                    const displayText = 'a\nb\n'
                    const {app, text} = await createFontAtlasTextApp({
                        displayText,
                        width: 64,
                        height: 64,
                    });
                    const manipulator = new FontAtlasTextManipulator(text);
                    manipulator.caret.caretVisibleDuration = 0;
                    app.stage.addChildAt(manipulator, 0);

                    // Act
                    // |a\n
                    // b\n
                    manipulator.click(0, 0, false);
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');

                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(0);

                    // Act
                    // a|\n
                    // b\n
                    manipulator.arrowRight();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');

                    expect(Math.ceil(manipulator.caret.getBounds().x)).to.equal(6);
                    expect(manipulator.caret.getBounds().y).to.equal(0);

                    // Act
                    // a\n
                    // |b\n
                    manipulator.arrowRight();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');

                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(12);

                    // Act
                    // a\n
                    // b|\n
                    manipulator.arrowRight();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');

                    expect(Math.ceil(manipulator.caret.getBounds().x)).to.equal(7);
                    expect(manipulator.caret.getBounds().y).to.equal(12);

                    // Act
                    // a\n
                    // b\n
                    // |
                    manipulator.arrowRight();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');

                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(24);

                    // Act
                    // a\n
                    // b\n
                    // |
                    manipulator.arrowRight();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');

                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(24);
                })
            })
        })

        describe('when moving up', () => {
            describe('lines', () => {
                it('with only new lines', async() => {
                    // Assemble
                    const displayText = '\n\n'
                    const {app, text} = await createFontAtlasTextApp({
                        displayText,
                        width: 64,
                        height: 64,
                    });
                    const manipulator = new FontAtlasTextManipulator(text);
                    manipulator.caret.caretVisibleDuration = 0;
                    app.stage.addChildAt(manipulator, 0);

                    // Act
                    // \n
                    // \n
                    // |
                    manipulator.click(48, 48, false);
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');

                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(24);

                    // Act
                    // \n
                    // |\n
                    manipulator.arrowUp();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');

                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(12);

                    // Act
                    // |\n
                    // \n
                    manipulator.arrowUp();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');

                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(0);
                });

                it('with single characters', async() => {
                    // Assemble
                    const displayText = 'a\nb\n'
                    const {app, text} = await createFontAtlasTextApp({
                        displayText,
                        width: 64,
                        height: 64,
                    });
                    const manipulator = new FontAtlasTextManipulator(text);
                    manipulator.caret.caretVisibleDuration = 0;
                    app.stage.addChildAt(manipulator, 0);

                    // Act
                    // a\n
                    // b\n
                    // |
                    manipulator.click(48, 48, false);
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');

                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(24);

                    // Act
                    // a\n
                    // |b\n
                    manipulator.arrowUp();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');

                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(12);

                    // Act
                    // |a\n
                    // b\n
                    manipulator.arrowUp();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');

                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(0);

                })
            });
        })

        describe('when moving down', () => {
            describe('lines', () => {
                it('with only new lines', async() => {
                    // Assemble
                    const displayText = '\n\n'
                    const {app, text} = await createFontAtlasTextApp({
                        displayText,
                        width: 64,
                        height: 64,
                    });
                    const manipulator = new FontAtlasTextManipulator(text);
                    manipulator.caret.caretVisibleDuration = 0;
                    app.stage.addChildAt(manipulator, 0);

                    // Act
                    // |\n
                    // \n
                    manipulator.click(0, 0, false);
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');

                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(0);

                    // Act
                    // \n
                    // |\n
                    manipulator.arrowDown();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');

                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(12);

                    // Act
                    // \n
                    // \n
                    // |
                    manipulator.arrowDown();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');

                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(24);

                    // Act
                    // \n
                    // \n
                    // |
                    manipulator.arrowDown();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');

                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(24);
                });

                it('with single characters', async() => {
                    // Assemble
                    const displayText = 'a\nb\n'
                    const {app, text} = await createFontAtlasTextApp({
                        displayText,
                        width: 64,
                        height: 64,
                    });
                    const manipulator = new FontAtlasTextManipulator(text);
                    manipulator.caret.caretVisibleDuration = 0;
                    app.stage.addChildAt(manipulator, 0);

                    // Act
                    // |a\n
                    // b\n
                    manipulator.click(0, 0, false);
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');

                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(0);

                    // Act
                    // a\n
                    // |b\n
                    manipulator.arrowDown();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');

                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(12);

                    // Act
                    // a\n
                    // b\n
                    // |
                    manipulator.arrowDown();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');

                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(24);

                    // Act
                    // a\n
                    // b\n
                    // |
                    manipulator.arrowDown();
                    app.ticker.update();

                    // Assert
                    writeDataUrlToDisk(app.view.toDataURL(), 'test');

                    expect(manipulator.caret.getBounds().x).to.equal(0);
                    expect(manipulator.caret.getBounds().y).to.equal(24);
                });
            })
        })
    })

    describe('can display selection', () => {
        describe('backward', () => {
            it('a single word', async() => {
                // Assemble
                const displayText = 'What'
                const {app, text} = await createFontAtlasTextApp({
                    displayText,
                    height: 64,
                    width: 64,
                });
                const manipulator = new FontAtlasTextManipulator(text);
                app.stage.addChildAt(manipulator, 0);

                // Act
                manipulator.select(3, CARET_POSITION.END);
                manipulator.arrowLeft(true);
                manipulator.arrowLeft(true);
                manipulator.arrowLeft(true);
                manipulator.arrowLeft(true);
                app.ticker.update();

                // Assert
                writeDataUrlToDisk(app.view.toDataURL(), 'test')
                const bounds = roundBounds(manipulator.drawSelection.getBounds());
                expect(bounds.x).to.equal(0);
                expect(bounds.y).to.equal(0);
                expect(bounds.width).to.equal(27);
                expect(bounds.height).to.equal(12);
            });

            it('multiple words on a single line', async() => {
                // Assemble
                const displayText = 'This is it'
                const {app, text} = await createFontAtlasTextApp({
                    displayText,
                    width: 64,
                    height: 64,
                });
                const manipulator = new FontAtlasTextManipulator(text);
                app.stage.addChildAt(manipulator, 0);

                // Act - "is i"
                manipulator.select(5, CARET_POSITION.END);
                manipulator.arrowLeft(true);
                manipulator.arrowLeft(true);
                manipulator.arrowLeft(true);
                manipulator.arrowLeft(true);
                app.ticker.update();

                // Assert
                writeDataUrlToDisk(app.view.toDataURL(), 'test');
                let bounds = roundBounds(manipulator.drawSelection.getBounds());
                expect(bounds.x).to.equal(15);
                expect(bounds.y).to.equal(0);
                expect(bounds.width).to.equal(13);
                expect(bounds.height).to.equal(12);

                // Act - "is i"
                manipulator.select(6, CARET_POSITION.START);
                manipulator.arrowLeft(true);
                manipulator.arrowLeft(true);
                manipulator.arrowLeft(true);
                manipulator.arrowLeft(true);
                app.ticker.update();

                // Assert
                writeDataUrlToDisk(app.view.toDataURL(), 'test');
                bounds = roundBounds(manipulator.drawSelection.getBounds());
                expect(bounds.x).to.equal(15);
                expect(bounds.y).to.equal(0);
                expect(bounds.width).to.equal(13);
                expect(bounds.height).to.equal(12);
            })

            it('multiple words on two lines', async() => {
                // Assemble
                const displayText = 'This is this? I am not sure.'
                const {app, text} = await createFontAtlasTextApp({
                    displayText,
                    width: 64,
                    height: 64,
                });
                const manipulator = new FontAtlasTextManipulator(text);
                app.stage.addChildAt(manipulator, 0);

                // Act - "is? I a"
                manipulator.select(17, CARET_POSITION.START);
                manipulator.arrowLeft(true);
                manipulator.arrowLeft(true);
                manipulator.arrowLeft(true);
                manipulator.arrowLeft(true);
                manipulator.arrowLeft(true);
                manipulator.arrowLeft(true);
                manipulator.arrowLeft(true);
                app.ticker.update();

                // Assert
                writeDataUrlToDisk(app.view.toDataURL(), 'test')
                let bounds = roundBounds(manipulator.drawSelection.getBounds());
                expect(bounds.x).to.equal(0);
                expect(bounds.y).to.equal(0);
                expect(bounds.width).to.equal(66);
                expect(bounds.height).to.equal(24);
            });
        });

        describe('forward', () => {
            it('a single word', async() => {
                // Assemble
                const displayText = 'What'
                const {app, text} = await createFontAtlasTextApp({
                    displayText,
                    width: 64,
                    height: 64,
                });
                const manipulator = new FontAtlasTextManipulator(text);
                app.stage.addChildAt(manipulator, 0);

                // Act
                manipulator.select(0, CARET_POSITION.START);
                manipulator.arrowRight(true);
                manipulator.arrowRight(true);
                manipulator.arrowRight(true);
                manipulator.arrowRight(true);
                app.ticker.update();

                // Assert
                writeDataUrlToDisk(app.view.toDataURL(), 'test')
                const bounds = roundBounds(manipulator.drawSelection.getBounds());
                expect(bounds.x).to.equal(0);
                expect(bounds.y).to.equal(0);
                expect(bounds.width).to.equal(27);
                expect(bounds.height).to.equal(12);
            });

            it('multiple words on a single line', async() => {
                // Assemble
                const displayText = 'This is it'
                const {app, text} = await createFontAtlasTextApp({
                    displayText,
                    width: 64,
                    height: 64,
                });
                const manipulator = new FontAtlasTextManipulator(text);
                app.stage.addChildAt(manipulator, 0);

                // Act - "is i"
                manipulator.select(2, CARET_POSITION.START);
                manipulator.arrowRight(true);
                manipulator.arrowRight(true);
                manipulator.arrowRight(true);
                manipulator.arrowRight(true);
                app.ticker.update();

                // Assert
                writeDataUrlToDisk(app.view.toDataURL(), 'test')

                let bounds = roundBounds(manipulator.drawSelection.getBounds());
                expect(bounds.x).to.equal(15);
                expect(bounds.y).to.equal(0);
                expect(bounds.width).to.equal(13);
                expect(bounds.height).to.equal(12);

                // Act
                manipulator.select(1, CARET_POSITION.END);
                manipulator.arrowRight(true);
                manipulator.arrowRight(true);
                manipulator.arrowRight(true);
                manipulator.arrowRight(true);
                app.ticker.update();

                // Assert
                writeDataUrlToDisk(app.view.toDataURL(), 'test')

                bounds = roundBounds(manipulator.drawSelection.getBounds());
                expect(bounds.x).to.equal(15);
                expect(bounds.y).to.equal(0);
                expect(bounds.width).to.equal(13);
                expect(bounds.height).to.equal(12);
            });

            it('multiple words on two lines', async() => {
                // Assemble
                const displayText = 'This is this? I am not sure.'
                const {app, text} = await createFontAtlasTextApp({
                    displayText,
                    width: 64,
                    height: 64,
                });
                const manipulator = new FontAtlasTextManipulator(text);
                app.stage.addChildAt(manipulator, 0);

                // Act - "is? I a"
                manipulator.select(10, CARET_POSITION.START);
                manipulator.arrowRight(true);
                manipulator.arrowRight(true);
                manipulator.arrowRight(true);
                manipulator.arrowRight(true);
                manipulator.arrowRight(true);
                manipulator.arrowRight(true);
                manipulator.arrowRight(true);
                app.ticker.update();

                // Assert
                writeDataUrlToDisk(app.view.toDataURL(), 'test')
                let bounds = roundBounds(manipulator.drawSelection.getBounds());
                expect(bounds.x).to.equal(0);
                expect(bounds.y).to.equal(0);
                expect(bounds.width).to.equal(66);
                expect(bounds.height).to.equal(24);

                // Act
                manipulator.select(9, CARET_POSITION.END);
                manipulator.arrowRight(true);
                manipulator.arrowRight(true);
                manipulator.arrowRight(true);
                manipulator.arrowRight(true);
                manipulator.arrowRight(true);
                manipulator.arrowRight(true);
                manipulator.arrowRight(true);
                app.ticker.update();

                // Assert
                writeDataUrlToDisk(app.view.toDataURL(), 'test')
                bounds = roundBounds(manipulator.drawSelection.getBounds());
                expect(bounds.x).to.equal(0);
                expect(bounds.y).to.equal(0);
                expect(bounds.width).to.equal(66);
                expect(bounds.height).to.equal(24);
            });

            it('multiple words on several lines', async() => {
                // Assemble
                const displayText = 'This is this? What?\nI am not sure.'
                const {app, text} = await createFontAtlasTextApp({
                    displayText,
                    width: 64,
                    height: 64,
                });
                const manipulator = new FontAtlasTextManipulator(text);
                app.stage.addChildAt(manipulator, 0);

                // Act
                manipulator.select(10, CARET_POSITION.START, false);
                manipulator.select(20, CARET_POSITION.START, true);
                app.ticker.update();

                // Assert
                writeDataUrlToDisk(app.view.toDataURL(), 'test')

                let bounds = roundBounds(manipulator.drawSelection.getBounds());
                expect(bounds.x).to.equal(0);
                expect(bounds.y).to.equal(0);
                expect(bounds.width).to.equal(66);
                expect(bounds.height).to.equal(36);
            });
        })
    })

    // TODO: use select instead of click

    describe('can add glyphs', () => {
        it('when starting from an empty element', async() => {
            // Assemble
            const displayText = ''
            const {app, text} = await createFontAtlasTextApp({
                displayText,
                width: 64,
                height: 64,
            });
            const manipulator = new FontAtlasTextManipulator(text);
            manipulator.caret.caretVisibleDuration = 0;
            app.stage.addChildAt(manipulator, 0);

            // Act - empty
            manipulator.click(0, 0, false);
            app.ticker.update();

            // Assert
            expect(text.text).to.equal("");
            expect(manipulator._activeGlyph()).to.eql([0, 0]);


            // Act - add word
            manipulator.onInput('H')
            manipulator.onInput('e')
            manipulator.onInput('l')
            manipulator.onInput('l')
            manipulator.onInput('o')
            app.ticker.update();

            // Assert
            writeDataUrlToDisk(app.view.toDataURL(), 'test')
            expect(text.text).to.equal("Hello");
            expect(manipulator._activeGlyph()).to.eql([4, 1]);

            const bounds = roundBounds(text.getBounds());
            expect(bounds.x).to.equal(1);
            expect(bounds.y).to.equal(0);
            expect(bounds.width).to.equal(26);
            expect(bounds.height).to.equal(9);
        });

        it('when adding word at the start', async() => {
            // Assemble
            const displayText = 'world'
            const {app, text} = await createFontAtlasTextApp({
                displayText,
                width: 64,
                height: 64,
            });
            const manipulator = new FontAtlasTextManipulator(text);

            // Act and assert
            manipulator.click(0, 0, false);
            expect(manipulator._activeGlyph()).to.eql([0, 0])
            manipulator.onInput('h')
            expect(manipulator._activeGlyph()).to.eql([1, 0])
            manipulator.onInput('e')
            expect(manipulator._activeGlyph()).to.eql([2, 0])
            manipulator.onInput('l')
            expect(manipulator._activeGlyph()).to.eql([3, 0])
            manipulator.onInput('l')
            expect(manipulator._activeGlyph()).to.eql([4, 0])
            manipulator.onInput('o')
            expect(manipulator._activeGlyph()).to.eql([5, 0])
            manipulator.onInput(' ')
            expect(manipulator._activeGlyph()).to.eql([6, 0])
            app.ticker.update();

            // Final assert - ensure we end up with hello world
            writeDataUrlToDisk(app.view.toDataURL(), 'test')
            const bounds = roundBounds(text.getBounds());
            expect(bounds.x).to.equal(1);
            expect(bounds.y).to.equal(0);
            expect(bounds.width).to.equal(57);
            expect(bounds.height).to.equal(12);
        });

        it('when adding word at end', async() => {
            // Assemble
            const displayText = 'hello'
            const {app, text} = await createFontAtlasTextApp({
                displayText,
                width: 64,
                height: 64
            });
            const manipulator = new FontAtlasTextManipulator(text);
            manipulator.caret.caretVisibleDuration = 0;
            app.stage.addChildAt(manipulator, 0);

            // Act
            manipulator.click(60, 0, false);
            manipulator.onInput(' ')
            manipulator.onInput('w')
            manipulator.onInput('o')
            manipulator.onInput('r')
            manipulator.onInput('l')
            manipulator.onInput('d')
            app.ticker.update();

            // Assert
            writeDataUrlToDisk(app.view.toDataURL(), 'test')
            expect(text.text).to.equal('hello world')
            expect(manipulator._activeGlyph()).to.eql([10, 1])
            const bounds = roundBounds(text.getBounds());
            expect(bounds.x).to.equal(1);
            expect(bounds.y).to.equal(0);
            expect(bounds.width).to.equal(57);
            expect(bounds.height).to.equal(12);
        });

        it('when adding word inbetween', async() => {
            // Assemble
            const displayText = 'Who it?'
            const {app, text} = await createFontAtlasTextApp({
                displayText,
                width: 64,
                height: 64,
            });
            const manipulator = new FontAtlasTextManipulator(text);
            manipulator.caret.caretVisibleDuration = 0;
            app.stage.addChildAt(manipulator, 0);

            // Act
            manipulator.click(25, 0, false);
            expect(manipulator._activeGlyph()).to.eql([4, 0])
            manipulator.onInput('i')
            manipulator.onInput('s')
            manipulator.onInput(' ')
            app.ticker.update();

            // Assert
            writeDataUrlToDisk(app.view.toDataURL(), 'test')
            expect(text.text).to.equal('Who is it?')
            expect(manipulator._activeGlyph()).to.eql([7, 0])
            const bounds = roundBounds(text.getBounds());
            expect(bounds.x).to.equal(0);
            expect(bounds.y).to.equal(0);
            expect(bounds.width).to.equal(51);
            expect(bounds.height).to.equal(12);
        });
    });

    describe('can delete glyphs', () => {
        it('can delete glyph inbetween', async() => {
            // Assemble
            const displayText = 'Whatdow'
            const {app, text} = await createFontAtlasTextApp({
                displayText,
                width: 64,
                height: 64,
            });
            const manipulator = new FontAtlasTextManipulator(text);
            manipulator.caret.caretVisibleDuration = 0;
            app.stage.addChildAt(manipulator, 0);

            // Act - delete d
            manipulator.click(30, 0, false);
            manipulator.arrowRight();
            manipulator.onDelete();

            // Assert
            app.ticker.update();
            expect(manipulator._activeGlyph()).to.eql([4, 0])

            // Act - add " n"
            manipulator.onInput(' ')
            manipulator.onInput('n')
            app.ticker.update();

            // Assert
            writeDataUrlToDisk(app.view.toDataURL(), 'test')
            expect(text.text).to.equal('What now');
            expect(manipulator._activeGlyph()).to.eql([6, 0])
            const bounds = roundBounds(text.getBounds());
            expect(bounds.x).to.equal(0);
            expect(bounds.y).to.equal(0);
            expect(bounds.width).to.equal(53);
            expect(bounds.height).to.equal(12);
        });

        it('can delete glyph at the end', async() => {
            // Assemble
            const displayText = 'What is now!'
            const {app, text} = await createFontAtlasTextApp({
                displayText,
                width: 64,
                height: 64,
            });
            const manipulator = new FontAtlasTextManipulator(text);
            manipulator.caret.caretVisibleDuration = 0;
            app.stage.addChildAt(manipulator, 0);

            // Act
            manipulator.select(11, RIGHT);
            manipulator.onDelete();
            app.ticker.update();

            // Assert
            writeDataUrlToDisk(app.view.toDataURL(), 'test')
            expect(text.text).to.equal('What is now');
            expect(manipulator._activeGlyph()).to.eql([10, 1])
            const bounds = roundBounds(text.getBounds());
            expect(bounds.x).to.equal(0);
            expect(bounds.y).to.equal(0);
            expect(bounds.width).to.equal(42);
            expect(bounds.height).to.equal(21);
        });

        it('can delete word inbetween', async() => {
            // Assemble
            const displayText = 'Whathis now'
            const {app, text} = await createFontAtlasTextApp({
                displayText,
                width: 64,
                height: 64
            });
            const manipulator = new FontAtlasTextManipulator(text);
            manipulator.caret.caretVisibleDuration = 0;
            app.stage.addChildAt(manipulator, 0);

            // Act - delete his
            manipulator.click(30, 0, false);
            manipulator.arrowRight(true);
            manipulator.arrowRight(true);
            manipulator.arrowRight(true);
            manipulator.onDelete();
            app.ticker.update();

            // Assert
            writeDataUrlToDisk(app.view.toDataURL(), 'test');
            expect(text.text).is.equal('What now');
            expect(manipulator._activeGlyph()).to.eql([4, 0]);
            const bounds = roundBounds(text.getBounds());
            expect(bounds.x).to.equal(0);
            expect(bounds.y).to.equal(0);
            expect(bounds.width).to.equal(53);
            expect(bounds.height).to.equal(12);
        });
    })

    it('can continuously add and remove words', async() => {
        // Assemble
        const displayText = 'What'
        const {app, text} = await createFontAtlasTextApp({
            displayText,
            width: 64,
            height: 64,
        });
        const manipulator = new FontAtlasTextManipulator(text);
        manipulator.caret.caretVisibleDuration = 0;
        app.stage.addChildAt(manipulator, 0);

        // Act - delete word
        manipulator.click(0, 0, false);
        manipulator.arrowRight(true);
        manipulator.arrowRight(true);
        manipulator.arrowRight(true);
        manipulator.arrowRight(true);
        manipulator.onDelete()
        app.ticker.update();

        // Assert
        writeDataUrlToDisk(app.view.toDataURL(), 'test')
        expect(text.text).to.equal('');
        expect(manipulator._activeGlyph()).to.eql([0,0])

        let bounds = roundBounds(text.getBounds());
        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(0);
        expect(bounds.height).to.equal(0);

        // Act - add word
        manipulator.onInput('W')
        manipulator.onInput('o')
        manipulator.onInput('r')
        manipulator.onInput('l')
        manipulator.onInput('d')
        app.ticker.update();

        // Assert
        writeDataUrlToDisk(app.view.toDataURL(), 'test')
        expect(text.text).to.equal('World');
        expect(manipulator._activeGlyph()).to.eql([4, 1]);

        bounds = roundBounds(text.getBounds());
        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(30);
        expect(bounds.height).to.equal(9);

        // Act - replace character
        manipulator.click(0, 0, false);
        manipulator.arrowRight(true);
        manipulator.onDelete();
        manipulator.onInput('w');
        manipulator.arrowLeft(false);
        app.ticker.update();

        // Assert
        writeDataUrlToDisk(app.view.toDataURL(), 'test')
        expect(text.text).to.equal('world');
        expect(manipulator._activeGlyph()).to.eql([0, 0]);

        bounds = roundBounds(text.getBounds());
        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(28);
        expect(bounds.height).to.equal(9);

        // Act - add word
        manipulator.onInput('a')
        manipulator.onInput(' ')
        app.ticker.update();

        // Assert
        writeDataUrlToDisk(app.view.toDataURL(), 'test')
        expect(text.text).to.equal('a world');
        expect(manipulator._activeGlyph()).to.eql([2, 0]);

        bounds = roundBounds(text.getBounds());
        expect(bounds.x).to.equal(1);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(38);
        expect(bounds.height).to.equal(12);

        // Act - add word
        manipulator.arrowLeft(false);
        manipulator.arrowLeft(false);
        manipulator.onInput('W')
        manipulator.onInput('h')
        manipulator.onInput('a')
        manipulator.onInput('t')
        manipulator.onInput(' ')
        app.ticker.update();

        // Assert
        writeDataUrlToDisk(app.view.toDataURL(), 'test')
        expect(text.text).to.equal("What a world");
        expect(manipulator._activeGlyph()).to.eql([5, 0]);

        bounds = roundBounds(text.getBounds());
        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(40);
        expect(bounds.height).to.equal(21);
    });
})