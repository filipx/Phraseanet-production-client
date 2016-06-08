import $ from 'jquery';
import _ from 'underscore';
import videojs from 'video.js';
/**
 * VideoJs Range Control Bar
 */
const Component = videojs.getComponent('Component');


const icons = `
<svg style="position: absolute; width: 0; height: 0;" width="0" height="0" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<defs>
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

const formatTimeToHHMMSSFF = (currentTime, frameRate) => {
    frameRate = frameRate || 24;
    let hours = Math.floor(currentTime / 3600);
    let s = currentTime - hours * 3600;
    let minutes = Math.floor(s / 60);
    let seconds = Math.floor(s - minutes * 60);

    let currentRest = currentTime - (Math.floor(currentTime));
    let currentFrames = Math.floor(frameRate * currentRest);

    return ('0' + hours).slice(-2) + ':' + ('0' + minutes).slice(-2) + ':' + ('0' + seconds).slice(-2) + 's ' + ('0' + currentFrames).slice(-2) + 'f'
}
const initTimecode = formatTimeToHHMMSSFF(0);


// @TODO: convert into clickable components:
let rangeMenu = `<div class="range-capture-container">

<button class="button" id="start-range"  data-toggle="tooltip" title="first tooltip"><svg class="icon icon-cue-start"><use xlink:href="#icon-cue-start"></use></svg><span class="icon-label"> icon-cue-start</span></button>
<button class="button" id="end-range"><svg class="icon icon-cue-end"><use xlink:href="#icon-cue-end"></use></svg><span class="icon-label"> icon-cue-end</span></button>
<button class="button" id="delete-range"><svg class="icon icon-trash"><use xlink:href="#icon-trash"></use></svg><span class="icon-label"> remove</span></button>
<button class="button" id="prev-forward-frame"><svg class="icon icon-prev-forward-frame"><use xlink:href="#icon-prev-forward-frame"></use></svg><span class="icon-label"> prev forward frame</span></button>
<button class="button" id="backward-frame"><svg class="icon icon-prev-frame"><use xlink:href="#icon-prev-frame"></use></svg><span class="icon-label"> prev frame</span></button>
<span id="display-start" class="display-time">${initTimecode}</span>
<span id="display-end" class="display-time">${initTimecode}</span>
<button class="button" id="forward-frame"><svg class="icon icon-next-frame"><use xlink:href="#icon-next-frame"></use></svg><span class="icon-label"> next frame</span></button>
<button class="button" id="next-forward-frame"><svg class="icon icon-next-forward-frame"><use xlink:href="#icon-next-forward-frame"></use></svg><span class="icon-label"> next forward frame</span></button>

