import $ from 'jquery';
import dialog from '../../utils/dialog';
import pushRecord from '../recordPush';

const recordPushModal = (services, datas) => {
    const { configService, localeService, appEvents } = services;
    const url = configService.get('baseUrl');
    const pushTemplateEndPoint = 'prod/push/sendform/';


    const openModal = (datas) => {

        let $dialog = dialog.create(services, {
            size: 'Full',
            title: language.push,
            localeService: localeService
        });

        $.post(`${url}${pushTemplateEndPoint}`, datas, function (data) {
            // $dialog.setContent(data.template);
            $dialog.setContent(data);
            /*$(document).ready(function() {
                p4.Feedback = new Feedback($('#PushBox'), data.context);
                p4.ListManager = new ListManager($('#ListManager'));

            });*/
            _onDialogReady();
                return;
        });

        return true;
    };

    const _onDialogReady = () => {
        pushRecord(services).initialize({
            feedback: {
                containerId: '#PushBox',
                context: 'Push'//'{{ context }}'
            },
            listManager: {
                containerId: '#ListManager',
            }
        }); // initialization is remote controled
    };


    return { openModal };
};

export default recordPushModal;
