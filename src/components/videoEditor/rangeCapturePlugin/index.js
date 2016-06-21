require('./style/main.scss');
import * as Rx from 'rx';
import videojs from 'video.js';
import HotkeyModal from './hotkeysModal';
import HotkeysModalButton from './hotkeysModalButton';
import RangeBarCollection from './rangeBarCollection';
import RangeControlBar from './rangeControlBar';
// import rangeControls from './oldControlBar';

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

const plugin = function (options) {
    const settings = videojs.mergeOptions(defaults, options);
    this.looping = false;
    this.loopData = [];
    this.rangeStream = new Rx.Subject();
    this.rangeBarCollection = this.controlBar.getChild('progressControl').getChild('seekBar').addChild('RangeBarCollection', settings);
    this.rangeControlBar = this.addChild('RangeControlBar', settings);

    this.hotkeysModalButton = this.addChild('HotkeysModalButton', settings);

    // range actions:
    this.rangeStream.subscribe((params) => {
        params.handle = params.handle || false;
        switch (params.action) {
            case 'change':
                this.rangeControlBar.updateActiveRange(params.range, params.handle);
                this.rangeBarCollection.updateRange(params.range);
                break;
            case 'remove':
                this.rangeBarCollection.removeRange(params.range);
                break;
            case 'refresh':
                this.rangeControlBar.updateCurrentTime();
                break;
            case 'drag-update':
                // if changes come from range bar
                this.rangeControlBar.updateActiveRange(params.range, params.handle);
                break;
            default:
        }
    });

    this.ready(() => {

    });

    // ensure control bar is always visible by simulating user activity:
    this.on('timeupdate', () => {
        this.userActive(true);
    });
    this.getRangeCaptureHotkeys = () => {
        return {
            // Create custom hotkeys
            playOnlyKey: {
                key: function (e) {
                    // L Key
                    return (!e.ctrlKey && e.which === 76);
                },
                handler: (player, options) => {
                    if (player.paused()) {
                        player.play();
                    }
                }
            },
            pauseOnlyKey: {
                key: function (e) {
                    // K Key
                    return (e.which === 75);
                },
                handler: (player, options) => {
                    if (!player.paused()) {
                        player.pause();
                    }
                }
            },
            frameBackward: {
                key: function (e) {
                    // < Key
                    return (e.which === 188);
                },
                handler: function (player, options) {
                    player.rangeControlBar.setPreviousFrame()
                }
            },
            frameForward: {
                key: function (e) {
                    // MAJ + < = > Key
                    return (e.which === 190);
                },
                handler: function (player, options) {
                    player.rangeControlBar.setNextFrame()
                }
            },
            entryCuePoint: {
                key: function (e) {
                    // I Key
                    return (!e.shiftKey && e.which === 73);
                },
                handler: function (player, options) {
                    player.rangeStream.onNext({
                        action: 'change',
                        range: player.rangeControlBar.setStartPositon()
                    });
                }
            },
            endCuePoint: {
                key: function (e) {
                    // O Key
                    return (!e.shiftKey && e.which === 79);
                },
                handler: function (player, options) {
                    player.rangeStream.onNext({
                        action: 'change',
                        range: player.rangeControlBar.setEndPositon()
                    });
                }
            },
            PlayAtEntryCuePoint: {
                key: function (e) {
                    // I Key
                    return (e.shiftKey && e.which === 73);
                },
                handler: function (player, options) {
                    if (!player.paused()) {
                        player.pause();
                    }
                    player.currentTime(player.rangeControlBar.getStartPosition())
                }
            },
            PlayAtEndCuePoint: {
                key: function (e) {
                    // O Key
                    return (e.shiftKey && e.which === 79);
                },
                handler: function (player, options) {
                    if (!player.paused()) {
                        player.pause();
                    }
                    player.currentTime(player.rangeControlBar.getEndPosition())
                }
            },
            toggleLoop: {
                key: function (e) {
                    // ctrl+ L Key
                    return (e.ctrlKey && e.which === 76);
                },
                handler: function (player, options) {
                    player.rangeControlBar.toggleLoop();
                }
            },
            deleteRange: {
                key: function (e) {
                    // MAJ+SUPPR Key
                    return (e.shiftKey && e.which === 46);
                },
                handler: function (player, options) {
                    player.rangeStream.onNext({
                        action: 'change',
                        range: player.rangeControlBar.removeRange()
                    });
                }
            }
        }

    }

}
videojs.plugin('rangeCapturePlugin', plugin);
export default plugin;
