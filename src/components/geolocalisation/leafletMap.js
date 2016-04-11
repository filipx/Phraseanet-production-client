/* eslint-disable quotes */
/* eslint-disable no-undef */
import $ from 'jquery';
import _ from 'underscore';
import markerCollection from './markerCollection';
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
    let defaultPosition;
    let defaultZoom;
    let accessToken;
    let fieldPosition;
    let markerDefaultZoom;
    let editable;
    let activeProvider;
    const initialize = (options) => {
        let initWith = {$container, parentOptions, tabOptions} = options;

        editable = options.editable || false;

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

        if (configureGeoProvider() === true) {
            eventEmitter.emit('appendTab', tabPlist);
        }
        onResizeEditor = _.debounce(onResizeEditor, 300);
    };

    const configureGeoProvider = () => {
        let isValid = false;
        // select geocoding provider:
        let geocodingProviders = configService.get('geocodingProviders');
        _.each(geocodingProviders, (provider) => {
            if (provider.enabled === true) {
                activeProvider = provider;
                accessToken = provider['public-key'];
                let fieldMapping = provider['position-fields'];

                if (fieldMapping.length > 0) {
                    fieldPosition = {};
                    _.each(fieldMapping, (mapping) => {
                        // latitude and longitude are combined in a composite field
                        if (mapping.type === 'latlng') {
                            fieldPosition = {
                                latitude: (poi) => extractFromPosition('lat', poi[mapping.name]),
                                longitude: (poi) => extractFromPosition('lng', poi[mapping.name])
                            };
                        } else if (mapping.type === 'lat') {
                            // if latitude field mapping is provided, fallback:
                            fieldPosition.latitude = (poi) => isNaN(parseFloat(poi[mapping.name], 10)) ? false : parseFloat(poi[mapping.name], 10);
                        } else if (mapping.type === 'lng') {
                            // if longitude field mapping is provided, fallback:
                            fieldPosition.longitude = (poi) => isNaN(parseFloat(poi[mapping.name], 10)) ? false : parseFloat(poi[mapping.name], 10);
                        }
                    });
                    if (fieldPosition.latitude !== undefined && fieldPosition.longitude !== undefined) {
                        isValid = true;
                    }
                }
                // set default values:
                defaultPosition = provider['default-position'];
                defaultZoom = provider['default-zoom'] || 2;
                markerDefaultZoom = provider['marker-default-zoom'] || 12;

            }
        });
        if (accessToken === undefined) {
            isValid = false;
        }
        return isValid;
    }

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
            // require('leaflet-contextmenu');

            $tabContent.empty().append(`<div id="${mapUID}" class="phrasea-popup" style="width: 100%;height:100%; position: absolute;top:0;left:0"></div>`);

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
            let poiCoords = extractCoords(poi);
            if (poiCoords[0] !== false && poiCoords[1] !== false) {
                geoJsonPoiCollection.push({
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: poiCoords
                    },
                    properties: {
                        'marker-color': '0c4554',
                        'marker-zoom': '5',
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

        let markerColl = markerCollection(services);
        markerColl.initialize({map, featureLayer, geoJsonPoiCollection, editable});

        if (featureLayer.getLayers().length > 0) {
            map.fitBounds(featureLayer.getBounds(), {maxZoom: markerDefaultZoom});
        } else {
            // set default position
            map.setView(defaultPosition, defaultZoom);
        }
    };

    const extractCoords = (poi) => {
        return [fieldPosition.longitude(poi), fieldPosition.latitude(poi)];
    };

    /**
     * extract latitude or longitude from a position
     * @param name
     * @param source
     * @returns {*}
     */
    const extractFromPosition = (name, source) => {
        if (source === undefined || source === null) {
            return false;
        }

        let position = source.split(' ');

        if (position.length !== 2) {
            position = source.split(',');
        }

        // ok parse lat
        if (position.length === 2) {
            if (name === 'lat' || name === 'latitude') {
                return parseFloat(position[0], 10)
            }
            return parseFloat(position[1], 10)
        } else {
            // invalid
            return false;
        }
    };

    let onResizeEditor = () => {
        if (accessToken === undefined) {
            return;
        }
        if (map !== null) {
            map.invalidateSize();
            if (featureLayer.getLayers().length > 0) {
                map.fitBounds(featureLayer.getBounds(), {maxZoom: markerDefaultZoom});
            } else {
                // set default position
                map.setView(defaultPosition, defaultZoom);
            }
        }
    };

    let onMarkerChange = (params) => {
        let {marker, position} = params;

        if (editable) {
            let fieldMapping = activeProvider['position-fields'];
            let presetFields = {};
            if (fieldMapping.length > 0) {
                fieldPosition = {};
                _.each(fieldMapping, (mapping) => {
                    // latitude and longitude are combined in a composite field
                    if (mapping.type === 'latlng') {
                        presetFields[mapping.name] = [`${position.lat} ${position.lng}`];
                    } else if (mapping.type === 'lat') {
                        presetFields[mapping.name] = [`${position.lat}`];
                    } else if (mapping.type === 'lng') {
                        presetFields[mapping.name] = [`${position.lng}`];
                    }
                });
            }

            let presets = {
                fields: presetFields
            };

            eventEmitter.emit('recordEditor.addPresetValuesFromDataSource', {data: presets});
        }
    }


    eventEmitter.listenAll({
        'recordSelection.changed': onRecordSelectionChanged,
        'appendTab.complete': onTabAdded,
        /* eslint-disable quote-props */
        'markerChange': onMarkerChange,
        'tabChange': onResizeEditor,
    });
    return {initialize}
};

export default leafletMap;
