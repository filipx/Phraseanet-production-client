import $ from 'jquery';
import ConfigService from './../components/core/configService';
import LocaleService from '../components/locale';
import defaultConfig from './config';
import Emitter from '../components/core/emitter';
import thesaurus from './../components/thesaurus/editor/index';

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

        window.bodySize = {
            x: 0,
            y: 0
        };

        /**
         * add components
         */

        $(document).ready(() => {
            let $body = $('body');
            window.bodySize.y = $body.height();
            window.bodySize.x = $body.width();

            thesaurus(this.appServices).initialize({$container: $body});
        });

    }
}

const bootstrap = (userConfig) => {
    return new Bootstrap(userConfig);
};

export default bootstrap;
