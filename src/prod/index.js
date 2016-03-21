import * as utils from './../components/utils/utils.js';
import bootstrap from './bootstrap.js';

let ProductionApplication = {
    bootstrap, utils
};

if (typeof window !== 'undefined') {
    window.ProductionApplication = ProductionApplication;
}

module.exports = ProductionApplication;
