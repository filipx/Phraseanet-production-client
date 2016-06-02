import $ from 'jquery';
import _ from 'underscore';

const videoRangeCapture = (services, datas, activeTab = false) => {
    const {configService, localeService, appEvents} = services;
    let $container = null;
    let videojs = {};
    let initData = {};
    let options = {
        playbackRates: [],
        fluid: true
    };
    const initialize = (params) => {
        //{$container} = params;
        $container = params.$container;
        initData = params.data;
        let aspectRatio = configService.get('resource.aspectRatio');
            

        if( configService.get('resource.aspectRatio') !== null ) {
            options.aspectRatio = configService.get('resource.aspectRatio');
        }

        if( configService.get('resource.autoplay') !== null ) {
            options.autoplay = configService.get('resource.autoplay');
        }

        if( configService.get('resource.playbackRates') !== null ) {
            options.playbackRates = configService.get('resource.playbackRates');
        }

        options.techOrder = ['html5', 'flash'];

        require.ensure([], () => {
            // load videoJs lib
            require('video.js').default;

            render(initData);
        });

    }

    const render = (initData) => {
        console.log('initData', initData.records)
        let record = initData.records[0];
        const coverUrl = '';
        let generateSourcesTpl = (record) => {
            console.log('pass record', record)
            let recordSources = [];
            _.each(record.sources, (s, i) => {
                console.log('si',s,i)
                recordSources.push(`<source src="${s.src}" type="${s.type}">`)
            });
            let sourcesTpl = recordSources.join(' ');
            console.log(record.sources, recordSources, sourcesTpl)

            return recordSources.join(' ');
        };


        let sources = generateSourcesTpl(record);
        $container.append(
            `<video id="embed-video" class="embed-resource video-js vjs-default-skin vjs-big-play-centered" controls
               preload="none" width="100%" height="100%" poster="${coverUrl}">
               ${sources} 
            </video>`)

        console.log('pass options', sources)
        window.videojs('embed-video', options, () => {})
    };

    return {initialize}
}

export default videoRangeCapture;