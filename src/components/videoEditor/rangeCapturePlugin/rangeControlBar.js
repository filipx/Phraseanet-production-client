import $ from 'jquery';
import _ from 'underscore';
// import textMask from 'all-text-mask/vanilla/dist/textMask';
import videojs from 'video.js';
let textMask = require('all-text-mask/vanilla/dist/textMask');
/**
 * VideoJs Range Control Bar
 */
const Component = videojs.getComponent('Component');


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


// @TODO: convert into clickable components:
let rangeMenu = `<div class="range-capture-container">

<button class="button" id="start-range"  data-toggle="tooltip" title="first tooltip"><svg class="icon icon-cue-start"><use xlink:href="#icon-cue-start"></use></svg><span class="icon-label"> icon-cue-start</span></button>
<button class="button" id="end-range"><svg class="icon icon-cue-end"><use xlink:href="#icon-cue-end"></use></svg><span class="icon-label"> icon-cue-end</span></button>
<button class="button" id="delete-range"><svg class="icon icon-trash"><use xlink:href="#icon-trash"></use></svg><span class="icon-label"> remove</span></button>
<button class="button" id="loop-range"><svg class="icon icon-loop-range"><use xlink:href="#icon-loop-range"></use></svg><span class="icon-label"> loop</span></button>
<button class="button" id="prev-forward-frame"><svg class="icon icon-prev-forward-frame"><use xlink:href="#icon-prev-forward-frame"></use></svg><span class="icon-label"> prev forward frame</span></button>
<button class="button" id="backward-frame"><svg class="icon icon-prev-frame"><use xlink:href="#icon-prev-frame"></use></svg><span class="icon-label"> prev frame</span></button>
<span id="display-start" class="display-time">
<input type="text" class="range-input" data-scope="start-range" id="start-range-input-hours" value="00" size="2"/>:
<input type="text" class="range-input" data-scope="start-range" id="start-range-input-minutes" value="00" size="2"/>:
<input type="text" class="range-input" data-scope="start-range" id="start-range-input-seconds" value="00" size="2"/>s
<input type="text" class="range-input" data-scope="start-range" id="start-range-input-frames" value="00" size="2"/>f
</span>
<span id="display-end" class="display-time">
<input type="text" class="range-input" data-scope="end-range" id="end-range-input-hours" value="00" size="2"/>:
<input type="text" class="range-input" data-scope="end-range" id="end-range-input-minutes" value="00" size="2"/>:
<input type="text" class="range-input" data-scope="end-range" id="end-range-input-seconds" value="00" size="2"/>s
<input type="text" class="range-input" data-scope="end-range" id="end-range-input-frames" value="00" size="2"/>f</span>
<button class="button" id="forward-frame"><svg class="icon icon-next-frame"><use xlink:href="#icon-next-frame"></use></svg><span class="icon-label"> next frame</span></button>
<button class="button" id="next-forward-frame"><svg class="icon icon-next-forward-frame"><use xlink:href="#icon-next-forward-frame"></use></svg><span class="icon-label"> next forward frame</span></button>

<span id="display-current" class="display-time"></span>
</div>`;
const defaults = {
    frameRate: 24
};
class RangeControlBar extends Component {
    rangeControlBar;
    rangeCollection;
    frameRate;

