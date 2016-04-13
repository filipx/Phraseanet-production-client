import _ from 'underscore';
/**
 * Set a provider
 *
 */

const provider = (services) => {
    const {configService, localeService, eventEmitter} = services;
    let accessToken;
    let defaultPosition;
    let defaultZoom;
    let markerDefaultZoom;
    let activeProvider;
    let fieldPosition;
    const initialize = () => {
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
                return parseFloat(position[0])
            }
            return parseFloat(position[1])
        } else {
            // invalid
            return false;
        }
    };

    const getConfiguration = () => {
        return {
            defaultPosition,
            defaultZoom,
            markerDefaultZoom,
            fieldPosition,
            accessToken,
            provider: activeProvider
        }
    };

    return {
        initialize, getConfiguration
    }
}

export default provider;
