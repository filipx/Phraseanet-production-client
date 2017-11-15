import $ from 'jquery';
require('./style/main.scss');
import * as utils from './../components/utils/utils.js';
import bootstrap from './bootstrap.js';
require('./../../bower_components/jquery-ui/ui/i18n/datepicker-ar.js');
require('./../../bower_components/jquery-ui/ui/i18n/datepicker-de.js');
require('./../../bower_components/jquery-ui/ui/i18n/datepicker-es.js');
require('./../../bower_components/jquery-ui/ui/i18n/datepicker-fr.js');
require('./../../bower_components/jquery-ui/ui/i18n/datepicker-nl.js');
require('./../../bower_components/jquery-ui/ui/i18n/datepicker-en-GB.js');

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
