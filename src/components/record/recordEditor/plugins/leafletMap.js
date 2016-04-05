/* eslint-disable quotes */
/* eslint-disable no-undef */
import $ from 'jquery';
import _ from 'underscore';
require('./leafletMap.css');
const leafletMap = (services) => {
    const {configService, localeService, recordEditorEvents} = services;
    let $container = null;
    let parentOptions = {};
    let Leaflet;
    let mapbox;
    let pois = [];
    let map = null;
    let $tabContent;
    let tabContainerName = 'leafletTabContainer';
    let defaultPosition = [48.879162, 2.335062];
    let defaultZoom = 2;
    const initialize = (options) => {
        let initWith = {$container, parentOptions} = options;
        recordEditorEvents.emit('recordEditor.appendTab', {
            tabProperties: {
                id: tabContainerName,
                title: localeService.t('Geolocalisation')
            },
            position: 2
        });

        onResizeEditor = _.debounce(onResizeEditor, 300);
    };

    const onTabAdded = (params) => {
        let {origParams} = params;
        if (origParams.tabProperties.id === tabContainerName) {
            $tabContent = $(`#${tabContainerName}`, parentOptions.$container);

            let records = parentOptions.recordCollection.getRecords();
            let fields = parentOptions.fieldCollection.getFields();
            for (let recordIndex in records) {
                let recordPoi = {};
                let record = parentOptions.recordCollection.getRecordByIndex(recordIndex);
                if (!record._selected) {
                    continue;
                }

                for (let fieldIndex in fields) {
                    let field = parentOptions.fieldCollection.getFieldByIndex(fieldIndex);
                    recordPoi[field.name] = field._value;
                }
                pois.push(recordPoi);
            }

            loadLeaflet(pois);
        }
    };

    const loadLeaflet = (pois) => {
        require.ensure([], () => {
            // Leaflet = require('leaflet');
            mapbox = require('mapbox.js');

            $tabContent.empty().append(`<div id="leafletMap" style="width: 100%;height:100%; position: absolute;top:0;left:0"></div>`);

            if (pois.length > 0) {
                if (poiIsValid(pois[0])) {
                    defaultPosition = [pois[0].Longitude, pois[0].Latitude];
                    defaultZoom = 13;
                }
            }

            let geoJsonPoiCollection = [];
            for (let poiIndex in pois) {
                let poi = pois[poiIndex];
                if (poiIsValid(poi)) {
                    geoJsonPoiCollection.push({
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [poi.Longitude, poi.Latitude]
                        },
                        properties: {
                            description: `<p>${poi.FileName}</p>`,
                            id: 'u36urlg8',
                            'marker-color': 'AA0000',
                            'marker-size': 'medium',
                            'marker-symbol': 'music',
                            'marker-zoom': '17',
                            title: 'Truckeroo'
                        }
                    });
                }
            }

            L.mapbox.accessToken = 'pk.eyJ1IjoiYWxjaGVteS1mciIsImEiOiJjaW1odzE0dHQwMDFidmdtMjB2bHFlZml6In0.Ht_hR_hojGQQT79ZqsTYkg';
            map = L.mapbox.map('leafletMap', 'mapbox.streets')
                .setView(defaultPosition, defaultZoom);

            // let poiLayer = map.featureLayer.setGeoJSON(geoJsonPoiCollection);
            for (let poiIndex in pois) {
                let poi = pois[poiIndex];
                if (poiIsValid(poi)) {
                    let poiMark = L.marker([poi.Longitude, poi.Latitude]).addTo(map)
                        .bindPopup(`<p>${poi.FileName}</p>`);
                }
            }

            // L.geoJson(geoJsonPoiCollection, { style: L.mapbox.simplestyle.style }).addTo(map);
            /*
             featureLayer.on('ready', function() {
             // featureLayer.getBounds() returns the corners of the furthest-out markers,
             // and map.fitBounds() makes sure that the map contains these.
             map.fitBounds(featureLayer.getBounds());
             });
             map.featureLayer.on('click', function(e) {
             map.panTo(e.layer.getLatLng());
             });*/
        });
    };

    const poiIsValid = (poi) => {
        if (poi.Longitude === undefined || poi.Latitude === undefined) {
            return false;
        }
        if (isNaN(poi.Longitude) || isNaN(poi.Latitude)) {
            return false;
        }
        if (poi.Longitude === '' || poi.Latitude === '') {
            return false;
        }
        return true;
    }

    let onResizeEditor = () => {
        if (map !== null) {
            map.invalidateSize();
        }
    };


    recordEditorEvents.listenAll({
        'recordEditor.appendTab.complete': onTabAdded,
        'recordEditor.tabChange': onResizeEditor,
    });
    return {initialize}
};

export default leafletMap;
