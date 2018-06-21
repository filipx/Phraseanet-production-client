import $ from 'jquery';
import Feedback from './feedback';
import ListManager from './../../list/listManager';
import dialog from '../../../../node_modules/phraseanet-common/src/components/dialog';
const pushRecord = (services) => {
    const {configService, localeService, appEvents} = services;
    let feedbackInstance = null;
    let listManagerInstance = null;

    const initialize = (options) => {
        let {feedback, listManager} = options;
        if ($('#PushBox').length > 0) {
            feedbackInstance = new Feedback(services, feedback);
            listManagerInstance = new ListManager(services, listManager);
        } else {
            $('.close-dialog-action').on('click', () => dialog.close('1'))
        }
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

    function removeList(list_id) {
        var makeDialog = function (box) {

            var buttons = {};

            buttons[localeService.t('valider')] = function () {

                var callbackOK = function () {
                    $('.list-container ul.list').children().each(function() {
                        if($(this).data('list-id') == list_id.list_id) {
                            $(this).remove();
                        }
                    });
                    dialog.get(2).close();
                };

                listManagerInstance.removeList(list_id.list_id, callbackOK);
            };

            var options = {
                cancelButton: true,
                buttons: buttons,
                size: 'Alert'
            };

            dialog.create(services, options, 2).setContent(box);
        };

        var html = _.template($('#list_editor_dialog_delete_tpl').html());

        makeDialog(html);
    }

    appEvents.listenAll({
        // 'push.doInitialize': initialize,
        'push.addUser': Feedback.addUser,
        'push.setActiveList': setActiveList,
        'push.createList': createList,
        'push.reload': reloadBridge,
        'push.removeList': removeList
    });

    return {
        initialize,
        // Feedback: Feedback,
        // ListManager: ListManager,
        reloadBridge: reloadBridge
    };

};

export default pushRecord;
