import _ from 'underscore';
import rangeCapturePlugin from './rangeCapturePlugin/index';
let hotkeys = require('videojs-hotkeys');
import videojs from 'video.js';
// require('video.js').default;

const rangeCapture = (services, datas, activeTab = false) => {
    const {configService, localeService, appEvents} = services;
    let $container = null;
    let initData = {};
    let options = {};
    let defaultOptions = {
        playbackRates: [],
        fluid: true,
        controlBar: {
            muteToggle: false
        }
    };
    const initialize = (params, userOptions) => {
        //{$container} = params;
        $container = params.$container;
        initData = params.data;

        options = _.extend(defaultOptions, userOptions, {$container: $container});
        dispose();
        render(initData);
    }

    const render = (initData) => {
        let record = initData.records[0];
        if (record.type !== 'video') {
            return;
        }
        options.frameRates = {};
        const coverUrl = '';
        let generateSourcesTpl = (record) => {
            let recordSources = [];
            _.each(record.sources, (s, i) => {
                recordSources.push(`<source src="${s.src}" type="${s.type}" data-frame-rate="${s.framerate}">`)
                options.frameRates[s.src] = s.framerate;
            });

            return recordSources.join(' ');
        };

        let sources = generateSourcesTpl(record);
        $container.append(
            `<video id="embed-video" class="embed-resource video-js vjs-default-skin vjs-big-play-centered" controls
               preload="none" width="100%" height="100%" poster="${coverUrl}" data-setup='{"language":"${localeService.getLocale()}"}'>${sources} </video>`);

        // window.videojs = videojs;
        videojs.addLanguage(localeService.getLocale(), localeService.getTranslations());
        let videoPlayer = videojs('embed-video', options, () => {
        });
        videoPlayer.rangeCapturePlugin(options);
        videoPlayer.ready(() => {
            let hotkeyOptions = _.extend({
                alwaysCaptureHotkeys: true,
                enableNumbers: false,
                volumeStep: 0.1,
                seekStep: 1,
                customKeys: videoPlayer.getRangeCaptureHotkeys()
            }, videoPlayer.getRangeCaptureOverridedHotkeys());

            videoPlayer.hotkeys(hotkeyOptions);
        });

    };

    const dispose = () => {
        try {
            if (videojs.getPlayers()['embed-video']) {
                delete videojs.getPlayers()['embed-video'];
            }
        } catch (e) {
        }
    }

    return {initialize}
}

export default rangeCapture;
