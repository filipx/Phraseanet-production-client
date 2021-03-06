import * as Rx from 'rx';
import $ from 'jquery';
import dialog from 'phraseanet-common/src/components/dialog';

import leafletMap from '../../geolocalisation/providers/mapbox';
import _ from 'underscore';

const searchGeoForm = (services) => {
    const {configService, localeService, appEvents} = services;
    const url = configService.get('baseUrl');
    let $container = null;
    let $dialog;
    let mapBoxService;
    let searchQuery;
    let drawnItems;
    let $geoSearchBtn;
    const mapContainerName = 'geo-search-map-container';

    const openModal = (options) => {
        options = _.extend({
            size: (window.bodySize.x - 120) + 'x' + (window.bodySize.y - 120),
            loading: false,
            title: localeService.t('title-map-dialog'),
        }, options);

        $dialog = dialog.create(services, options);
        $dialog.setContent(renderModal());
        $container = $dialog.getDomElement();
        $container.closest('.ui-dialog').addClass('map_search_dialog');
        onModalReady(options)

    };

    const onModalReady = (options) => {

        $container.on('click', '.submit-geo-search-action', (event) => {
            event.preventDefault();
            updateSearchValue();
            // searchQuery
            $dialog.close();
        });
        mapBoxService = leafletMap({configService, localeService, eventEmitter: appEvents});
        mapBoxService.initialize({
            $container: $container.find(`#${mapContainerName}`),
            parentOptions: {},
            drawable: true,
            drawnItems: options.drawnItems || false,
            mapOptions: {}
        });
        mapBoxService.appendMapContent({selection: []});

    }

    const updateSearchValue = () => {
        appEvents.emit('search.updateSearchValue', {
            searchValue: searchQuery,
            reset: true,
            submit: true
        });
    }

    const renderModal = () => {
        // @TODO cleanup styles
        return `
        <div style="overflow:hidden">
        <div id="${mapContainerName}" style="top: 0px; left: 0;    bottom: 42px;    position: absolute;height: auto;width: 100%;overflow: hidden;"></div>
        <div style="position: absolute;bottom: 0; text-align:center; height: 35px; width: 98%;overflow: hidden;"><button class="submit-geo-search-action btn" style="font-size: 14px">${localeService.t('Valider')}</button></div>
        </div>`;
    };

    const updateCircleGeo = (params) => {
        let {shapes} = params;
        searchQuery = buildCircularSearchQuery(shapes);
        let circleObjCollection = _.map(params.drawnItems, function (circleObj) {
            var obj = {};
            obj['center'] = circleObj.getCenter();
            obj['radius'] = circleObj.getRadius();
            return obj;
        })
        savePreferences({drawnItems: circleObjCollection});
    }

    const onShapeCreated = (params) => {
        let {shapes} = params;
        searchQuery = buildSearchQuery(shapes);
        savePreferences({drawnItems: params.drawnItems});
    };

    const onShapeEdited = (params) => {
        let {shapes} = params;
        searchQuery = buildSearchQuery(shapes);
        savePreferences({drawnItems: params.drawnItems});
    };

    const onShapeDeleted = (params) => {
        let {shapes} = params;
        searchQuery = buildSearchQuery(shapes);
        savePreferences({drawnItems: params.drawnItems});
    };

    const buildCircularSearchQuery = (shapes) => {
        let queryTerms = [];
        _.each(shapes, (shape) => {
            let terms = [];

            var distanceInKM = parseFloat(shape.getRadius()) / 1000;
            terms.push(`geolocation="${shape.getCenter().lat} ${shape.getCenter().lng} ${distanceInKM.toFixed(2)}km"`);

            if (terms.length > 0) {
                queryTerms.push(` (${terms.join(' AND ')}) `);
            }

        });
        return queryTerms.join(' OR ');
    }

    const buildSearchQuery = (shapes) => {

        let queryTerms = [];
        _.each(shapes, (shape) => {
            let terms = [];

            if (shape.type === 'rectangle') {
                let southWest = 0;
                let northEst = 2;

                for (let boundary in shape.bounds) {
                    if (shape.bounds.hasOwnProperty(boundary)) {

                        if (parseInt(boundary, 10) === southWest) {
                            // superior
                            for (let coordField in shape.bounds[boundary]) {
                                if (shape.bounds[boundary].hasOwnProperty(coordField)) {
                                    terms.push(`${coordField}>${shape.bounds[boundary][coordField]}`);
                                }
                            }
                        } else if (parseInt(boundary, 10) === northEst) {
                            // inferior
                            for (let coordField in shape.bounds[boundary]) {
                                if (shape.bounds[boundary].hasOwnProperty(coordField)) {
                                    terms.push(`${coordField}<${shape.bounds[boundary][coordField]}`);
                                }
                            }
                        }
                    }
                }
            }

            if (terms.length > 0) {
                queryTerms.push(` (${terms.join(' AND ')}) `);
            }

        });
        return queryTerms.join(' OR ');
    }

    const savePreferences = (obj) => {
        //drawnItems = JSON.stringify(data);
        appEvents.emit('search.updatePreferences', obj);

    }

    appEvents.listenAll({
        shapeCreated: onShapeCreated,
        shapeEdited: onShapeEdited,
        shapeRemoved: onShapeDeleted,
        updateSearchValue: updateSearchValue,
        updateCircleGeo: updateCircleGeo,
    })

    return {openModal};
};

export default searchGeoForm;
