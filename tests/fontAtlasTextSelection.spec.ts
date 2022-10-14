import { expect } from 'chai';
import {createFontAtlasTextApp} from '../tests/utils'
import {FontAtlasTextSelection} from "../src/fontAtlasTextSelection";

describe('FontAtlasTextSelection', () => {
    it('can draw a single line selection', async() => {
        // Assemble
        const {app, text} = await createFontAtlasTextApp('hello', 28, 28)
        const selection = new FontAtlasTextSelection(text);
        app.stage.addChild(selection);

        // Act
        selection.extendSelection(0)
        selection.extendSelection(1)
        selection.extendSelection(2)
        selection._update()
        app.ticker.update();

        // Assert
        const url = app.view.toDataURL()
        const expectedUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAB1ElEQVRIS+2Tv2vicBjGnxIwQn5Urjj0JGepixFaEfwHuvkvOLi6Ors5KE7iKIgugrugg5MFx6OToo1DTg2IgyJnri050FryLXdUmtZES5fmXZOHz/t+8uRos9lsbjgO4XAYVuaXLONcUUgkmUwim82aih/tC5RlGb5DgKFQCOpyidV6jWOeh4Om3934IGCbosDzPFiWxV9NA8tx8Hq9WCwWGAwGZIH7hwdQFIVAIACn0wkj4Gw2Qzwex2Qygc/nQ7PZRCqVQiKR+L88UfqTYXB5cQGapvF7uYSiKAgGg+j1emAZBh6PB+vHR3Q6HQREEQzLGgLL5TKq1SparRY0TSPAUqmERqOxDXxZmvu7O9xKEimRJEkk+HJ+CAK+nZwYAjOZDObzOfL5PInol0ajUbTbbXNA/UK32w2Hw7EFdblchsBarYZ6vQ79Un10U5FIBP1+3xxwOp3ij6rCe3ZGdI9GI3w/PSWFMvqG4/EYsVgMuVwOoiiiUqmg2+2iUCiYA+qw4XBICsNxHFarFfx+/5ulUVWV6Eyn0xAEgfSgWCwSS/+GlAZXV6Z+2lcvXV9bzn0VoGUx+weelX7i2MAPl20rtZVaNmCXxrKyXQFb6S5Dlp8/AUOoZbxZi6pTAAAAAElFTkSuQmCC';
        expect(url).to.equal(expectedUrl);
    })

    it('can draw a double line selection', async() => {
        // Assemble
        const {app, text} = await createFontAtlasTextApp('hello\nhello', 30, 30)
        const selection = new FontAtlasTextSelection(text);
        app.stage.addChild(selection);

        // Act
        selection.extendSelection(4)
        selection.extendSelection(5)
        selection.extendSelection(6)
        selection.extendSelection(7)
        selection._update()
        app.ticker.update();

        // Assert
        const url = app.view.toDataURL()
        const expectedUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAADWElEQVRIS+2WS0iiURTH/yGjk68ZBoKyHG0MX6A9iJ4EtSraRosWLVrUpkWrgiCioAiKaBlERQRFy6CggkgwMhoHQqPUNmVjWOTU6GQZpg33SqB1G/xqmBhmzvLjnPO759z/OfdLubu7u8vNzYXNZgMX6+jowODgIA3p7OzEwMAAUFWVXAqTCSnPBbe3t2NoaOjlYIvFgo2NDQQCAZSVlUEmk/3y9L8FLBQKUVxcDKPRCI/Hg/z8fHR1dWFlZQXNzc0oKSmBw+EA8Zubm0N2djZY4HB5OVz7+7i5uUFqairOz8+hVCqRlZWVWMR9qzUaDZaWlqjD+vo6va/V1VXU19fTw7S2tuL6+hrV1dWYnZ2l31hgr1aL09NT5OXlIRqNUrDX64XBYGCD48Vlt9vR2NhIxdbU1ITDw8OEIAKsra1lgt2fPiEcDiMnJ4fGkMr39vZoBxOMJa54MKm4rq4O6enpCXGVlZVMsM9gwDefDxqtNgYOhWCz21FUVMQNPDk5ia2tLXR3dyMzMxO9vb30zonwWK0OlZZSLeSoVBCKRDg5OUEwGIRareYGtlqtVGQkWUFBAS4uLjA1NfWkuCIVFfjq8cDtdkMgEEAsFkOjVuMNn88GJzf1SXhxXSBJpEzO5a8Bf5FIUFhYmFxVxMtkAnNXJ58htqufA2auzOeAyZAH/H7cRiJ4J5WCLxA8ncZkYo4TB26sYjOPB6lUSuVPhl4skUChUNCV53K56EGCV1fg8XjQ6/V4u7nJBJ+dnaGlpQXHx8dQqVRYXl5GT08P2traHp2Jgj+LRDAaDHT2vvv9ODo6Almju7u7EItEdHlEolGQrabX6SCyWpngiYkJzMzMYG1tDaFQiILHx8exuLjIBsffcfDyEg6nk4rN6XTSBPH2US7HB7udCe7v74fP58PIyAgNIZU3NDTAbDZzA5OK09LSwH+wed5vbzPB8/PzWFhYAKmcGOlcTU0NfSge2iNVx1dMnrQfgQAUSiW9BvJSyTIywLdY2K+T201ftuHhYeh0OkxPT2NnZwejo6PcwAR6cHBAhSWRSHB7ewutVvukuMjfC2lzX18f5HI51cnY2BjtGrPipH/S7qNNJi6Tw/Slrf4HwS9uHPcEsVa/gv0H/7Gmv1qrfwKhxWnFsRbcDwAAAABJRU5ErkJggg==';
        expect(url).to.equal(expectedUrl);
    })

    it('can draw a triple line selection', async() => {
        // Assemble
        const {app, text} = await createFontAtlasTextApp('hello\nhello\nhello', 36, 36)
        const selection = new FontAtlasTextSelection(text);
        app.stage.addChild(selection);

        // Act
        selection.extendSelection(4)
        selection.extendSelection(5)
        selection.extendSelection(6)
        selection.extendSelection(7)
        selection.extendSelection(8)
        selection.extendSelection(9)
        selection.extendSelection(10)
        selection.extendSelection(11)
        selection.extendSelection(12)

        selection._update()
        app.ticker.update();

        // Assert
        const url = app.view.toDataURL()
        const expectedUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAD00lEQVRYR+2YXShkYRjH/5rWYD5WK+Vr1pjRfKjxlXymuCK3cuHChQtuXLiilESRIrlUQlLkUlEoUWTK2hsjjK0ZHztCZseaMQzzYXvf3Taz3pk5R8fN7r53Mz3vOb/zPM/5/9/nRD09PT3l5ORgZ2cHfFZ7ezsGBgbolo6ODvT39wOVldwusbYWMi7qtUBtbW0YHBx8OyCj0YjNzU04nU6UlpYiJSUl7NO+KVBcXByKioqQnZ0Nm82GvLw8dHZ2Ynl5GU1NTSguLsbBwQFI3OzsLDIyMsAC8paV4fDLFzw8PCA2NhYOhwNKpRJpaWnBDxepZFqtFouLi3TjxsYG7YeVlRXU1dVRyJaWFtzf36OqqgozMzP0PxbQuU6Hy8tL5ObmIhAIUKDz83MYDAZ+QM+b2mQyoaGhgTZ5Y2Mjjo+Pgy5GQGpqaphAJyoVvF4vMjMz6R6Sqf39fZrxoBUpQ6GASIZqa2uRlJQUdL2KigomkN1gwDe7HVqd7ieQx4MdkwmFhYXCAE1MTGBrawtdXV1ITU1FT08P7SnS8KySeUpKaK9lqtWIk0hwcXEBt9sNjUYjDND29jZtbnKT/Px8XF9fY3JyMmRT+8vL8dVmw8nJCcRiMaRSKbQaDd5FR/MD4qZmHKKEEkYOt+IW8tcCfZbJUFBQwC0Lv6KsFgtUajX9ZbVaoVKpuO+P9Nq/BshisUD9lkBEvJw3N/D5/XgvlyNaLA77xG8KtC4SQS6X09eUiJlUJkN6ejqV/sPDQwrovruDSCRCVlYWYmJiwALyPj4K42WfJBJkGwxUO77f3OD09BREvff29iCVSKgo+gMBEFvJ0ushkUqZQMS3BPGy5z3kvr3FgdlMm9xsNsPj8QSV7qNCgQ8JCUwgIoiCeFkoIJKhxMRERP+htPHx8Uwgu90ujJeFAiIlcDmdSFcqaTmJ86ckJ9OGZ/UQyaYgXhYKiMAcHR3RhpbJZPD5fNDpdCGb2u/zCeRlXCWfu/SFj4wkjJynhX8WiGkdYdJKEsWcywTIIJ3LXgPEHIOEBHrhZUYj/7lMKCCml1mtvOeyq6srNDc34+zsjJ4ElpaW0N3djdbWVs6otGRML3M4eM9l4+PjmJ6exurqKrUcAjQ2NoaFhQV+QExhdLl4z2V9fX0g9jE8PEwBSKbq6+uxvr4uDBDfuWxubg7z8/MgmSKLnBqqq6vpsMh1vXjLfru9ywW+cxlxezL1Dg0NQa/XY2pqCru7uxgZGeHKg7BAfOcy8uWElKu3txcKhYKeqUZHR+mJgeuiQEzriCCMXG/AN+4/UKSM/QBvdXfCwj6+9AAAAABJRU5ErkJggg==';
        expect(url).to.equal(expectedUrl);
    })
})