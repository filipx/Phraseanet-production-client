import $ from 'jquery';
import _ from 'underscore';
require('geonames-server-jquery-plugin/jquery.geonames.js');

const geonameDatasource = (services) => {
    const {configService, localeService, appEvents} = services;
    const tabContainerName = 'geonameTabContainer';
    let autoActivateTabOnce = true;
    let $container = null;
    let parentOptions = {};
    let $editTextArea;
    let $tabContent;

    const initialize = (options) => {
        let initWith = {$container, parentOptions, $editTextArea} = options;

        appEvents.emit('recordEditor.addToolTab', {
            id: tabContainerName,
            title: localeService.t('Geoname Datasource')
        });
        // reset for each fields
        autoActivateTabOnce = true;
    };

    const onAddToolTabComplete = (params) => {
        let {origParams} = params;
        if (origParams.id === tabContainerName) {
            $tabContent = $(`#${tabContainerName}`, $container);
            bindEvents();
        }
    };

    const bindEvents = () => {
        let cclicks = 0;
        const cDelay = 350;
        let cTimer = null;
        $tabContent.on('click', '.geoname-add-action', (event) => {
            event.preventDefault();
            cclicks++;

            if (cclicks === 1) {
                cTimer = setTimeout(function () {
                    cclicks = 0;
                }, cDelay);

            } else {
                clearTimeout(cTimer);
                onSelectValue(event);
                cclicks = 0;
            }
        })
    };

    const onSelectValue = (event) => {
        event.preventDefault();
        let $el = $(event.currentTarget);
        let value = $el.data('city');

        // the field may have changed over time
        let field = parentOptions.fieldCollection.getActiveField();
        switch (field.name) {
            case 'City':
                value = $el.data('city');
                break;
            case 'Country':
                value = $el.data('country');
                break;
            case 'Province':
                value = $el.data('province');
                break;
            default:
                break;
        }

        // send prefill instruction for related fields:
        // send data for all geo fields (same as preset API)
        let presets = {
            fields: {
                City: [$el.data('city')],
                Country: [$el.data('country')],
                Province: [$el.data('province')]
            }
        };

        appEvents.emit('recordEditor.addPresetValuesFromDataSource', {data: presets, mode: 'emptyOnly'});

        // force update on current field:
        appEvents.emit('recordEditor.addValueFromDataSource', {value: value, field: field});
    };

    const highlight = (s, t) => {
        var matcher = new RegExp('(' + t + ')', 'ig');
        return s.replace(matcher, '<span class="ui-state-highlight">$1</span>');
    };

    const searchValue = (params) => {

        let {event, value, field} = params;
        let datas = {
            sort: '',
            sortParams: '',
            'client-ip': null,
            country: '',
            name: '',
            limit: 20
        };
        let searchType = false;
        let name;
        let country;

        let terms = value.split(',');
        if (terms.length === 2) {
            country = terms.pop();
        }

        name = terms.pop();

        switch (field.name) {
            case 'City':
                searchType = 'city';
                datas.name = $.trim(name);
                datas.country = $.trim(country);
                break;
            case 'Country':
                searchType = 'city';
                datas.country = $.trim(name);
                break;
            case 'Province':
                // @TODO - API can't search by region/province
                searchType = 'city';
                datas.province = $.trim(name);
                // datas.country = $.trim(country);
                break;
            default:
        }

        if (searchType === false) {
            return;
        }

        // switch tab only on the first search:
        if (autoActivateTabOnce === true) {
            appEvents.emit('recordEditor.activateToolTab', tabContainerName);
            autoActivateTabOnce = false;
        }

        fetchGeoname(
            searchType,
            datas,
            function (jqXhr, status, error) {
                if (jqXhr.status !== 0 && jqXhr.statusText !== 'abort') {
                    console.log('error occured', [jqXhr, status, error])
                }
            },
            function (data) {
                return data;
            }
        );
    };

    const fetchGeoname = (resource, datas, errorCallback, parseresults) => {
        let url = configService.get('geonameServerUrl');
        url = url.substr(url.length - 1) === '/' ? url : url + '/';

        return $.ajax({
            url: url + resource,
            data: datas,
            dataType: 'jsonp',
            jsonpCallback: 'parseresults',
            success: function (data) {
                let template = '';
                _.map(data || [], function (item) {
                    let country = country ? country : name;
                    let labelName = highlight(item.name, name);
                    let labelCountry = highlight((item.country ? item.country.name || '' : ''), country);
                    let regionName = (item.region ? item.region.name || '' : '');
                    let labelRegion = highlight(regionName, name);
                    let location = {
                        value: labelName + (labelRegion !== '' ? ', <span class="region">' + labelRegion + '</span>' : ''),
                        label: (labelCountry !== '' ? labelCountry : ''),
                        geonameid: item.geonameid
                    };

                    template += `
                    <li class="geoname-add-action" data-city="${item.name}" data-country="${item.country.name}" data-province="${regionName}"><p>
                        <span>${location.value}</span>
                        <br>
                        <span>${location.label}</span></p>
                    </li>`;
                });

                $tabContent.empty().append(`<ul class="geoname-results">${template}</ul>`);
            },
            error: function (xhr, status, error) {
                console.log(status + '; ' + error);
            }
        });
    };

    appEvents.listenAll({
        'recordEditor.addToolTab.complete': onAddToolTabComplete,
        'recordEditor.userInputValue': searchValue
    });

    return {initialize};
};
export default geonameDatasource;
