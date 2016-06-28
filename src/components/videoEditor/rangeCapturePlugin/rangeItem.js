import _ from 'underscore';
import $ from 'jquery';
import videojs from 'video.js';
import {formatTimeToHourMinuteSecond} from './utils';
/**
 * VideoJs Range bar
 */
const Component = videojs.getComponent('Component');
let rangeItemTemplate = (item, frameRate) => {
    return `
<span class="range-item-index">${item.index + 1}</span>
<div class="range-item-time-data">
    <span class="icon-container small-icon"><svg class="icon icon-cue-start"><use xlink:href="#icon-cue-start"></use></svg></span> 
    <span class="display-time">${formatTimeToHourMinuteSecond(item.startPosition, frameRate)}</span>
    <span class="display-time">${formatTimeToHourMinuteSecond(item.endPosition, frameRate)}</span>
    <span class="icon-container small-icon"><svg class="icon icon-cue-end"><use xlink:href="#icon-cue-end"></use></svg></span> 
    <br>
    <div class="progress-container">
    <div class="progress-bar" style="left:${item.handlePositions.left}%;width:${item.handlePositions.right - item.handlePositions.left}%; height: 100%"></div>
    <div class="progress-value">${formatTimeToHourMinuteSecond(item.endPosition - item.startPosition, frameRate)}</div>
    </div>
</div>
<span class="range-item-title">
<input class="range-title range-input" type="text" value="${item.title}" placeholder="entrez un titre">
</span>`;
    // <button class="control-button remove-range"><svg class="icon icon-trash"><use xlink:href="#icon-trash"></use></svg><span class="icon-label"> remove</span></button>
};
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
            if (rangeItem.isActive === false) {
                // broadcast active state:
                this.player_.rangeStream.onNext({
                    action: 'change',
                    range: rangeItem.item
                });
            }
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
        this.$el.on('keydown', '.range-title', (event) => {
            event.stopPropagation();
        });
        this.$el.on('blur', '.range-title', (event) => {
            event.preventDefault();
            let $el = $(event.currentTarget);
            this.player_.rangeStream.onNext({
                action: 'update',
                range: _.extend(rangeItem.item, {
                    title: $el.val()
                })
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
