import $ from 'jquery';
import videojs from 'video.js';
import {formatTimeToHHMMSSFF} from './utils';
/**
 * VideoJs Range bar
 */
const Component = videojs.getComponent('Component');
let rangeItemTemplate = (item, frameRate) => {
    return `<span class="icon-container"><svg class="icon icon-cue-start"><use xlink:href="#icon-cue-start"></use></svg></span> 
<span class="display-time">${formatTimeToHHMMSSFF(item.startPosition, frameRate)}</span>
<span class="display-time">${formatTimeToHHMMSSFF(item.endPosition, frameRate)}</span>
<span class="icon-container"><svg class="icon icon-cue-end"><use xlink:href="#icon-cue-end"></use></svg></span> 
<span class="spacer"> </span>
<button class="control-button remove-range"><svg class="icon icon-trash"><use xlink:href="#icon-trash"></use></svg><span class="icon-label"> remove</span></button>`;
}
class RangeItem extends Component {
    rangeItem;
    settings;
    item;

    constructor(player, rangeItem, settings) {
        super(player, rangeItem);
        this.frameRate = settings.frameRates[this.player_.cache_.src];
        this.settings = settings;
        this.$el = this.renderElContent();

        this.$el.on('click', (event) => {
            event.preventDefault();
            let $el = $(event.currentTarget);

            // broacast active state:
            this.player_.rangeStream.onNext({
                action: 'change',
                range: rangeItem.item
            });
        })
        this.$el.on('click', '.remove-range', (event) => {
            event.preventDefault();
            this.player_.rangeStream.onNext({
                action: 'remove',
                range: rangeItem.item
            });
            // don't trigger other events
            event.stopPropagation();
        })
    }

    /**
     * Create the component's DOM element
     *
     * @return {Element}
     * @method createEl
     */
    createEl() {
        this.rangeItem = super.createEl('div', {
            className: 'range-collection-item',
            innerHTML: ''
        });

        return this.rangeItem;
    }

    renderElContent() {
        $(this.el_).append(rangeItemTemplate(this.options_.item, this.frameRate));
        if (this.options_.isActive) {
            $(this.el_).addClass('active')
        }
        return $(this.el_);
    }
}

videojs.registerComponent('RangeItem', RangeItem);

export default RangeItem;
