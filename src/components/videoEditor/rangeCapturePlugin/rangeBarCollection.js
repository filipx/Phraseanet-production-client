import videojs from 'video.js';
import noUiSlider from 'noUiSlider';
import RangeBar from './rangeBar';
/**
 * VideoJs Range Bar Collection
 */
const Component = videojs.getComponent('Component');

class RangeBarCollection extends Component {
    rangeCollection = {};

    constructor(player, settings) {
        super(player, settings);
        this.settings = settings;
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
            innerHTML: ''
        });
    }

    updateRangeCollection = () => {

    }

    updateRange = (range) => {
        if (this.rangeCollection[range.id] === undefined) {
            this.rangeCollection[range.id] = this.addChild('RangeBar', [this.player_, this.settings]);
        }
        this.rangeCollection[range.id].updateRange(range);
    }

    removeRange = (range) => {
        if (this.rangeCollection[range.id] !== undefined) {
            this.rangeCollection[range.id] = this.removeChild('RangeBar');
        }
    }
}

videojs.registerComponent('RangeBarCollection', RangeBarCollection);

export default RangeBarCollection;
