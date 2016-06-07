import videojs from 'video.js';
/**
 * VideoJs Range Bar Collection
 */
const Component = videojs.getComponent('Component');

class RangeBarCollection extends Component {
    rangeCollection = {};
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
        return super.createEl('div', {
            className: 'vjs-range-container',
            innerHTML: '<div><span></span></div>'
        });
    }
    updateRangeCollection = () => {
        
    }
    updateRange = (range) => {
        console.log('update range', range.id);
        let videoDuration = this.player_.duration();
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

videojs.registerComponent('RangeBarCollection', RangeBarCollection);

export default RangeBarCollection;