import videojs from 'video.js';
/**
 * VideoJs Range bar
 */
const Component = videojs.getComponent('Component');

class RangeBar extends Component {
    rangeBar;
    constructor(player, settings) {
        super(player, settings);
    }

    /**
     * Create the component's DOM element
     *
     * @return {Element}
     * @method createEl
     */
    createEl() {
        this.rangeBar =  super.createEl('div', {
            className: 'vjs-range-bar',
            innerHTML: '<div><span></span></div>'
        });

        console.log('create EL', this.rangeBar)
        return this.rangeBar;
    }

    updateRange = (range) => {
        let videoDuration = this.player_.duration();
        console.log('el ', this, this.el(), this.rangeBar)
        if( this.rangeCollection[range.id] === undefined ) {
            this.rangeCollection[range.id] = {
                style: {
                    left: 0,
                    width: '0%'
                }
            }
        }
        // set left side with percent update
        this.el().style.left = ((range.startPosition/videoDuration) * 100) + '%';
        console.log('left position (%)', videoDuration, range.startPosition, ((range.startPosition/videoDuration) * 100));
        this.el().style.width = (range.endPosition - range.startPosition) + 'px';
        console.log('right position (width in px)', range.endPosition - range.startPosition);

    }
}

videojs.registerComponent('RangeBar', RangeBar);

export default RangeBar;