    constructor(player, options) {
        super(player, options);
        const settings = videojs.mergeOptions(defaults, options);

        //this.settings = settings;
        this.rangeCollection = {};
        this.looping = false;
        this.loopData = [];
        this.frameStep = 1;
        this.frameDuration = (1 / this.frameRate);
        this.rangeCollection = {};
        this.activeRange = 0;
        this.rangeBlueprint = {
            id: 1,
            startPosition: -1,
            endPosition: -1
        };
        this.activeRange = this.rangeCollection[1] = this.rangeBlueprint;

        this.frameRate = settings.frameRates[this.player_.currentSrc()];
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
            })
            .on('click', '#prev-forward-frame', (event) => {
                event.preventDefault();
                if (!this.player_.paused()) {
                    this.player_.pause();
                }
                this.player_.currentTime(this.getStartPosition())
            })
            .on('click', '#next-forward-frame', (event) => {
                event.preventDefault();
                if (!this.player_.paused()) {
                    this.player_.pause();
                }
                this.player_.currentTime(this.getEndPosition())
            })
            .on('click', '#loop-range', (event) => {
                event.preventDefault();

                let $el = $(event.currentTarget);
                if (!this.player_.paused()) {
                    this.player_.pause();
                }
                this.looping = !this.looping;

                if (this.looping) {
                    $el.addClass('active');
                    this.loopBetween();
                } else {
                    $el.removeClass('active');
                }
            })
            .on('keyup', '.range-input', (event) => {
                if (event.keyCode === 13) {
                    $(event.currentTarget).blur();
                }
            })
            .on('focus', '.range-input', (event) => {
                event.currentTarget.setSelectionRange(0, event.currentTarget.value.length)
            })
            .on('blur', '.range-input', (event) => {
                event.preventDefault();
                let $el = $(event.currentTarget);

                if (this.validateScopeInput($el.data('scope'))) {
                    // this.validateScopeInput();
                    let newCurrentTime = this.getScopeInputTime($el.data('scope'));
                    this.player_.currentTime(newCurrentTime);
                    $el.addClass('is-valid');
                    setTimeout(() => $el.removeClass('is-valid'), 500);
                } else {
                    $el.addClass('has-error');
                    setTimeout(() => $el.removeClass('has-error'), 1200);
                }
                // fallback on old values if have errors:
                this.player_.rangeStream.onNext({
                    action: 'change',
                    handle: ($el.data('scope') === 'start-range' ? 'start' : 'end'),
                    range: ($el.data('scope') === 'start-range' ? this.setStartPositon() : this.setEndPositon())
                });

            });

        $(this.rangeControlBar).append(icons);
        $(this.rangeControlBar).append(rangeMenu);
        $('.button').tooltip({placement: 'bottom'})

        this.player_.on('timeupdate', () => {
            this.onRefreshCurrentTime();
            // if a loop exists
            if (this.looping === true && this.loopData.length > 0) {

                let start = this.loopData[0];
                let end = this.loopData[1];

                var current_time = this.player_.currentTime();

                if (current_time < start || end > 0 && current_time > end) {
                    this.player_.currentTime(start);
                }

            }
        });
        return this.rangeControlBar;
    }

    updateActiveRange(range, handle) {
        handle = handle || false;

        this.updateRangeDisplay('start-range', range.startPosition);
        this.updateRangeDisplay('end-range', range.endPosition);

        $('display-current').html(formatTimeToHHMMSSFF(this.player_.currentTime(), this.frameRate));
        this.activeRange = this.rangeCollection[range.id] = range;

        if (handle === 'start') {
            this.player_.currentTime(range.startPosition)
        } else if (handle === 'end') {
            this.player_.currentTime(range.endPosition)
        }
    }

    updateRangeDisplay(scope, currentTime) {
        let hours = Math.floor(currentTime / 3600);
        let s = currentTime - hours * 3600;
        let minutes = Math.floor(s / 60);
        let seconds = Math.floor(s - minutes * 60);

        let currentRest = currentTime - (Math.floor(currentTime));
        let currentFrames = Math.floor(this.frameRate * currentRest);

        $(`#${scope}-input-hours`).val(('0' + hours).slice(-2));
        $(`#${scope}-input-minutes`).val(('0' + minutes).slice(-2));
        $(`#${scope}-input-seconds`).val(('0' + seconds).slice(-2));
        $(`#${scope}-input-frames`).val(('0' + currentFrames).slice(-2));
    }

    getScopeInputs(scope) {
        return {
            hours: $(`#${scope}-input-hours`).val(),
            minutes: $(`#${scope}-input-minutes`).val(),
            seconds: $(`#${scope}-input-seconds`).val(),
            frames: $(`#${scope}-input-frames`).val()
        }
    }

    validateScopeInput(scope) {
        let scopeInputs = this.getScopeInputs(scope);
        var regex = /^\d+$/;    // allow only numbers [0-9]
        if (regex.test(scopeInputs.hours) && regex.test(scopeInputs.minutes) && regex.test(scopeInputs.seconds) && regex.test(scopeInputs.frames)) {
            if (scopeInputs.minutes < 0 || scopeInputs.minutes > 59) {
                return false;
            }
            if (scopeInputs.seconds < 0 || scopeInputs.seconds > 59) {
                return false;
            }
            if (scopeInputs.frames < 0 || scopeInputs.frames > this.frameRate) {
                return false;
            }
            return true;
        }
        return false;
    }

    getScopeInputTime(scope) {
        let scopeInputs = this.getScopeInputs(scope);
        let hours = parseInt(scopeInputs.hours, 10);
        let minutes = parseInt(scopeInputs.minutes, 10);
        let seconds = parseInt(scopeInputs.seconds, 10);
        let frames = parseInt(scopeInputs.frames, 10);

        let milliseconds = frames === 0 ? 0 : (((1000 / this.frameRate) * frames) / 1000).toFixed(2);

        return (hours * 3600) + (minutes * 60) + (seconds) + parseFloat(milliseconds);
    }

    updateCurrentTime() {
        $('#display-current').html(formatTimeToHHMMSSFF(this.player_.currentTime(), this.frameRate))
    }

    loopBetween(range) {
        range = range || this.activeRange;
        this.loop(range.startPosition, range.endPosition);
    }

    loop(start, end) {
        this.looping = true;
        this.player_.currentTime(start);

        this.loopData = [start, end];

        if (this.player_.paused()) {
            this.player_.play();
        }
    }

    setStartPositon(range) {
        // if range is not defined take active one:
        range = range || this.activeRange;
        let newRange = _.extend({}, this.rangeBlueprint, range);
        // set start
        newRange.startPosition = this.player_.currentTime();

        let firstTime = newRange.startPosition === -1 && newRange.endPosition === -1;
        let startBehindEnd = newRange.startPosition > newRange.endPosition;

        if (firstTime || startBehindEnd) {
            newRange.endPosition = this.player_.duration()
        }
        return newRange;
    }

    getStartPosition(range) {
        // if range is not defined take active one:
        range = range || this.activeRange;
        return range.startPosition;
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

    getEndPosition(range) {
        // if range is not defined take active one:
        range = range || this.activeRange;

        return range.endPosition;
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
