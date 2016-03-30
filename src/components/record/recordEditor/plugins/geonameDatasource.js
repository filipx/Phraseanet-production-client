import $ from 'jquery';
require('geonames-server-jquery-plugin/jquery.geonames.js');

const geonameDatasource = (services) => {
    const {configService, localeService, appEvents} = services;
    let $container = null;
    let parentOptions = {};

    const initialize = (options) => {
        let initWith = {$container, parentOptions} = options;

        // @todo z-index issue
        let geocompleterField = $('.geoname_field').geocompleter({
            server: configService.get('geonameServerUrl'),
            limit: 40
        });

        console.log('geocompleterField init', $('.geoname_field'))

        geocompleterField.geocompleter('autocompleter', 'on', 'autocompletefocus', function (event, ui) {
            $('li', $(event.originalEvent.target)).closest('li').removeClass('selected');
            $('a.ui-state-active, a.ui-state-hover, a.ui-state-focus', $(event.originalEvent.target)).closest('li').addClass('selected');
        });

        // On search request add loading-state
        geocompleterField.geocompleter('autocompleter', 'on', 'autocompletesearch', function (event, ui) {
            $(this).addClass('input-loading');
            $(this).removeClass('input-error');
        });

        // On response remove loading-state
        geocompleterField.geocompleter('autocompleter', 'on', 'autocompleteresponse', function (event, ui) {
            $(this).removeClass('input-loading');
        });

        // On close menu remove loading-state
        geocompleterField.geocompleter('autocompleter', 'on', 'autocompleteclose', function (event, ui) {
            $(this).removeClass('input-loading');
        });

        // On request error add error-state
        geocompleterField.geocompleter('autocompleter', 'on', 'geotocompleter.request.error', function (jqXhr, status, error) {
            $(this).removeClass('input-loading');
            $(this).addClass('input-error');
        });


    };

    return {initialize};
};
export default geonameDatasource;
