import $ from 'jquery';
import dialog from '../../utils/dialog';

const recordFeedbackModal = (services, datas) => {
    const { configService, localeService, appEvents } = services;
    const url = configService.get('baseUrl');
    const feedbackTemplateEndPoint = 'prod/push/validateform/';


    const openModal = (datas) => {
        /* disable push closeonescape as an over dialog may exist (add user) */
        let $dialog = dialog.create(services, {
            size: 'Full',
            title: localeService.t('feedback')
        });

        $.post(`${url}${feedbackTemplateEndPoint}`, datas, function (data) {
            // data content's javascript can't be fully refactored
            $dialog.setContent(data);
            return;
        });

        return true;
    };

    return { openModal };
};

export default recordFeedbackModal;
