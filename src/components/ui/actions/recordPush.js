import $ from 'jquery';
import dialog from 'phraseanet-common/src/components/dialog';
import pushRecord from '../recordPush';

const recordPushModal = (services, datas) => {
    const { configService, localeService, appEvents } = services;
    const url = configService.get('baseUrl');


    const openModal = (datas) => {

        let $dialog = dialog.create(services, {
            size: 'Full',
            title: localeService.t('push')
        });

        $.post(`${url}prod/push/sendform/`, datas, function (data) {
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
                context: 'Push'
            },
            listManager: {
                containerId: '#ListManager'
            }
        });
    };


    return { openModal };
};

export default recordPushModal;
