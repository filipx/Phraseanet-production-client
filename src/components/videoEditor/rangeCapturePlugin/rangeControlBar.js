import $ from 'jquery';
import _ from 'underscore';

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
    let hours = Math.floor(currentTime / 3600);
    let s = currentTime - hours * 3600;
    let minutes = Math.floor(s / 60);
    let seconds = Math.floor(s - minutes * 60);

    let currentRest = currentTime - (Math.floor(currentTime));
    let currentFrames = Math.floor(frameRate * currentRest);

    return ('0' + hours).slice(-2) + ':' + ('0' + minutes).slice(-2) + ':' + ('0' + seconds).slice(-2) + 's ' + ('0' + currentFrames).slice(-2) + 'f'
}

const rangeControlBar = (options) => {

    let frameStep = 1;
    let frameRate = 24;
    let frameDuration = (1 / frameRate);
    let rangeCollection = {};
    let activeRange = 0;
    let rangeBlueprint = {
        id: 0,
        startPosition: -1,
        endPosition: -1
    };
    let rangeStream = new Rx.Subject();

    onRefreshCurrentTime = _.debounce(onRefreshCurrentTime, 4, true);

    rangeStream.subscribe((params) => {
        console.log('subscribe', params)
        switch (params.action) {
            case 'change':
                rangeBlueprint = params.range;
                $('#display-start').html(formatTimeToHHMMSSFF(rangeBlueprint.startPosition, frameRate));
                $('#display-end').html(formatTimeToHHMMSSFF(rangeBlueprint.endPosition, frameRate));
                $('display-current').html(formatTimeToHHMMSSFF(options.videoPlayer.currentTime(), frameRate))


                options.videoPlayer.rangeBarCollection.updateRange(params.range);

                rangeCollection[params.range.id] = params.range;
                console.log('rangeCollection updated:', rangeCollection)
                break;
            case 'refresh':
                $('#display-current').html(formatTimeToHHMMSSFF(options.videoPlayer.currentTime(), frameRate))
                break;
            default:
        }
    })

    const initialize = (playerEl, rangeCollection) => {
        let $container = $(playerEl);
        $container.append(icons);
        $container.append(rangeMenu);
        $('.button').tooltip({placement: 'bottom'})
    }

    const initTimecode = formatTimeToHHMMSSFF(0, frameRate);
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

    options.videoPlayer.on('play', function (e) {
        console.log('[RANGE PLUG] playback has started!');
    });
    options.videoPlayer.on('timeupdate', function (e) {
        onRefreshCurrentTime();
    });

    // debounceable
    let onRefreshCurrentTime = () => {
        //$('#display-current').html(formatTimeToHHMMSSFF(options.videoPlayer.currentTime()))
        document.getElementById("display-current").innerHTML = formatTimeToHHMMSSFF(options.videoPlayer.currentTime(), frameRate)
    }

    $(options.$container)
        .on('click', '#start-range', (event) => {
            event.preventDefault();
            let range = {
                id: 1
            };

            rangeStream.onNext({
                action: 'change',
                range: setStartPositon(range)
            });
        })
        .on('click', '#end-range', (event) => {
            event.preventDefault();
            let range = {
                id: 1
            };
            rangeStream.onNext({
                action: 'change',
                range: setEndPositon(range)
            });
        })
        .on('click', '#backward-frame', (event) => {
            event.preventDefault();
            setPreviousFrame();
        })
        .on('click', '#forward-frame', (event) => {
            event.preventDefault();
            setNextFrame();
        });


    const setStartPositon = (range) => {
        let newRange = _.extend({}, rangeBlueprint, range);
        // set start
        newRange.startPosition = options.videoPlayer.currentTime();

        let firstTime = newRange.startPosition === -1 && newRange.endPosition === -1;
        let startBehindEnd = newRange.startPosition > newRange.endPosition;

        if (firstTime || startBehindEnd) {
            newRange.endPosition = options.videoPlayer.duration()
        }

        return newRange;
    }
    const setEndPositon = (range) => {
        let newRange = _.extend({}, rangeBlueprint, range);
        newRange.endPosition = options.videoPlayer.currentTime();
        let firstTime = newRange.startPosition === -1 && newRange.endPosition === -1;
        let startBehindEnd = newRange.startPosition > newRange.endPosition;
        if (firstTime || startBehindEnd) {
            newRange.startPosition = 0;
        }
        return newRange;
    }

    const removeRange = (range) => {
        delete rangeCollection[range];
    }

    const setNextFrame = () => {
        let position = options.videoPlayer.currentTime();
        options.videoPlayer.pause();
        options.videoPlayer.currentTime(position + (frameDuration * frameStep));
        rangeStream.onNext({
            action: 'refresh'
        });
    }
    const setPreviousFrame = () => {
        let position = options.videoPlayer.currentTime();
        options.videoPlayer.pause();
        options.videoPlayer.currentTime(position - (frameDuration * frameStep));
        rangeStream.onNext({
            action: 'refresh'
        });
    }

    return {
        initialize
    }

}

export default rangeControlBar;