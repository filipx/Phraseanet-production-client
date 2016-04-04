import $ from 'jquery';
import _ from 'underscore';
require('./leafletMap.css');
const leafletMap = (services) => {
    const {configService, localeService, appEvents} = services;
    let $container = null;
    let parentOptions = {};
    let Leaflet;
    let pois = [];
    let map = null;
    let $tabContent;
    let tabContainerName = 'leafletTabContainer';
    let defaultPosition = [48.879162, 2.335062];
    const initialize = (options) => {
        let initWith = {$container, parentOptions} = options;

        appEvents.emit('recordEditor.appendTab', {
            tabProperties: {
                id: tabContainerName,
                title: localeService.t('Geolocalisation'),
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
            Leaflet = require('leaflet');


            $tabContent.empty().append(`<div id="leafletMap" style="width: 100%;height:100%; position: absolute;top:0;left:0"></div>`);

            Leaflet.Icon.Default.imagePath = 'http://cdn.leafletjs.com/leaflet-0.7.3/images';

            const accessToken = 'pk.eyJ1IjoiYWxjaGVteS1mciIsImEiOiJjaW1odzE0dHQwMDFidmdtMjB2bHFlZml6In0.Ht_hR_hojGQQT79ZqsTYkg';
            // Replace 'mapbox.streets' with your map id.
            var mapboxTiles = Leaflet.tileLayer(`https://api.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=${accessToken}`, {
                attribution: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            });

            if( pois.length > 0) {
                defaultPosition = [pois[0].Longitude, pois[0].Latitude];
            }

            map = Leaflet
                .map('leafletMap')
                .addLayer(mapboxTiles)
                .setView(defaultPosition, 13);

            for (let poiIndex in pois) {
                let poi = pois[poiIndex];

                Leaflet.marker([poi.Longitude, poi.Latitude]).addTo(map)
                    .bindPopup(`<p>${poi.FileName}</p>`)
                    .openPopup();
            }
        });
    };

    let onResizeEditor = () => {
        if (map !== null) {
            map.invalidateSize();
        }
    };


    appEvents.listenAll({
        'recordEditor.appendTab.complete': onTabAdded,
        'recordEditor.tabChange': onResizeEditor,
    });
    return {initialize}
};

export default leafletMap;
