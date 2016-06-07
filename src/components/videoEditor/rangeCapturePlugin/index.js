
require('./style/main.scss');
import videojs from 'video.js';
import RangeBarCollection from './rangeBarCollection';
import rangeControlBar from './rangeControlBar';

const defaults = {
    align: 'top-left',
    class: '',
    content: 'This overlay will show up while the video is playing',
    debug: false,
    overlays: [{
        start: 'playing',
        end: 'paused'
    }]
};

const Component = videojs.getComponent('Component');

const plugin = function(options) {
    // this = options.videoPlayer;
    const settings = videojs.mergeOptions(defaults, options);

    // push range bar into seekBar Component:
    // let videojsPlayer = videojs.getComponent('Player');
    this.rangeBarCollection = this.controlBar.getChild('progressControl').getChild('seekBar').addChild('RangeBarCollection', settings);
    
    this.ready(() => {
        // append range controls to player instance:
        rangeControlBar(options).initialize(this.el_, this.rangeBarCollection);
    });

    /*videojsPlayer.prototype.initRangeMenu = function ($container) {
        rangeControls(options).initialize($container);
    };*/

}
videojs.plugin('rangeCapturePlugin', plugin);
export default plugin;