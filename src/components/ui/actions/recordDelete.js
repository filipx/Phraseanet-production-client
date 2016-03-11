import $ from 'jquery';
import dialog from '../../utils/dialog';

const recordDeleteModal = (services) => {
    const { configService, localeService, appEvents } = services;
    const url = configService.get('baseUrl');
    const deleteTemplateEndPoint = 'prod/records/delete/what/';


    const openModal = (datas) => {
        // @REFACTORING - should use local dialog
        var $dialog = dialog.create(services, {
            size: 'Small',
            title: localeService.t('deleteRecords')
        });

        $.ajax({
            type: 'POST',
            url: `${url}${deleteTemplateEndPoint}`,
            dataType: 'html',
            data: datas,
            success: function (data) {
                $dialog.setContent(data);
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
                        var imgt = $('#IMGT_' + n),
                            chim = $('.CHIM_' + n),
                            stories = $('.STORY_' + n);
                        $('.doc_infos', imgt).remove();
                        imgt.unbind('click').removeAttr('ondblclick').removeClass('selected').draggable('destroy').removeClass('IMGT').find('img').unbind();
                        imgt.find('.thumb img').attr('src', '/assets/common/images/icons/deleted.png').css({
                            width:'100%',
                            height:'auto',
                            margin: '0 10px',
                            top: '0'
                        });
                        chim.parent().slideUp().remove();
                        imgt.find('.status,.title,.bottom').empty();

                        p4.Results.Selection.remove(n);
                        if (stories.length > 0)
                        {
                            appEvents.emit('workzone.refresh');
                        }
                        else {
                            p4.WorkZone.Selection.remove(n);
                        }
                    });
                    prodApp.appEvents.emit('search.doRefreshSelection');
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

    return { openModal };
};

export default recordDeleteModal;
