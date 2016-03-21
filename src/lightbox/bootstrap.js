import $ from 'jquery';
import notify from '../components/notify/index';
import Locale from '../components/locale';
import ui from '../components/ui';
import ConfigService from './../components/core/configService';
import LocaleService from '../components/locale';
import i18next from 'i18next';
import defaultConfig from './config';
import Emitter from '../components/core/emitter';
import utils from './../components/utils/utils';
import lightbox from './../components/lightbox/index';
class Bootstrap {

    app;
    configService;
    localeService;
    appServices;
    appLightbox;

    constructor(userConfig) {

        const configuration = Object.assign({}, defaultConfig, userConfig);

        this.appEvents = new Emitter();
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

        this.appLightbox = lightbox(this.appServices);

        /**
         * add components
         */

        $(document).ready(() => {
            // @TODO to be removed
            let $body = $('body');
            // trigger default route
            this.initJqueryPlugins();
            this.initDom();

            this.appLightbox.initialize({$container: $body});

            let isReleasable = this.configService.get('releasable');

            if (isReleasable !== null) {
                this.appLightbox.setReleasable(isReleasable);
            }
        });

    }

    initJqueryPlugins() {
        // AppCommons.commonModule.initialize();
    }

    initDom() {
    }
}

const bootstrap = (userConfig) => {
    return new Bootstrap(userConfig);
};

export default bootstrap;
