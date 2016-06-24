const formatMilliseconds = (currentTime, frameRate) => {
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    let currentFrames = 0;
    if (currentTime > 0) {
        hours = Math.floor(currentTime / 3600);
        let s = currentTime - hours * 3600;
        minutes = Math.floor(s / 60);
        seconds = Math.floor(s - minutes * 60);
        let currentRest = currentTime - (Math.floor(currentTime));
        currentFrames = Math.round(frameRate * currentRest);
    }
    return {
        hours: hours,
        minutes: minutes,
        seconds: seconds,
        frames: currentFrames
    }
}

const formatTimeToHHMMSSFF = (currentTime, frameRate) => {
    frameRate = frameRate || 24;
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    let currentFrames = 0;
    if (currentTime > 0) {
        hours = Math.floor(currentTime / 3600);
        let s = currentTime - hours * 3600;
        minutes = Math.floor(s / 60);
        seconds = Math.floor(s - minutes * 60);
        // keep only milliseconds rest ()
        let currentRest = currentTime - (Math.floor(currentTime));
        currentFrames = Math.round(frameRate * currentRest);
        // if( currentFrames >= )
    }
    return ('0' + hours).slice(-2) + ':' + ('0' + minutes).slice(-2) + ':' + ('0' + seconds).slice(-2) + 's ' + ('0' + currentFrames).slice(-2) + 'f'
}

export {formatMilliseconds, formatTimeToHHMMSSFF}
