import $ from 'jquery';
import dialog from 'phraseanet-common/src/components/dialog';

const recordDownloadModal = (services, datas) => {
    const { configService, localeService, appEvents } = services;
    const url = configService.get('baseUrl');

    const openModal = (datas) => {
        // @TODO: use local dialog module
        let $dialog = dialog.create(services, { title: localeService.t('export') });

        $.post(`${url}prod/export/multi-export/`, datas, function (data) {
            $dialog.setContent(data);

            $('.tabs', $dialog.getDomElement()).tabs();

            $('.close_button', $dialog.getDomElement()).bind('click', function () {
                $dialog.close();
            });

            return false;
        });

        return true;
    };

    return { openModal };
};

export default recordDownloadModal;
