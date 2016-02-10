import $ from 'jquery';

const recordPrintModal = (translations, datas) => {
    const language = translations;
    const $dialog = $('#DIALOG');

    if ($dialog.data('ui-dialog')) {
        $dialog.dialog('destroy');
    }
    $dialog.attr('title', language.print)
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
        url: '../prod/printer/?' + $.param(datas),
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

export default recordPrintModal;
