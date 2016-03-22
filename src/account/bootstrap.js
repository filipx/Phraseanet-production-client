import $ from 'jquery';
import ConfigService from './../components/core/configService';
import LocaleService from '../components/locale';

import defaultConfig from './config';
import Emitter from '../components/core/emitter';
import account from './../components/account';


class Bootstrap {

    app;
    configService;
    localeService;
    appServices;

    constructor(userConfig) {

        const configuration = Object.assign({}, defaultConfig, userConfig);

        this.appEvents = new Emitter();
        this.configService = new ConfigService(configuration);
        this.onConfigReady();
        /*
        this.localeService = new LocaleService({
            configService: this.configService
        });

        this.localeService.fetchTranslations()
            .then(() => {
                this.onConfigReady();
            });*/
        return this;
    }

    onConfigReady() {
        this.appServices = {
            configService: this.configService,
            localeService: this.localeService,
            appEvents: this.appEvents
        };

        /**
         * add components
         */

        $(document).ready(() => {
            let accountService = account(this.appServices);

            accountService.initialize({
                $container: $('body')
            });

            switch (this.configService.get('state')) {
                case 'editAccount':
                    accountService.editAccount();
                    break;
                case 'editSession':
                    accountService.editSession();
                    break;
                default:
            }
        });

    }
}

const bootstrap = (userConfig) => {
    return new Bootstrap(userConfig);
};

export default bootstrap;
