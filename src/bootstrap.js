// import * as $ from 'jquery';
import notify from './components/notify';

const bootstrap = (configuration) => {

    let notifyProdState = {
        url: configuration.notify.url,
        moduleId: configuration.notify.moduleId,
        userId: configuration.notify.userId
    };

    notifyProdState = notify().createNotifier(notifyProdState);

    if (notify().isValid(notifyProdState)) {
        notify().poll(notifyProdState);
    } else {
        throw new Error('implementation error: failed to configure new notification');
    }

    return this;
};

export default bootstrap;
