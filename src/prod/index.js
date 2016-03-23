import $ from 'jquery';
require('./style/main.scss');
import * as utils from './../components/utils/utils.js';
import bootstrap from './bootstrap.js';

$.widget.bridge('uitooltip', $.ui.tooltip);
//window.btn = $.fn.button.noConflict(); // reverts $.fn.button to jqueryui btn
//$.fn.btn = window.btn; // assigns bootstrap button functionality to $.fn.btn

let ProductionApplication = {
    bootstrap, utils
};

if (typeof window !== 'undefined') {
    window.ProductionApplication = ProductionApplication;
}

module.exports = ProductionApplication;
