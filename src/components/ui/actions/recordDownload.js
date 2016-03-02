import $ from 'jquery';
import dialog from '../../utils/dialog';

const recordDownloadModal = (services, datas) => {
    const {configService, localeService, appEvents} = services;
    const url = configService.get('baseUrl');
    const downloadTemplateEndPoint = 'prod/export/multi-export/';

    const openModal = (datas) => {
        // @TODO: use local dialog module
        let $dialog = dialogModule.dialog.create({title: localeService.t('export')});

        $.post(`${url}${downloadTemplateEndPoint}`, datas, function (data) {
            $dialog.setContent(data);

            $('.tabs', $dialog.getDomElement()).tabs();

            $('.close_button', $dialog.getDomElement()).bind('click', function () {
                $dialog.close();
            });

            return false;
        });

        return true;
    };

    return {openModal};
};

export default recordDownloadModal;
