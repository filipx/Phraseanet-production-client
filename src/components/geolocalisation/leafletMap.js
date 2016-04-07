/* eslint-disable quotes */
/* eslint-disable no-undef */
import $ from 'jquery';
import _ from 'underscore';
import {generateRandStr} from '../utils/utils';
require('./leafletMap.css');
const leafletMap = (services) => {
    const {configService, localeService, eventEmitter} = services;
    let $container = null;
    let parentOptions = {};
    let tabOptions = {};
    let mapUID;
    let mapbox;
    let layerGroup;
    let featureLayer = null;
    let pois = [];
    let map = null;
    let $tabContent;
    let tabContainerName = 'leafletTabContainer';
    let defaultPosition = [2.335062, 48.879162];
    let defaultZoom = 2;
    let accessToken;
    const initialize = (options) => {
        let initWith = {$container, parentOptions, tabOptions} = options;

        mapUID = 'leafletMap' + generateRandStr(5);

        // @TODO deepmerge
        let tabPlist = _.extend({
            tabProperties: {
                id: tabContainerName,
                title: localeService.t('Geolocalisation'),
                classes: 'descBoxes'
            },
            position: 1
        }, tabOptions);

        // select geocoding provider:
        let geocodingProviders = configService.get('geocodingProviders');
        _.each(geocodingProviders, (provider) => {
            if (provider.name === 'mapBox') {
                accessToken = provider['public-key'];
            }
        });
        if (accessToken === undefined) {
            return;
        }
        eventEmitter.emit('appendTab', tabPlist);
        onResizeEditor = _.debounce(onResizeEditor, 300);
    };

    const onRecordSelectionChanged = (params) => {
        if (accessToken === undefined) {
            return;
        }
        let {selection} = params;
        // let pois = loadSelectedRecords();
        refreshMarkers(selection);
    };

    const onTabAdded = (params) => {
        if (accessToken === undefined) {
            return;
        }
        let {origParams, selection} = params;
        if (origParams.tabProperties.id === tabContainerName) {
            $tabContent = $(`#${tabContainerName}`, parentOptions.$container);
            loadLeaflet(selection);
        }
    };

    const loadLeaflet = (pois) => {
        require.ensure([], () => {
            // select geocoding provider:
            mapbox = require('mapbox.js');

            $tabContent.empty().append(`<div id="${mapUID}" class="" style="width: 100%;height:100%; position: absolute;top:0;left:0"></div>`);

            /*if (pois.length > 0) {
             if (poiIsValid(pois[0])) {
             defaultPosition = extractCoords(pois[0])
             defaultZoom = 13;
             }
             }*/
            L.mapbox.accessToken = accessToken;
            map = L.mapbox.map(mapUID, 'mapbox.streets')
                .setView(defaultPosition, defaultZoom);

            featureLayer = L.mapbox.featureLayer([]).addTo(map);

            refreshMarkers(pois);
        });
    };

    const refreshMarkers = (pois) => {
        let geoJsonPoiCollection = [];
        for (let poiIndex in pois) {
            let poi = pois[poiIndex];
            if (poiIsValid(poi)) {
                geoJsonPoiCollection.push({
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: extractCoords(poi)
                    },
                    properties: {
                        //description: `<p>${poi.FileName}</p>`,
                        'marker-color': '0c4554',
                        //'marker-size': 'medium',
                        //'marker-symbol': 'music',
                        'marker-zoom': '14',
                        title: `${poi.FileName}`
                    }
                });
            }
        }
        if (featureLayer !== null) {
            featureLayer.clearLayers();
        } else {
            featureLayer = L.mapbox.featureLayer([]).addTo(map);
        }
        featureLayer.setGeoJSON(geoJsonPoiCollection);

        if (featureLayer.getLayers().length > 0) {
            map.fitBounds(featureLayer.getBounds(), {maxZoom: 10});
        } else {
            // set default position
            map.setView(defaultPosition, defaultZoom);
        }
    }


    const poiIsValid = (poi) => {
        if (poi.Longitude === undefined || poi.Latitude === undefined) {
            return false;
        }
        if (poi.Longitude === null || poi.Latitude === null) {
            return false;
        }
        if (isNaN(poi.Longitude) || isNaN(poi.Latitude)) {
            return false;
        }
        if (poi.Longitude === '' || poi.Latitude === '') {
            return false;
        }
        return true;
    };

    const extractCoords = (poi) => {
        return [parseFloat(poi.Longitude, 10), parseFloat(poi.Latitude, 10)]
    };

    let onResizeEditor = () => {
        if (accessToken === undefined) {
            return;
        }
        if (map !== null) {
            map.invalidateSize();
            if (featureLayer.getLayers().length > 0) {
                map.fitBounds(featureLayer.getBounds());
            } else {
                // set default position
                map.setView(defaultPosition, defaultZoom);
            }
        }
    };


    eventEmitter.listenAll({
        'recordSelection.changed': onRecordSelectionChanged,
        'appendTab.complete': onTabAdded,
        /* eslint-disable quote-props */
        'tabChange': onResizeEditor,
    });
    return {initialize}
};

export default leafletMap;
