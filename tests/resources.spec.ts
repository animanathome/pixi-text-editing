import { expect } from 'chai';
describe('resources', () => {
    it('can be loaded', async() => {
        const response = await fetch('http://localhost:8080/resources/Montserrat-Regular.ttf');
        expect(response.status).to.equal(200);
    });
});