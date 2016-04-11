import $ from 'jquery';

const markerCollection = (services) => {
    const {configService, localeService, eventEmitter} = services;
    let markerCollection = {};
    let cachedGeoJson;
    let featureLayer;
    let map;
    let geoJsonPoiCollection;
    let editable;

    const initialize = (params) => {
        let initWith = {map, featureLayer, geoJsonPoiCollection} = params;
        editable = params.editable || false;
        setCollection(geoJsonPoiCollection)
    };

    const setCollection = (geoJsonPoiCollection) => {
        featureLayer.setGeoJSON(geoJsonPoiCollection);
        cachedGeoJson = featureLayer.getGeoJSON();
        featureLayer.eachLayer(function (layer) {
            setMarkerPopup(layer);
        });

    };

    const triggerRefresh = () => {
        setCollection(cachedGeoJson);
        cachedGeoJson = featureLayer.getGeoJSON();
    };

    const setMarkerPopup = (marker) => {
        let $content = $('<div style="min-width: 200px"/>');
        let originalPosition = marker.getLatLng();

        let template = `
        <p>${marker.feature.properties.title}</p> 
        `;

        if (editable === true) {
            template += `
        <div class="view-mode">
                <button class="edit-position btn btn-inverse btn-small btn-block">${localeService.t('edit')}</button>
        </div>
        <div class="edit-mode">
            <p class="help">drag the pin where you want</p>
            <p><span class="updated-position"></span></p>
            <div>
                <button class="cancel-position btn btn-inverse btn-small btn-block">${localeService.t('annuler')}</button>
                <button class="submit-position btn btn-inverse btn-small btn-block">${localeService.t('valider')}</button>
            </div>
        </div>
        `;
        }

        $content.append(template);

        $content.find('.edit-mode').hide();

        $content.on('click', '.edit-position', () => {
            marker.dragging.enable();
            $content.find('.view-mode').hide();
            $content.find('.edit-mode').show();
            $content.find('.help').show();
        });

        $content.on('click', '.submit-position', () => {
            marker.dragging.disable();
            $content.find('.view-mode').show();
            $content.find('.help').hide();
            $content.find('.edit-mode').hide();
            originalPosition = marker.getLatLng();
            eventEmitter.emit('markerChange', {marker, position: marker.getLatLng()});
        });


        $content.on('click', '.cancel-position', () => {
            marker.dragging.disable();
            $content.find('.view-mode').show();

            marker.setLatLng(originalPosition);
            triggerRefresh();
        });

        marker.bindPopup($content.get(0));

        marker.on('dragend', () => {
            let position = marker.getLatLng();
            $content.find('.updated-position').html(`${position.lat}<br>${position.lng}`);
            $content.find('.edit-mode').show();
            marker.bindPopup($content.get(0));
            marker.openPopup();
        })
    };

    return {
        initialize, setCollection
    }
}

export default markerCollection;