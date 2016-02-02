/* global expect */
/* eslint padded-blocks: 0*/
/* eslint no-unused-expressions: 0*/
/* eslint max-nested-callbacks: 0*/
import app from '../src';

describe('app - server and browser tests', () => {

    describe('app', () => {

        describe('Example function', () => {

            it('should say "hello"', () => {
                expect(app.example()).to.eql('hello');
            });

			it('should say "world!"', () => {
                expect(app.fooBar()).to.eql('world!');
            });
        });
    });

    it('should be a function', () => {
        expect(typeof app.example).to.eql('function');
    });
});
