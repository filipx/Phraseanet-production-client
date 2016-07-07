import $ from 'jquery';
import _ from 'underscore';
import videojs from 'video.js';
import RangeItem from './RangeItem';
import {formatTime} from './utils';
/**
 * VideoJs Range Collection
 */
const Component = videojs.getComponent('Component');

class RangeCollection extends Component {
    uid = 0;
    defaultRange = {
        startPosition: -1,
        endPosition: -1,
        title: '',
        handlePositions: [],
        selected: false,
        image: {
            src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFkAAAAyCAYAAAA3OHc2AAAAuElEQVR4Xu3UwQkAIAwEwdh/0Qr2kH2NBWRhODwzc8dbFTiQV33/ccj7xpADY8iQC4Gg4U+GHAgECUuGHAgECUuGHAgECUuGHAgECUuGHAgECUuGHAgECUuGHAgECUuGHAgECUuGHAgECUuGHAgECUuGHAgECUuGHAgECUuGHAgECUuGHAgECUuGHAgECUuGHAgECUuGHAgECUuGHAgECUuGHAgECUuGHAgECUuGHAgECUuGHAgEiQftoTIBhrHr1wAAAABJRU5ErkJggg==',
            width: 89,
            height: 50
        }
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
            event.preventDefault();
            let newRange = this.addRange(this.defaultRange);
            this.player_.rangeStream.onNext({
                action: 'create',
                range: newRange
            })
        });

        this.$el.on('click', '.export-ranges', (event) => {
            event.preventDefault();
            this.player_.rangeStream.onNext({
                action: 'export-ranges',
                ranges: this.exportRanges()
            })
        })

        this.$el.on('click', '.export-vtt-ranges', (event) => {
            event.preventDefault();
            this.player_.rangeStream.onNext({
                action: 'export-vtt-ranges',
                data: this.exportVttRanges()
            })
        })
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
    <button class="button button-primary export-vtt-ranges" type="button"><i class="icon-save"></i> ${this.player_.localize('Save as VTT')}</button>
    <button class="button button-primary export-ranges" type="button"><i class="icon-cloud-download"></i> ${this.player_.localize('Export video ranges')}</button>
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
        newRange = this.setHandlePositions(newRange);
        this.rangeCollection.push(newRange);
        this.refreshRangeCollection();
        return newRange;
    }

    updateRange(range) {
        if (range.id !== undefined) {
            this.rangeCollection = _.map(this.rangeCollection, (rangeData, index) => {
                if (range.id === rangeData.id) {
                    range = this.setHandlePositions(range);
                    return range;
                }
                return rangeData;
            });
        }
        this.refreshRangeCollection();
        return range;
    }

    setHandlePositions(range) {
        let videoDuration = this.player_.duration();
        if (videoDuration > 0) {
            let left = ((range.startPosition / videoDuration) * 100);
            let right = ((range.endPosition / videoDuration) * 100);

            range.handlePositions = {left, right};
        }
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

    exportRanges = () => {
        let exportedRanges = [];
        for (let i = 0; i < this.rangeCollection.length; i++) {
            exportedRanges.push({
                startPosition: this.rangeCollection[i].startPosition,
                endPosition: this.rangeCollection[i].endPosition
            })
        }
        return exportedRanges;
    }
    exportVttRanges = () => {
        let exportedRanges = [`WEBVTT
`];
        for (let i = 0; i < this.rangeCollection.length; i++) {
            let exportableData = {
                title: this.rangeCollection[i].title
            };

            if (this.rangeCollection[i].image.src !== '') {
                exportableData.image = this.rangeCollection[i].image.src;
            }

            exportedRanges.push(`${i + 1}
${formatTime(this.rangeCollection[i].startPosition, 'hh:mm:ss.mmm')} --> ${formatTime(this.rangeCollection[i].endPosition, 'hh:mm:ss.mmm')}
${JSON.stringify(exportableData)}
`)
        }
        return exportedRanges.join('\n');
    }

    get = (model) => {
        if (model === undefined) {
            return this.rangeCollection;
        }
        return this.getRangeById(model.id);
    }

    splice = (...args) => {
        return Array.prototype.splice.apply(this.rangeCollection, args);
    }

    getIndex = (model) => {
        let index = {};
        for (let i = 0; i < this.rangeCollection.length; i++) {
            if (this.rangeCollection[i].id === model.id) {
                index = i;
            }
        }
        return index;
    }

    getSelection = () => {
        let selectedRanges = [];
        for (let i = 0; i < this.rangeCollection.length; i++) {
            if (this.rangeCollection[i].selected === true) {
                selectedRanges.push(this.rangeCollection[i]);
            }
        }
        return selectedRanges;
    }

    resetSelection = () => {
        for (let i = 0; i < this.rangeCollection.length; i++) {
            this.rangeCollection[i].selected = false;
        }
    }

    addToSelection = (model) => {
        for (let i = 0; i < this.rangeCollection.length; i++) {
            if (this.rangeCollection[i].id === model.id) {
                this.rangeCollection[i].selected = true;
            }
        }
    }

    removeFromSelection = (model) => {
        for (let i = 0; i < this.rangeCollection.length; i++) {
            if (this.rangeCollection[i].id === model.id) {
                this.rangeCollection[i].selected = false;
            }
        }
    }

    getFirstSelected = () => {
        let firstModel = false;
        for (let i = 0; i < this.rangeCollection.length; i++) {
            if (this.rangeCollection[i].selected === true && firstModel === false) {
                firstModel = this.rangeCollection[i];
            }
        }
        return firstModel;
    }

    getLastSelected = () => {
        let lastModel = false;
        for (let i = 0; i < this.rangeCollection.length; i++) {
            if (this.rangeCollection[i].selected === true) {
                lastModel = this.rangeCollection[i];
            }
        }
        return lastModel;
    }

    reset = (collection) => {
        this.rangeCollection = collection;
        // refresh internal indexes:
        for (let i = 0; i < this.rangeCollection.length; i++) {
            this.rangeCollection[i].index = i;
        }
        this.refreshRangeCollection();
    }

    refreshRangeCollection = () => {
        // remove any existing items
        for (let i = 0; i < this.rangeItemComponentCollection.length; i++) {
            this.rangeItemComponentCollection[i].dispose();
            this.removeChild(this.rangeItemComponentCollection[i]);
        }
        this.rangeItemComponentCollection = [];

        let activeId = 0;
        if (this.currentRange !== false) {
            activeId = this.currentRange.id;
        }

        for (let i = 0; i < this.rangeCollection.length; i++) {
            let model = _.extend({}, this.rangeCollection[i], {index: i});
            let item = new RangeItem(this.player_, {
                model: model,
                collection: this,
                isActive: this.rangeCollection[i].id === activeId ? true : false
            }, this.settings);

            this.rangeItemComponentCollection.push(item);
            this.addChild(item);


        }
    }
}

videojs.registerComponent('RangeCollection', RangeCollection);

export default RangeCollection;
