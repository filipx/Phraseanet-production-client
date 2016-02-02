import $ from 'jquery';
import notify from '../../../src/components/notify';

describe('Notify Component - browser tests', () => {
    it('should exposes a public API', () => {
        const methods = Object.keys(notify())
        expect(methods.length).to.eql(3);
        expect(methods).to.contain('createNotifier');
        expect(methods).to.contain('isValid');
        expect(methods).to.contain('poll');
    });


    describe('create notification', () => {
        it('should fail to create an invalid notification object', () => {
            const notifierInstance = notify().createNotifier();
            expect(notifierInstance).to.eql( {
                url: null,
                moduleId: null,
                userId: null,
                _isValid: false
            });
        });
        it('should be able to create a valid notification object', () => {
            const notifierInstance = notify().createNotifier({
                url: 'url',
                moduleId: 1,
                userId: 1
            });
            expect(notifierInstance.url).to.eql('url');
            expect(notifierInstance.moduleId).to.eql(1);
            expect(notifierInstance.userId).to.eql(1);
            expect(notify().isValid(notifierInstance)).to.eql(true);
        });

    });
    
});
