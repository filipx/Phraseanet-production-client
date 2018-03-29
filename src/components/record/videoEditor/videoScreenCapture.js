import $ from 'jquery';
import dialog from 'phraseanet-common/src/components/dialog';
import ScreenCapture from '../../videoEditor/screenCapture';

const videoScreenCapture = (services, datas, activeTab = false) => {
    const {configService, localeService, appEvents} = services;
    const url = configService.get('baseUrl');
    const initialize = (params) => {
        let {$container, data} = params;
        var ThumbEditor = new ScreenCapture('thumb_video', 'thumb_canvas', {
            altCanvas: $('#alt_canvas_container .alt_canvas')
        });

        if (ThumbEditor.isSupported()) {

            var $sliderWrapper = $('#thumb_wrapper', $container);

            $sliderWrapper.on('click', 'img', function () {
                $('.selected', $sliderWrapper).removeClass('selected');
                $(this).addClass('selected');

                var $self = this;
                var selectedScreenId = $self.getAttribute('id').split('_').pop();
                var screenshots = ThumbEditor.store.get(selectedScreenId);

                ThumbEditor.copy(screenshots.getDataURI(), screenshots.getAltScreenShots());
            });


            $container.on('click', '#thumb_delete_button', function () {
                var img = $sliderWrapper.find('.selected');
                var id = img.attr('id').split('_').pop();
                var previous = img.prev();
                var next = img.next();

                if (previous.length > 0) {
                    previous.trigger('click');
                } else if (next.length > 0) {
                    next.trigger('click');
                } else {
                    $(this).hide();
                    $('#thumb_download_button', $container).hide();
                    //$('#thumb_info', $container).show();
                    ThumbEditor.resetCanva();
                }

                img.remove();
                ThumbEditor.store.remove(id);
            });

            $container.on('click', '.close_action_frame', function () {
                $(this).closest('.action_frame').hide();
            });


            $container.on('click', '#thumb_camera_button', function () {
                //$('#thumb_info', $container).hide();
                $('#thumb_delete_button', $container).show();
                $('#thumb_download_button', $container).show();

                var screenshot = ThumbEditor.screenshot();

                $container.find('.frame_canva').css('width', $container.find('#thumb_canvas').width());

                var img = $('<img />');
                $('.selected', $sliderWrapper).removeClass('selected');
                img.addClass('selected')
                    .attr('id', 'working_' + screenshot.getId())
                    .attr('src', screenshot.getDataURI())
                    .attr('alt', screenshot.getVideoTime())
                    .appendTo($sliderWrapper);
            });

            $('#thumb_canvas').on('tool_event', function () {
                var thumbnail = $('.selected', $sliderWrapper);

                if (thumbnail.length === 0) {
                    console.error('No image selected');

                    return;
                }

                thumbnail.attr('src', ThumbEditor.getCanvaImage());

            });
            $container.on('click', '#thumb_validate_button', function () {
                var thumbnail = $('.selected', $sliderWrapper);
                let content = '';
                if (thumbnail.length === 0) {
                    let confirmationDialog = dialog.create(services, {
                        size: 'Custom',
                        customWidth: 360,
                        customHeight: 160,
                        title: data.translations.alertTitle,
                        closeOnEscape: true
                    }, 3);

                    confirmationDialog.getDomElement().closest('.ui-dialog').addClass('screenCapture_validate_dialog')

                    content = $('<div />').css({
                        'text-align': 'center',
                        width: '100%',
                        'font-size': '14px'
                    }).append(data.translations.noImgSelected);
                    confirmationDialog.setContent(content);

                    return false;
                } else {

                    var buttons = {};

                    var record_id = $('input[name=record_id]').val();
                    var sbas_id = $('input[name=sbas_id]').val();

                    var selectedScreenId = thumbnail.attr('id').split('_').pop();
                    var screenshots = ThumbEditor.store.get(selectedScreenId);


                    let screenData = screenshots.getAltScreenShots();
                    let subDefs = [];

                    for (let i = 0; i < screenData.length; i++) {
                        subDefs.push({
                            name: screenData[i].name,
                            src: screenData[i].dataURI

                        });
                    }

                    buttons = [
                        {
                            text: localeService.t('cancel'),
                            click: function(){
                                $(this).dialog('close');
                            }
                        },
                        {
                            text: localeService.t('valider'),
                            click: function () {
                                let confirmDialog = dialog.get(2);
                                var buttonPanel = confirmDialog.getDomElement().closest('.ui-dialog').find('.ui-dialog-buttonpane');
                                var loadingDiv = buttonPanel.find('.info-div');

                                if (loadingDiv.length === 0) {
                                    loadingDiv = $('<div />').css({
                                        width: '120px',
                                        height: '40px',
                                        float: 'left',
                                        'line-height': '40px',
                                        'padding-left': '40px',
                                        'text-align': 'left',
                                        'background-position': 'left center'
                                    }).attr('class', 'info-div').prependTo(buttonPanel);
                                }

                                $.ajax({
                                    type: 'POST',
                                    url: `${url}prod/tools/thumb-extractor/apply/`,
                                    data: {
                                        sub_def: subDefs,
                                        record_id: record_id,
                                        sbas_id: sbas_id
                                    },
                                    beforeSend: function () {
                                        disableConfirmButton(confirmDialog);
                                        loadingDiv.empty().addClass('loading').append(data.translations.processing);
                                    },
                                    success: function (data) {
                                        loadingDiv.empty().removeClass('loading');

                                        if (data.success) {
                                            confirmDialog.close();
                                            dialog.get(1).close();
                                        } else {
                                            loadingDiv.append(content);
                                            enableConfirmButton(confirmDialog);
                                        }
                                    }
                                });
                            },
                        }
                    ];

                    // show confirm box, content is loaded here /prod/tools/thumb-extractor/confirm-box/
                    var validationDialog = dialog.create(services, {
                        size: 'Custom',
                        customWidth: 360,
                        customHeight: 285,
                        title: data.translations.thumbnailTitle,
                        cancelButton: true,
                        buttons: buttons
                    }, 2);

                    validationDialog.getDomElement().closest('.ui-dialog').addClass('screenCapture_validate_dialog')

                    var datas = {
                        image: $('.selected', $sliderWrapper).attr('src'),
                        sbas_id: sbas_id,
                        record_id: record_id
                    };

                    return $.ajax({
                        type: 'POST',
                        url: `${url}prod/tools/thumb-extractor/confirm-box/`,
                        data: datas,
                        success: function (data) {

                            if (data.error) {
                                content = $('<div />').css({
                                    'font-size': '16px',
                                    'text-align': 'center'
                                }).append(data.datas);
                                validationDialog.setContent(content);
                                disableConfirmButton(validationDialog);
                            } else {
                                validationDialog.setContent(data.datas);
                            }
                        }
                    });
                }
            });
        } else {
            // not supported
            $('#thumbExtractor').empty().append(localeService.t('browserFeatureSupport'));
        }
    }

    const disableConfirmButton = (dialog) => {
        dialog.getDomElement().closest('.ui-dialog').find('.ui-dialog-buttonpane button').filter(function () {
            return $(this).text() === localeService.t('valider');
        }).addClass('ui-state-disabled').attr('disabled', true);
    }


    const enableConfirmButton = (dialog) => {
        dialog.getDomElement().closest('.ui-dialog').find('.ui-dialog-buttonpane button').filter(function () {
            return $(this).text() === localeService.t('valider');
        }).removeClass('ui-state-disabled').attr('disabled', false);
    }

    return {
        initialize
    }
}

export default videoScreenCapture;
