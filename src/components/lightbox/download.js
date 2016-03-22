import $ from 'jquery';
import dialog from 'phraseanet-common/src/components/dialog';

const download = (services) => {
    const {configService, localeService, appEvents} = services;
    const url = configService.get('baseUrl');
    let $container = null;

    const initialize = (options) => {
        $container = options.$container;
        $container.on('click', '.basket_downloader', (event) => {
            event.preventDefault();
            _downloadBasket();
        })
    };
    const openModal = (datas) => {
        var $dialog = dialog.create(services, {
            size: 'Medium',
            title: localeService.t('export')
        });

        $.ajax({
            type: 'POST',
            data: 'lst=' + datas,
            url: `${url}prod/export/multi-export/`,
            success: function (data) {
                $dialog.setContent(data);
                _onDownloadReady($dialog);
            }
        });

        return true;
    }

    const _onDownloadReady = ($dialog) => {
        $('.tabs', $dialog.getDomElement()).tabs();

        $('.close_button', $dialog.getDomElement()).bind('click', function () {
            $dialog.close();
        });
    }

    function _downloadBasket() {
        var ids = $.map($('#sc_container .download_form').toArray(), function (el, i) {
            return $('input[name="basrec"]', $(el)).val();
        });
        openModal(ids.join(';'));
    }

    /*function download(value) {
        var $dialog = dialog.create({title: localeService.t('export')});

        $.post('/prod/export/multi-export/', 'lst=' + value, function (data) {

            $dialog.setContent(data);

            $('.tabs', $dialog.getDomElement()).tabs();

            $('.close_button', $dialog.getDomElement()).bind('click', function () {
                $dialog.close();
            });

            return false;
        });
    }*/

    return {initialize, openModal}
}

export default download;
