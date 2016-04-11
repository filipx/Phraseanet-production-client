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
    let geocoder = null;
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

            geocoder = L.mapbox.geocoder('mapbox.places');


            addMarkersLayer();
            refreshMarkers(pois);
        });
    };
    const addMarkersLayer = () => {
        if (featureLayer !== null) {
            featureLayer.clearLayers();
        } else {
            featureLayer = L.mapbox.featureLayer([], {
                pointToLayer: function (feature, latlon) {
                    if (feature.properties.radius !== undefined) {
                        // L.circleMarker() draws a circle with fixed radius in pixels.
                        // To draw a circle overlay with a radius in meters, use L.circle()
                        return L.circleMarker(latlon, {radius: feature.properties.radius || 10});
                    } else {
                        let marker = require('mapbox.js/src/marker.js'); //L.marker(feature);
                        return marker.style(feature, latlon, {accessToken: accessToken});
                    }
                }
            }).addTo(map);
        }
    };

    const refreshMarkers = (pois) => {

        buildGeoJson(pois).then((geoJsonPoiCollection) => {
            addMarkersLayer();

            let markerColl = markerCollection(services);
            markerColl.initialize({map, featureLayer, geoJsonPoiCollection, editable});

            if (featureLayer.getLayers().length > 0) {
                map.fitBounds(featureLayer.getBounds(), {maxZoom: markerDefaultZoom});
            } else {
                // set default position
                map.setView(defaultPosition, defaultZoom);
            }
        })

    };
    /**
     * build geoJson features return as a promise
     * @param pois
     * @returns {*}
     */
    const buildGeoJson = (pois) => {
        let geoJsonPoiCollection = [];
        let asyncQueries = [];
        let geoJsonPromise = $.Deferred();

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
                        recordIndex: poiIndex,
                        'marker-color': '0c4554',
                        'marker-zoom': '5',
                        title: `${poi.FileName}`
                    }
                });
            } else {
                // coords are not available, fallback on city/province/country if available

                let query = '';
                query += poi.City !== undefined && poi.City !== null ? poi.City : '';
                query += poi.Country !== undefined && poi.Country !== null ? `, ${poi.Country} ` : '';

                if (query !== '') {
                    let geoPromise = $.Deferred();
                    geocoder.query(query, (err, data) => {
                        // take the first feature if exists
                        if (data.results !== undefined) {
                            if (data.results.features.length > 0) {

                                /*let circleArea = {
                                 type: 'Feature',
                                 geometry: {
                                 type: 'Point',
                                 coordinates: data.results.features[0].center //[[ data.bounds ]]
                                 },
                                 properties: {
                                 title: `${poi.FileName}`
                                 }
                                 };
                                 circleArea.properties['marker-zoom'] = 5;
                                 circleArea.properties.radius = 50;

                                 geoJsonPoiCollection.push(circleArea);*/

                                let bestResult = data.results.features[0];
                                bestResult.properties.recordIndex = poiIndex;
                                bestResult.properties['marker-zoom'] = 5;
                                bestResult.properties.title = `${poi.FileName}`;
                                geoJsonPoiCollection.push(bestResult);
                            }

                        }

                        geoPromise.resolve(geoJsonPoiCollection)
                    });
                    asyncQueries.push(geoPromise);
                }
            }
        }

        if (asyncQueries.length > 0) {
            $.when.apply(null, asyncQueries).done(function () {
                geoJsonPromise.resolve(geoJsonPoiCollection)
            });
        } else {
            geoJsonPromise.resolve(geoJsonPoiCollection)
        }
        return geoJsonPromise.promise();
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
            let recordIndex = marker.feature.properties.recordIndex;

            eventEmitter.emit('recordEditor.addPresetValuesFromDataSource', {data: presets, recordIndex});
        }
    };


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
