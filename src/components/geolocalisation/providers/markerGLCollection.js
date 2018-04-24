import $ from 'jquery';
let mapboxgl = require('mapbox-gl');

const markerGLCollection = (services) => {
    const {configService, localeService, eventEmitter} = services;
    let markerCollection = {};
    let cachedGeoJson;
    let featureLayer;
    let map;
    let geojson;
    let editable;
    let markerMapboxGl = {};
    let isDraggable = false;
    let isCursorOverPoint = false;
    let isDragging = false;

    const initialize = (params) => {
        let initWith = {map, geojson} = params;
        markerMapboxGl = new mapboxgl.Marker();
        editable = params.editable || false;
        setCollection(geojson)
    };

    const setCollection = (geojson) => {
        cachedGeoJson = geojson;
        geojson.features.forEach(function (marker) {
            setMarkerPopup(marker);
        });
    };

    const triggerRefresh = () => {
        setCollection(cachedGeoJson);
    };

    const setMarkerPopup = (marker) => {
        switch (marker.geometry.type) {
            case 'Polygon':
                break;
            case 'Point':
                setPoint(marker);
                break;
            default:
        }
    };

    const setPoint = (marker) => {
        let $content = $('<div style="min-width: 200px"/>');

        let template = `<p>${marker.properties.title}</p> `;

        if (editable === true) {
            template += `
            <div class="view-mode">
                    <button class="edit-position btn btn-inverse btn-small btn-block" data-marker-id="${marker.properties.recordIndex}">${localeService.t('mapMarkerEdit')}</button>
            </div>
            <div class="edit-mode">
                <p class="help">${localeService.t('mapMarkerMoveLabel')}</p>
                <p><span class="updated-position"></span></p>
                <div>
                    <button class="cancel-position btn btn-inverse btn-small btn-block" data-marker-id="${marker.properties.recordIndex}">${localeService.t('mapMarkerEditCancel')}</button>
                    <button class="submit-position btn btn-inverse btn-small btn-block" data-marker-id="${marker.properties.recordIndex}">${localeService.t('mapMarkerEditSubmit')}</button>
                </div>
            </div>`;
        }

        $content.append(template);

        $content.find('.edit-mode').hide();
        //
        // $content.on('click', '.edit-position', (event) => {
        //     let $el = $(event.currentTarget);
        //     let marker = getMarker($el.data('marker-id'));
        //     marker._originalPosition = marker.lngLat.wrap();
        //     $content.find('.view-mode').hide();
        //     $content.find('.edit-mode').show();
        //     $content.find('.help').show();
        //     isDraggable = true;
        //
        //     map.on('mousedown', mouseDown);
        // });

        // $content.on('click', '.submit-position', (event) => {
        //     let $el = $(event.currentTarget);
        //     let marker = getMarker($el.data('marker-id'));
        //
        //     marker.dragging.disable();
        //     $content.find('.view-mode').show();
        //     $content.find('.help').hide();
        //     $content.find('.edit-mode').hide();
        //     marker._originalPosition = marker.getLatLng().wrap();
        //     eventEmitter.emit('markerChange', {marker, position: marker.getLatLng().wrap()});
        // });
        //
        //
        // $content.on('click', '.cancel-position', (event) => {
        //     let $el = $(event.currentTarget);
        //     let marker = getMarker($el.data('marker-id'));
        //     isDraggable = false;
        //     $content.find('.view-mode').show();
        //
        //     marker.setLngLat(marker._originalPosition);
        //     triggerRefresh();
        // });
        //
        // // When the cursor enters a feature in the point layer, prepare for dragging.
        // map.on('mouseenter', 'points', function () {
        //     if (!isDraggable) {
        //         return;
        //     }
        //     map.getCanvas().style.cursor = 'move';
        //     isCursorOverPoint = true;
        //     map.dragPan.disable();
        // });
        //
        // map.on('mouseleave', 'points', function () {
        //     if (!isDraggable) {
        //         return;
        //     }
        //     map.getCanvas().style.cursor = '';
        //     isCursorOverPoint = false;
        //     map.dragPan.enable();
        // });
        //
        // map.on('click', 'points', function (e) {
        //     markerCollection[e.features[0].properties.recordIndex] = e;
        //     var coordinates = e.features[0].geometry.coordinates.slice();
        //
        //     while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        //         coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        //     }
        //
        //     new mapboxgl.Popup()
        //         .setLngLat(coordinates)
        //         .setDOMContent($content.get(0))
        //         .addTo(map);
        // });
        //
        // function mouseDown() {
        //     if (!isCursorOverPoint) return;
        //
        //     isDragging = true;
        //
        //     // Set a cursor indicator
        //     map.getCanvas().style.cursor = 'grab';
        //
        //     // Mouse events
        //     map.on('mousemove', onMove);
        //     map.once('mouseup', onUp);
        // }
        //
        // function onMove(e) {
        //     if (!isDragging) return;
        //     var coords = e.lngLat;
        //
        //     // Set a UI indicator for dragging.
        //     map.getCanvas().style.cursor = 'grabbing';
        //
        //     // Update the Point feature in `geojson` coordinates
        //     // and call setData to the source layer `point` on it.
        //     geojson.features[0].geometry.coordinates = [coords.lng, coords.lat];
        //     map.getSource('data').setData(geojson);
        // }
        //
        // function onUp(e) {
        //     if (!isDragging) return;
        //     let position = e.lngLat;
        //
        //     map.getCanvas().style.cursor = '';
        //     isDragging = false;
        //
        //     // Unbind mouse events
        //     map.off('mousemove', onMove);
        // }

        var popup = new mapboxgl.Popup({closeOnClick: false, offset: 35})
            .setDOMContent($content.get(0))

        var currentMarker = markerMapboxGl.setLngLat(marker.geometry.coordinates).setPopup(popup).addTo(map);
        markerCollection[marker.properties.recordIndex] = currentMarker;
        // marker.on('dragend', () => {
        //     let position = marker.getLatLng().wrap();
        //     $content.find('.updated-position').html(`${position.lat}<br>${position.lng}`);
        //     $content.find('.edit-mode').show();
        //     marker.bindPopup($content.get(0));
        //     marker.openPopup();
        // })

    }

    const getMarker = (markerId) => {
        return markerCollection[markerId];
    }

    return {
        initialize, setCollection
    }
}

export default markerGLCollection;
