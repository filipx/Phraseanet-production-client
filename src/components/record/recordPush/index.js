import $ from 'jquery';
import Feedback from './feedback';
import ListManager from './../../list/listManager';
import dialog from '../../../../node_modules/phraseanet-common/src/components/dialog';
const pushRecord = (services) => {
    const { configService, localeService, appEvents } = services;
    let feedbackInstance = null;
    let listManagerInstance = null;

    const initialize = (options) => {
        let { feedback, listManager } = options;

        feedbackInstance = new Feedback(services, feedback);
        listManagerInstance = new ListManager(services, listManager);
    };

    function reloadBridge(url) {
        var options = $('#dialog_publicator form[name="current_datas"]').serializeArray();
        var dialog = dialog.get(1);
        dialog.load(url, 'POST', options);
    }

    function createList(listOptions) {
        listManagerInstance.createList(listOptions);
    }

    function setActiveList() {

    }

    appEvents.listenAll({
        // 'push.doInitialize': initialize,
        'push.addUser': Feedback.addUser,
        'push.setActiveList': setActiveList,
        'push.createList': createList,
        'push.reload': reloadBridge
    });

    return {
        initialize,
        // Feedback: Feedback,
        // ListManager: ListManager,
        reloadBridge: reloadBridge
    };

};

export default pushRecord;