<span id="display-current" class="display-time"></span>
</div>`;

class RangeControlBar extends Component {
    rangeControlBar;
    rangeCollection;

    constructor(player, settings) {
        super(player, settings);

        //this.settings = settings;
        this.rangeCollection = {};
        this.frameStep = 1;
        this.frameRate = 24;
        this.frameDuration = (1 / this.frameRate);
        this.rangeCollection = {};
        this.activeRange = 0;
        this.rangeBlueprint = {
            id: 1,
            startPosition: -1,
            endPosition: -1
        };
        this.activeRange = this.rangeCollection[1] = this.rangeBlueprint;
        //this.player_.rangeStream = new Rx.Subject();
        /*this.player_.rangeStream.subscribe((params) => {
         console.log('subscribe', params)
         switch (params.action) {
         case 'change':
         // let rangeBlueprint = params.range;
         $('#display-start').html(formatTimeToHHMMSSFF(params.range.startPosition, this.frameRate));
         $('#display-end').html(formatTimeToHHMMSSFF(params.range.endPosition, this.frameRate));
         $('display-current').html(formatTimeToHHMMSSFF(this.player_.currentTime(), this.frameRate));


         this.player_.rangeBarCollection.updateRange(params.range);

         this.activeRange = this.rangeCollection[params.range.id] = params.range;
         console.log('rangeCollection updated:', this.rangeCollection)
         break;
         case 'refresh':
         $('#display-current').html(formatTimeToHHMMSSFF(this.player_.currentTime(), this.frameRate))
         break;
         default:
         }
         })*/
    }

    /**
     * Create the component's DOM element
     *
     * @return {Element}
     * @method createEl
     */
    createEl() {
        this.rangeControlBar = super.createEl('div', {
            className: 'vjs-range-control-bar',
            innerHTML: ''
        });
        $(this.rangeControlBar)
            .on('click', '#start-range', (event) => {
                event.preventDefault();
                this.player_.rangeStream.onNext({
                    action: 'change',
                    handle: 'start',
                    range: this.setStartPositon()
                });
            })
            .on('click', '#end-range', (event) => {
                event.preventDefault();
                this.player_.rangeStream.onNext({
                    action: 'change',
                    handle: 'end',
                    range: this.setEndPositon()
                });
            })
            .on('click', '#delete-range', (event) => {
                event.preventDefault();
                this.player_.rangeStream.onNext({
                    action: 'change',
                    range: this.removeRange()
                });
            })
            .on('click', '#backward-frame', (event) => {
                event.preventDefault();
                this.setPreviousFrame();
            })
            .on('click', '#forward-frame', (event) => {
                event.preventDefault();
                this.setNextFrame();
            });
        this.player_.on('timeupdate', (e) => {
            this.onRefreshCurrentTime();
        });


        $(this.rangeControlBar).append(icons);
        $(this.rangeControlBar).append(rangeMenu);
        $('.button').tooltip({placement: 'bottom'})
        return this.rangeControlBar;
    }

    updateActiveRange(range, handle) {
        handle = handle || false;
        $('#display-start').html(formatTimeToHHMMSSFF(range.startPosition, this.frameRate));
        $('#display-end').html(formatTimeToHHMMSSFF(range.endPosition, this.frameRate));
        $('display-current').html(formatTimeToHHMMSSFF(this.player_.currentTime(), this.frameRate));
        this.activeRange = this.rangeCollection[range.id] = range;
        console.log('handle', handle)
        if (handle === 'start') {
            this.player_.currentTime(range.startPosition)
        } else if (handle === 'end') {
            this.player_.currentTime(range.endPosition)
        }
    }

    updateCurrentTime() {
        $('#display-current').html(formatTimeToHHMMSSFF(this.player_.currentTime(), this.frameRate))
    }

    loopBetween(range) {
        range = range || this.activeRange;
    }

    setStartPositon(range) {
        // if range is not defined take active one:
        range = range || this.activeRange;
        console.log('>>> args', range);
        let newRange = _.extend({}, this.rangeBlueprint, range);
        console.log('>>> merged', _.extend({}, newRange));
        // set start
        newRange.startPosition = this.player_.currentTime();

        let firstTime = newRange.startPosition === -1 && newRange.endPosition === -1;
        let startBehindEnd = newRange.startPosition > newRange.endPosition;

        if (firstTime || startBehindEnd) {
            newRange.endPosition = this.player_.duration()
        }
        console.log('>>> final', newRange);
        return newRange;
    }

    setEndPositon(range) {
        // if range is not defined take active one:
        range = range || this.activeRange;
        let newRange = _.extend({}, this.rangeBlueprint, range);
        newRange.endPosition = this.player_.currentTime();
        let firstTime = newRange.startPosition === -1 && newRange.endPosition === -1;
        let startBehindEnd = newRange.startPosition > newRange.endPosition;
        if (firstTime || startBehindEnd) {
            newRange.startPosition = 0;
        }
        return newRange;
    }

    removeRange(range) {
        delete this.rangeCollection[range];
        this.activeRange = this.rangeCollection[1] = this.rangeBlueprint;
        return this.activeRange;
    }

    /**
     *
     * @param step (frames)
     */
    setNextFrame(step) {
        let position = this.player_.currentTime();
        if (!this.player_.paused()) {
            this.player_.pause();
        }
        step = step || this.frameStep;
        this.player_.currentTime(position + (this.frameDuration * step));
        this.player_.rangeStream.onNext({
            action: 'refresh'
        });
    }

    /**
     *
     * @param step (frames)
     */
    setPreviousFrame(step) {
        let position = this.player_.currentTime();
        if (!this.player_.paused()) {
            this.player_.pause();
        }
        step = step || this.frameStep;
        this.player_.currentTime(position - (this.frameDuration * this.frameStep));
        this.player_.rangeStream.onNext({
            action: 'refresh'
        });
    }

    onRefreshCurrentTime() {
        //$('#display-current').html(formatTimeToHHMMSSFF(options.videoPlayer.currentTime()))
        document.getElementById('display-current').innerHTML = formatTimeToHHMMSSFF(this.player_.currentTime(), this.frameRate)
    }

}

videojs.registerComponent('RangeControlBar', RangeControlBar);

export default RangeControlBar;
