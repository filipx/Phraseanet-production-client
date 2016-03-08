const printRecord = (services) => {
    const {configService, localeService, appEvents} = services;
    let $container = null;
    const initialize = () => {
        $container = $('body');
        $container.on('click', '.print-record-action', function (event) {
            event.preventDefault();
            let $el = $(event.currentTarget);
            let key = '';
            let kind= $el.data('kind');
            let idContent = $el.data('id');

            switch(kind) {
                case 'basket':
                    key = 'ssel';
                    break;
                case 'record':
                    key = 'lst';
                    break;
            }

            doPrint(`${key}=${idContent}`);
        });
    }

    function doPrint(value) {
        if ($("#DIALOG").data("ui-dialog")) {
            $("#DIALOG").dialog('destroy');
        }
        $('#DIALOG').attr('title', language.print)
            .empty().addClass('loading')
            .dialog({
                resizable: false,
                closeOnEscape: true,
                modal: true,
                width: '800',
                height: '500',
                open: function (event, ui) {
                    $(this).dialog("widget").css("z-index", "1999");
                },
                close: function (event, ui) {
                    $(this).dialog("widget").css("z-index", "auto");
                }
            })
            .dialog('open');

        $.ajax({
            type: "POST",
            url: '../prod/printer/?' + value,
            dataType: 'html',
            beforeSend: function () {

            },
            success: function (data) {
                $('#DIALOG').removeClass('loading').empty()
                    .append(data);
                return;
            }
        });
    }

    return {initialize};
};

export default printRecord;