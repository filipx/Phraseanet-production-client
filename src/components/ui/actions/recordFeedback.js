import $ from 'jquery';
import dialog from 'phraseanet-common/src/components/dialog';
import pushRecord from '../recordPush';

const recordFeedbackModal = (services, datas) => {
    const { configService, localeService, appEvents } = services;
    const url = configService.get('baseUrl');


    const openModal = (datas) => {
        /* disable push closeonescape as an over dialog may exist (add user) */
        let $dialog = dialog.create(services, {
            size: 'Full',
            title: localeService.t('feedback')
        });

        $.post(`${url}prod/push/validateform/`, datas, function (data) {
            // data content's javascript can't be fully refactored
            $dialog.setContent(data);
            _onDialogReady();
            return;
        });

        return true;
    };

    const _onDialogReady = () => {
        pushRecord(services).initialize({
            feedback: {
                containerId: '#PushBox',
                context: 'Feedback'
            },
            listManager: {
                containerId: '#ListManager'
            }
        });
    };

    return { openModal };
};

export default recordFeedbackModal;
