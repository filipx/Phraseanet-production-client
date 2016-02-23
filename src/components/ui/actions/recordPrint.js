import $ from 'jquery';
import dialog from '../../utils/dialog';

const recordPrintModal = (services, datas) => {
    const {configService, localeService, appEvents} = services;
    const url = configService.get('baseUrl');
    const printTemplateEndPoint = 'prod/printer/?';


    const openModal = (datas) => {

        const $dialog = $('#DIALOG');

        if ($dialog.data('ui-dialog')) {
            $dialog.dialog('destroy');
        }
        $dialog.attr('title', localeService.t('print'))
            .empty().addClass('loading')
            .dialog({
                resizable: false,
                closeOnEscape: true,
                modal: true,
                width: '800',
                height: '500',
                open: function (event, ui) {
                    $(this).dialog('widget').css('z-index', '1999');
                },
                close: function (event, ui) {
                    $(this).dialog('widget').css('z-index', 'auto');
                }
            })
            .dialog('open');


        $.ajax({
            type: 'POST',
            url: `${url}${printTemplateEndPoint}` + $.param(datas),
            dataType: 'html',
            beforeSend: function () {

            },
            success: function (data) {
                $dialog.removeClass('loading').empty()
                    .append(data);
                return;
            }
        });

        return true;
    };

    return {openModal};
};

export default recordPrintModal;
