
import videojs from 'video.js';
const Button = videojs.getComponent('Button');
const Component = videojs.getComponent('Component');
import HotkeyModal from './hotkeysModal';

class HotkeysModalButton extends Button {

    constructor(player, settings) {
        super(player, settings);
        this.settings = settings;
    }

    /**
     * Allow sub components to stack CSS class names
     *
     * @return {String} The constructed class name
     * @method buildCSSClass
     */
    buildCSSClass() {
        return 'vjs-hotkeys-modal-button';
    }

    /**
     * Handles click for keyboard shortcuts modal
     *
     * @method handleClick
     */
    handleClick() {
        this.hotkeysModal = this.player_.addChild('HotkeyModal', this.settings);
        this.hotkeysModal.initialize();
        this.hotkeysModal.open();
    }

}

HotkeysModalButton.prototype.controlText_ = 'i';

Component.registerComponent('HotkeysModalButton', HotkeysModalButton);
export default HotkeysModalButton;
