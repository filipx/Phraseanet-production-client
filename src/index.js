import * as utils from './components/utils/utils.js';
import VideoEditor from './components/videoEditor';
import bootstrap from './bootstrap.js';

let ProductionApplication = {
    bootstrap, utils, VideoEditor
};

if (typeof window !== 'undefined') {
    window.ProductionApplication = ProductionApplication;
}

module.exports = ProductionApplication;
