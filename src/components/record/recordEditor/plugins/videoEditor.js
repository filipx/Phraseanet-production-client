import $ from 'jquery';

const videoEditor = (services) => {
    const {configService, localeService, recordEditorEvents} = services;
    let $container = null;
    let parentOptions = {};
    let data;
    let rangeCapture;
    let rangeCaptureInstance;
    let options = {
        playbackRates: [],
        fluid: true
    };
    const initialize = (params) => {
        let initWith = {$container, parentOptions, data} = params;
        let aspectRatio = configService.get('resource.aspectRatio');


        if (configService.get('resource.aspectRatio') !== null) {
            options.aspectRatio = configService.get('resource.aspectRatio');
        }

        if (configService.get('resource.autoplay') !== null) {
            options.autoplay = configService.get('resource.autoplay');
        }

        if (configService.get('resource.playbackRates') !== null) {
            options.playbackRates = configService.get('resource.playbackRates');
        }

        if (data.videoEditorConfig !== null) {
            options.seekBackwardStep = data.videoEditorConfig.seekBackwardStep;
            options.seekForwardStep = data.videoEditorConfig.seekForwardStep;
            options.vttFieldValue = false;
            options.vttFieldName = data.videoEditorConfig.vttFieldName === undefined ? false : data.videoEditorConfig.vttFieldName;
        }

        options.techOrder = ['html5', 'flash'];
        $container.addClass('video-range-editor-container');

        // get default videoTextTrack value
        if (options.vttFieldName !== false) {
            let vttField = parentOptions.fieldCollection.getFieldByName(options.vttFieldName);
            if (vttField !== false) {
                options.vttFieldValue = vttField._value
            }
        }

        require.ensure([], () => {

            // load videoJs lib
            rangeCapture = require('../../../videoEditor/rangeCapture').default;
            rangeCaptureInstance = rangeCapture(services);
            rangeCaptureInstance.initialize(params, options);

            // proxy resize event to rangeStream
            recordEditorEvents.listenAll({
                'recordEditor.uiResize': () => {
                    rangeCaptureInstance.getPlayer().rangeStream.onNext({action: 'resize'})
                }
            })


            rangeCaptureInstance.getPlayer().rangeStream.subscribe((params) => {
                switch (params.action) {
                    case 'export-vtt-ranges':
                        if (options.vttFieldName !== false) {

                            let presets = {
                                fields: {}
                            };
                            presets.fields[options.vttFieldName] = [params.data];
                            recordEditorEvents.emit('recordEditor.addPresetValuesFromDataSource', {
                                data: presets
                            });
                        }
                        break;
                    default:
                }
            });
        });
    };

    return {initialize};
};
export default videoEditor;
