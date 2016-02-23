// import * as $ from 'jquery';
import notify from './components/notify/index';
import Locale from './components/locale';
import ui from './components/ui';
import ConfigService from './components/core/configService';
import LocaleService from './components/locale';
import i18next from 'i18next';
import defaultConfig from './config';
import Emitter from './components/core/emitter';
import user from './components/user';
import basket from './components/basket';


class Bootstrap {

    app;
    configService;
    localeService;
    appServices;

    constructor(userConfig) {

        const configuration = Object.assign({}, defaultConfig, userConfig);

        this.appEvents = new Emitter();
        this.appEvents.listenAll(user().subscribeToEvents)
        this.appEvents.listenAll(basket().subscribeToEvents)


        this.configService = new ConfigService(configuration);
        this.localeService = new LocaleService({
            configService: this.configService
        });

        this.localeService.fetchTranslations()
        .then(() => {
            this.onConfigReady();
        });
    }

    onConfigReady() {
        this.appServices = {
            configService: this.configService,
            localeService: this.localeService,
            appEvents: this.appEvents
        };

        let translations = [];
        let appProdNotification = {
            url: this.configService.get('notify.url'),
            moduleId: this.configService.get('notify.moduleId'),
            userId: this.configService.get('notify.userId')
        };

        /**
         * Initialize notifier
         * @type {{bindEvents, createNotifier, isValid, poll}}
         */
        const notifier = notify(this.appServices);
        notifier.initialize();

        // create a new notification poll:
        appProdNotification = notifier.createNotifier(appProdNotification);

        if (notifier.isValid(appProdNotification)) {
            notifier.poll(appProdNotification);
        } else {
            throw new Error('implementation error: failed to configure new notifier');
        }

        const appUi = ui(this.appServices);

        appUi.initialize();
    }
}

const bootstrap = (userConfig) => {
    return new Bootstrap(userConfig);
};

export default bootstrap;
