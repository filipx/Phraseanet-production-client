import $ from 'jquery';
import _ from 'underscore';
import videojs from 'video.js';
import RangeItem from './RangeItem';
/**
 * VideoJs Range Collection
 */
const Component = videojs.getComponent('Component');

class RangeCollection extends Component {
    uid = 0;
    defaultRange = {
        startPosition: -1,
        endPosition: -1
    };
    rangeCollection = [];
    rangeItemComponentCollection = [];
    currentRange = false;

    constructor(player, settings) {
        super(player, settings);
        this.settings = settings;
        this.$el = this.renderElContent();

        this.player_.activeRangeStream.subscribe((params) => {
            this.currentRange = params.activeRange;
            this.refreshRangeCollection()
        });

        this.$el.on('click', '.add-range', (event) => {
            let newRange = this.addRange(this.defaultRange);
            this.player_.rangeStream.onNext({
                action: 'create',
                range: newRange
            })
        });
    }

    initDefaultRange() {
        // init collection with a new range if nothing specified:
        let newRange = this.addRange(this.defaultRange);
        this.player_.rangeStream.onNext({
            action: 'create',
            range: newRange
        });
    }

    /**
     * Create the component's DOM element
     *
     * @return {Element}
     * @method createEl
     */
    createEl() {
        return super.createEl('div', {
            className: 'range-collection-container',
            innerHTML: ''
        });
    }

    renderElContent() {
        $(this.el()).append(`
<div class="btn-container">
    <button class="button button-primary add-range" type="button"><i class="icon-plus"></i> ${this.player_.localize('Add new range')}</button>
</div>
<div class="btn-container">
    <button class="btn btn-inverse btn-block" type="button">${this.player_.localize('Export ranges')}</button>
</div>`);
        return $(this.el());
    }

    update(range) {
        let updatedRange;

        if (!this.isExist(range)) {
            updatedRange = this.addRange(range);
        } else {
            updatedRange = this.updateRange(range);
        }
        return updatedRange;
    }

    isExist(range) {
        if (range.id === undefined) {
            return false;
        }
        for (let i = 0; i < this.rangeCollection.length; i++) {
            if (this.rangeCollection[i].id === range.id) {
                return true;
            }
        }
        return false;
    }

    remove(range) {
        let cleanedColl = _.filter(this.rangeCollection, (rangeData, index) => {
            if (range.id === rangeData.id) {
                return false;
            }
            return true;
        });
        this.rangeCollection = cleanedColl;
        // if removed range is active one, activate another one
        if (range.id === this.currentRange.id) {
            if (this.rangeCollection.length > 0) {

                //let lastRange = this.rangeCollection.length-1;
                this.player_.rangeStream.onNext({
                    action: 'select',
                    range: this.rangeCollection[this.rangeCollection.length - 1]
                })
            }

        }
        this.refreshRangeCollection();
    }

    addRange(range) {
        let lastId = this.uid = this.uid + 1;
        let newRange = _.extend({}, this.defaultRange, range, {id: lastId});

        this.rangeCollection.push(newRange);
        this.refreshRangeCollection();
        return newRange;
    }

    updateRange(range) {
        if (range.id !== undefined) {
            this.rangeCollection = _.map(this.rangeCollection, (rangeData, index) => {
                if (range.id === rangeData.id) {
                    return range;
                }
                return rangeData;
            });
        }
        this.refreshRangeCollection();
        return range;
    }

    getRangeById(id) {
        let foundRange = {};
        for (let i = 0; i < this.rangeCollection.length; i++) {
            if (this.rangeCollection[i].id === id) {
                foundRange = this.rangeCollection[i];
            }
        }
        return foundRange;
    }

    refreshRangeCollection = () => {
        // remove any existing items
        for (let i = 0; i < this.rangeItemComponentCollection.length; i++) {
            this.removeChild(this.rangeItemComponentCollection[i]);
        }

        let activeId = 0;
        if (this.currentRange !== false) {
            activeId = this.currentRange.id;
        }

        for (let i = 0; i < this.rangeCollection.length; i++) {
            let item = new RangeItem(this.player_, {
                item: this.rangeCollection[i],
                isActive: this.rangeCollection[i].id === activeId ? true : false
            }, this.settings);

            this.rangeItemComponentCollection.push(item);
            this.addChild(item);


        }
    }
}

videojs.registerComponent('RangeCollection', RangeCollection);

export default RangeCollection;
