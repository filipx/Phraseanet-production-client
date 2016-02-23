import $ from 'jquery';
import dialog from '../../utils/dialog';

const recordPublishModal = (services, datas) => {
    const {configService, localeService, appEvents} = services;
    const url = configService.get('baseUrl');
    const publishTemplateEndPoint = 'prod/feeds/requestavailable/';

    const openModal = (datas) => {

        $.post(`${url}${publishTemplateEndPoint}`
            , datas
            , function (data) {

                return publicationModule.openModal(data);
            });

        return true;
    };

    return {openModal};
};

export default recordPublishModal;
