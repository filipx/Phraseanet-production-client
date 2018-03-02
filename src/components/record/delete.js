import $ from 'jquery';
import dialog from 'phraseanet-common/src/components/dialog';

const deleteRecord = (services) => {
    const { configService, localeService, appEvents } = services;
    const url = configService.get('baseUrl');
    let workzoneSelection = [];
    let searchSelection = [];

    const openModal = (datas) => {
        var $dialog = dialog.create(services, {
            size: '287x153',
            title: localeService.t('warning')
        });

        $.ajax({
            type: 'POST',
            url: `${url}prod/records/delete/what/`,
            dataType: 'html',
            data: datas,
            success: function (data) {
                var response = JSON.parse(data);
                $dialog.setOption('height', 'auto');

                $dialog.setContent(response.renderView);

                //reset top position of dialog
                $dialog.getDomElement().offsetParent().css('top', ($(window).height() - $dialog.getDomElement()[0].clientHeight)/2);
                _onDialogReady();
            }
        });

        return true;
    };
    const _onDialogReady = () => {
        var $dialog = dialog.get(1);
        var $dialogBox = $dialog.getDomElement();
        var $closeButton = $('button.ui-dialog-titlebar-close', $dialogBox.parent());
        var $cancelButton = $('button.cancel', $dialogBox);
        var titleBox = $(".ui-dialog-title", $dialogBox.parent());
        titleBox.prepend('<i class="fa fa-exclamation-triangle" style="margin-right: 10px"></i>');

        $cancelButton.bind('click', function () {
            $dialog.close();
        });

        $('button.submiter', $dialogBox).bind('click', function () {
            var $this = $(this);
            var form = $(this).closest('form');
            var loader = form.find('form-action-loader');

            $.ajax({
                type: form.attr('method'),
                url: form.attr('action'),
                data: form.serializeArray(),
                dataType: 'json',
                beforeSend: function () {
                    $this.prop('disabled', true);
                    $closeButton.prop('disabled', true);
                    $cancelButton.prop('disabled', true);
                    $dialog.setOption('closeOnEscape', false);
                    loader.show();
                },
                success: function (data) {
                    $dialog.close();
                    $.each(data, function (i, n) {
                        let imgt = $('#IMGT_' + n);
                        let chim = $('.CHIM_' + n);
                        let stories = $('.STORY_' + n);
                        $('.doc_infos', imgt).remove();
                        // @TODO clean up
                        imgt.unbind('click').removeAttr('ondblclick').removeClass('selected').draggable('destroy').removeClass('IMGT').find('img').unbind();
                        imgt.find('.thumb img').attr('src', '/assets/common/images/icons/deleted.png').css({
                            width: '100%',
                            height: 'auto',
                            margin: '0 10px',
                            top: '0'
                        });
                        chim.parent().slideUp().remove();
                        imgt.find('.status,.title,.bottom').empty();

                        appEvents.emit('search.selection.remove', {records: n});

                        if (stories.length > 0) {
                            appEvents.emit('workzone.refresh');
                        } else {
                            appEvents.emit('workzone.selection.remove', {records: n});
                        }
                    });
                    appEvents.emit('search.doRefreshSelection');
                },
                complete: function () {
                    $this.prop('disabled', false);
                    $closeButton.prop('disabled', false);
                    $cancelButton.prop('disabled', false);
                    $dialog.setOption('closeOnEscape', true);
                    loader.hide();
                }
            });
        });
    };

    return {openModal};
};

export default deleteRecord;
