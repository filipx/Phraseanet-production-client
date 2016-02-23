import $ from 'jquery';
import dialog from '../../utils/dialog';

const recordPushModal = (services, datas) => {
    const {configService, localeService, appEvents} = services;
    const url = configService.get('baseUrl');
    const pushTemplateEndPoint = 'prod/push/sendform/';


    const openModal = (datas) => {

        let $dialog = p4.Dialog.Create({
            size: 'Full',
            title: language.push
        });

        $.post(`${url}${pushTemplateEndPoint}`, datas, function (data) {
            // $dialog.setContent(data.template);
            $dialog.setContent(data);
            /*$(document).ready(function() {
                p4.Feedback = new Feedback($('#PushBox'), data.context);
                p4.ListManager = new ListManager($('#ListManager'));

            });*/
                return;
        });

        return true;
    };


    return {openModal};
};

export default recordPushModal;
