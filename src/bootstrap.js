// import * as $ from 'jquery';
import notify from './components/notify';
import Locale from './components/locale';
import ui from './components/ui';
import config from './components/core/config.js';


const applicationState = {};

const setupApplication = ( translations, userConfig ) => {
    console.log('ok setup application', translations);
    config(translations).setupAppConfig();

    const notifier = notify(translations);
    notifier.bindEvents();
    let appProdNotification = {
        url: userConfig.notify.url,
        moduleId: userConfig.notify.moduleId,
        userId: userConfig.notify.userId
    };

    appProdNotification = notifier.createNotifier(appProdNotification);

    if (notifier.isValid(appProdNotification)) {
        notifier.poll(appProdNotification);
    } else {
        throw new Error('implementation error: failed to configure new notification');
    }

    ui(translations).attachUi();
}

const bootstrap = (configuration) => {

    const haveTranslation = new Locale().fetchLang();

    haveTranslation
        .then((translations) => setupApplication(translations, configuration))

    return this;
};

export default bootstrap;
