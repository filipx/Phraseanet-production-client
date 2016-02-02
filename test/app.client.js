import app from '../src';

describe('app - browser tests', () => {

    describe('app', () => {

        describe('Example function', () => {

            it('should say "hello"', () => {
                expect(app.example()).to.eql('hello');
            });

            it('should say "world!"', () => {
                expect(app.fooBar()).to.eql('world!');
            });
        });

        describe('Browser stuff', () => {

            it('should handle document', () => {
                expect(typeof document).to.eql('object');
            });

        });
    });

    it('should be a function', () => {
        expect(typeof app.example).to.eql('function');
    });
});
