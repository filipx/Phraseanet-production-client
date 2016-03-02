// import * as $ from 'jquery';
let $ = require('jquery');
// let dialogModule = require('../node_modules/phraseanet-common/src/components/dialog.js');
import * as AppCommons from 'phraseanet-common';

import cgu from './components/cgu';
import preferences from './components/preferences';
import publication from './components/publication';
import workzone from './components/ui/workzone';
//import { dialogModule } from 'phraseanet-common';
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
import search from './components/search';


class Bootstrap {

    app;
    configService;
    localeService;
    appServices;
    appUi;
    appCgu;
    appPreferences;
    appPublication;
    appWorkzone;

    constructor(userConfig) {

        const configuration = Object.assign({}, defaultConfig, userConfig);

        this.appEvents = new Emitter();
        this.appEvents.listenAll(user().subscribeToEvents);
        this.appEvents.listenAll(basket().subscribeToEvents);
        this.appEvents.listenAll(search().subscribeToEvents);
        // @TODO add locale/translations in streams


        this.configService = new ConfigService(configuration);
        this.localeService = new LocaleService({
            configService: this.configService
        });

        this.localeService.fetchTranslations()
        .then(() => {
            this.onConfigReady();
        });

        return this;
    }

    onConfigReady() {
        this.appServices = {
            configService: this.configService,
            localeService: this.localeService,
            appEvents: this.appEvents
        };

        // export translation for backward compatibility:
        window.language = this.localeService.getTranslations();

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

        this.appUi = ui(this.appServices);
        this.appCgu = cgu(this.appServices);
        this.appPublication = publication(this.appServices);
        this.appPreferences = preferences(this.appServices);
        this.appWorkzone = workzone(this.appServices);

        $(document).ready(() => {
            let $body = $('body');
            // trigger default route
            this.initState();
            this.initJqueryPlugins();
            this.appUi.initialize();

            // init cgu modal:
            this.appCgu.initialize(this.appServices);
            // init preferences modal:
            this.appPreferences.initialize( {$container: $body});
        });

    }
    initState() {
        let initialState = this.configService.get('initialState');

        switch(initialState) {
            case 'publication':
                this.appPublication.initialize();
                // window.publicationModule.fetchPublications();
                break;
            default:
                // trigger a search on loading
                $('#searchForm').trigger('submit');
                // $('form[name="phrasea_query"]').addClass('triggerAfterInit');
                // trigger last search
        }
    }

    initJqueryPlugins() {
        AppCommons.commonModule.initialize();
        $.datepicker.setDefaults({showMonthAfterYear: false});
        $.datepicker.setDefaults($.datepicker.regional[this.localeService.getLocale()]);

        console.log(AppCommons.commonModule )
        $('#help-trigger').contextMenu('#mainMenu .helpcontextmenu', {
            openEvt: 'click', dropDown: true, theme: 'vista', dropDown: true,
            showTransition: 'slideDown',
            hideTransition: 'hide',
            shadow: false
        });
    }
}

const bootstrap = (userConfig) => {
    return new Bootstrap(userConfig);
};

export default bootstrap;
