require('./style/main.scss');
import $ from 'jquery';
import * as Rx from 'rx';
import videojs from 'video.js';
import HotkeyModal from './hotkeysModal';
import HotkeysModalButton from './hotkeysModalButton';
import RangeBarCollection from './rangeBarCollection';
import RangeCollection from './rangeCollection';
import RangeControlBar from './rangeControlBar';
// import rangeControls from './oldControlBar';

const icons = `
<svg style="position: absolute; width: 0; height: 0;" width="0" height="0" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<defs>
<symbol id="icon-loop-range" viewBox="0 0 30 30">
<title>loop-range</title>
<path class="path1" d="M25.707 9.92l-2.133 1.813h1.707c0.107 0 0.32 0.213 0.32 0.213v8.107c0 0.107-0.213 0.213-0.32 0.213h-11.093l-0.853 2.133h11.947c1.067 0 2.453-1.28 2.453-2.347v-8.107c0-1.067-1.067-1.92-2.027-2.027z"></path>
<path class="path2" d="M7.040 22.4l1.92-2.133h-2.24c-0.107 0-0.32-0.213-0.32-0.213v-8.107c0 0 0.213-0.213 0.32-0.213h11.627l0.853-2.133h-12.48c-1.173 0-2.453 1.28-2.453 2.347v8.107c0 1.067 1.28 2.347 2.453 2.347h0.32z"></path>
<path class="path3" d="M17.493 6.827l4.053 3.947-4.053 3.947z"></path>
<path class="path4" d="M14.933 24.96l-3.947-3.84 3.947-3.947z"></path>
</symbol>
<symbol id="icon-prev-forward-frame" viewBox="0 0 30 30">
<title>prev-forward-frame</title>
<path class="path1" d="M25.432 9.942l-9.554 9.554-3.457-3.457 9.554-9.554 3.457 3.457z"></path>
<path class="path2" d="M21.912 25.578l-9.554-9.554 3.457-3.457 9.554 9.554-3.457 3.457z"></path>
<path class="path3" d="M6.578 6.489h2.578v19.111h-2.578v-19.111z"></path>
</symbol>
<symbol id="icon-next-forward-frame" viewBox="0 0 30 30">
<title>next-forward-frame</title>
<path class="path1" d="M10.131 6.462l9.554 9.554-3.457 3.457-9.554-9.554 3.457-3.457z"></path>
<path class="path2" d="M6.611 22.018l9.554-9.554 3.457 3.457-9.554 9.554-3.457-3.457z"></path>
<path class="path3" d="M22.756 6.489h2.578v19.111h-2.578v-19.111z"></path>
</symbol>
<symbol id="icon-prev-frame" viewBox="0 0 30 30">
<title>prev-frame</title>
<path class="path1" d="M22.538 9.962l-9.554 9.554-3.457-3.457 9.554-9.554 3.457 3.457z"></path>
<path class="path2" d="M19.018 25.558l-9.554-9.554 3.457-3.457 9.554 9.554-3.457 3.457z"></path>
</symbol>
<symbol id="icon-next-frame" viewBox="0 0 30 30">
<title>next-frame</title>
<path class="path1" d="M12.984 6.441l9.554 9.554-3.457 3.457-9.554-9.554 3.457-3.457z"></path>
<path class="path2" d="M9.464 22.039l9.554-9.554 3.457 3.457-9.554 9.554-3.457-3.457z"></path>
</symbol>
<symbol id="icon-cue-start" viewBox="0 0 30 30">
<title>cue-start</title>
<path class="path1" d="M20.356 24.089v-15.733c0-0.533-0.356-0.889-0.889-0.889h-8c-0.444 0-0.889 0.356-0.889 0.889v5.067c0 0.533 0.267 1.156 0.622 1.511l8.622 9.422c0.267 0.356 0.533 0.267 0.533-0.267z"></path>
</symbol>
<symbol id="icon-cue-end" viewBox="0 0 30 30">
<title>cue-end</title>
<path class="path1" d="M10.578 24.089v-15.733c0-0.533 0.356-0.889 0.889-0.889h8c0.444 0 0.889 0.356 0.889 0.889v5.067c0 0.533-0.267 1.156-0.622 1.511l-8.622 9.422c-0.267 0.356-0.533 0.267-0.533-0.267z"></path>
</symbol>
<symbol id="icon-trash" viewBox="0 0 30 30">
<title>trash</title>
<path class="path1" d="M22.667 8.978h-3.822v-1.333c0-0.8-0.622-1.422-1.422-1.422h-2.756c-0.8 0-1.422 0.622-1.422 1.422v1.422h-3.822c-0.178 0-0.356 0.178-0.356 0.356v0.711c0 0.178 0.178 0.356 0.356 0.356h13.333c0.178 0 0.356-0.178 0.356-0.356v-0.711c-0.089-0.267-0.267-0.444-0.444-0.444zM14.667 8.978v0-1.422h2.756v1.422h-2.756z"></path>
<path class="path2" d="M21.778 11.111h-11.733c-0.267 0-0.356 0.089-0.356 0.356v14.133c0 0 0.089 0.267 0.356 0.267h11.733c0.267 0 0.533-0.089 0.533-0.356v-14.133c0-0.178-0.267-0.267-0.533-0.267zM13.156 23.378c0 0.178-0.178 0.356-0.356 0.356h-0.711c-0.178 0-0.356-0.178-0.356-0.356v-9.778c0-0.178 0.178-0.356 0.356-0.356h0.711c0.178 0 0.356 0.178 0.356 0.356v9.778zM16.711 23.378c0 0.178-0.178 0.356-0.356 0.356h-0.711c-0.178 0-0.356-0.178-0.356-0.356v-9.778c0-0.178 0.178-0.356 0.356-0.356h0.711c0.178 0 0.356 0.178 0.356 0.356v9.778zM20.178 23.378c0 0.178-0.178 0.356-0.356 0.356h-0.711c-0.178 0-0.356-0.178-0.356-0.356v-9.778c0-0.178 0.178-0.356 0.356-0.356h0.711c0.178 0 0.356 0.178 0.356 0.356v9.778z"></path>
</symbol>
</defs>
</svg>
`;

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
    this.activeRange = {};
    this.activeRangeStream = new Rx.Subject(); //new Rx.Observable.ofObjectChanges(this.activeRange);
    this.rangeStream = new Rx.Subject();
    this.rangeBarCollection = this.controlBar.getChild('progressControl').getChild('seekBar').addChild('RangeBarCollection', settings);
    this.rangeControlBar = this.addChild('RangeControlBar', settings);
    this.rangeCollection = this.addChild('RangeCollection', settings);

    this.hotkeysModalButton = this.addChild('HotkeysModalButton', settings);

    $(this.el()).prepend(icons);

    this.setEditorHeight = () => {
        // gather components sizes
        console.log('range collection height', $(this.rangeCollection.el()).height())
        let editorHeight = this.currentHeight() + $(this.rangeControlBar.el()).height() + $(this.rangeCollection.el()).height();

        if (editorHeight > 0) {
            options.$container.height(editorHeight + 'px');
        }
    }

    // range actions:
    this.rangeStream.subscribe((params) => {
        params.handle = params.handle || false;
        console.log('RANGE EVENT ===========', params.action, '========>>>')
        switch (params.action) {
            case 'select':
            case 'create':
            case 'change':
                console.log('************** action create, change **************')

            // flow through update:
            case 'update':
                console.log('************** action update**************')
                // set values
                this.activeRange = this.rangeCollection.update(params.range);

                console.log('active range', this.activeRange)
                //this.activeRange = params.range;
                this.activeRangeStream.onNext({
                    activeRange: this.activeRange
                });

                this.rangeBarCollection.refreshRangeSliderPosition(this.activeRange);
                this.rangeControlBar.refreshRangePosition(this.activeRange, params.handle);
                break;
            case 'remove':
                console.log('************** action remove **************')
                // if a range is specified remove it from collection:
                if (params.range !== undefined) {
                    this.rangeCollection.remove(params.range);
                    if (params.range.id === this.activeRange.id) {
                        // remove from controls components too if active:
                        this.rangeBarCollection.removeActiveRange();
                        this.rangeControlBar.removeActiveRange();
                    }
                } else {
                    this.rangeBarCollection.removeActiveRange();
                    this.rangeControlBar.removeActiveRange();
                    this.rangeCollection.remove(this.activeRange);

                    // set another active range
                }

                break;
            case 'drag-update':
                console.log('************** action drag update **************')
                this.rangeCollection.update(params.range);
                // if changes come from range bar
                this.rangeControlBar.refreshRangePosition(params.range, params.handle);
                break;
            default:
        }
        console.log('<<< =================== RANGE EVENT COMPLETE')
        this.setEditorHeight()

    });

    this.ready(() => {
        this.setEditorHeight()
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
                        action: 'update',
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
                        action: 'update',
                        range: player.rangeControlBar.setEndPosition()
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
                        action: 'update',
                        range: player.rangeControlBar.removeRange()
                    });
                }
            }
        }

    }


    // init a default range once every components are ready:
    this.rangeCollection.initDefaultRange();

}
videojs.plugin('rangeCapturePlugin', plugin);
export default plugin;
