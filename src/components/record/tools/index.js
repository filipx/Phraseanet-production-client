import $ from 'jquery';
import dialog from 'phraseanet-common/src/components/dialog';
import VideoEditor from '../../videoEditor';
const recordToolsModal = (services, datas, activeTab = false) => {
    const { configService, localeService, appEvents } = services;
    const url = configService.get('baseUrl');
    const toolsTemplateEndPoint = 'prod/tools/';
    let $dialog = null;

    const openModal = (datas) => {

        $dialog = dialog.create(services, {
            size: 'Medium',
            title: localeService.t('toolbox'),
            loading: true
        });

        return $.get(`${url}${toolsTemplateEndPoint}`
            , datas
            , function (data) {
                $dialog.setContent(data);
                $dialog.setOption('contextArgs', datas);
                _onModalReady(data, window.toolsConfig, activeTab);
                return;
            }
        );
    };

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

    const _onModalReady = (template, data, activeTab) => {

        var $scope = $('#prod-tool-box');
        var tabs = $('#tool-tabs', $scope).tabs();
        if (activeTab !== false) {
            tabs.tabs('option', 'active', activeTab);
        }
        var width = 0;

        $('.iframe_submiter', $scope).bind('click', function () {
            var form = $(this).closest('form');
            form.submit();
            form.find('.load').empty().html(localeService.t('loading') + ' ...');
            $('#uploadHdsub').contents().find('.content').empty();
            $('#uploadHdsub').load(function () {
                form.find('.load').empty();
                var iframeContent = $('#uploadHdsub').contents().find('.content').html();
                form.closest('div').find('.resultAction').empty().append(iframeContent);
            });
        });

        $('.action_submiter', $scope).bind('click', function () {
            var $this = $(this);
            var form = $(this).closest('form');

            $.ajax({
                url: form.attr('action'),
                type: form.attr('method'),
                dataType: 'json',
                data: form.serializeArray(),
                beforeSend: function () {
                    $this.prop('disabled', true);
                },
                success: function (data) {
                    if (!data.success) {
                        humane.error(data.message);
                    } else {
                        dialog.get(1).close();
                    }
                },
                complete: function () {
                    $this.prop('disabled', false);
                }
            });

            return false;
        });

        $('.action_cancel', $scope).bind('click', function () {
            dialog.get(1).close();

            return false;
        });


        var ThumbEditor = new VideoEditor('thumb_video', 'thumb_canvas', {
            altCanvas: $('#alt_canvas_container .alt_canvas')
        });

        if (ThumbEditor.isSupported()) {

            var $sliderWrapper = $('#thumb_wrapper', $scope);

            $sliderWrapper.on('click', 'img', function () {
                $('.selected', $sliderWrapper).removeClass('selected');
                $(this).addClass('selected');

                var $self = this;
                var selectedScreenId = $self.getAttribute('id').split('_').pop();
                var screenshots = ThumbEditor.store.get(selectedScreenId);

                ThumbEditor.copy(screenshots.getDataURI(), screenshots.getAltScreenShots());
            });


            $scope.on('click', '#thumb_delete_button', function () {
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
                    $('#thumb_info', $scope).show();
                    ThumbEditor.resetCanva();
                }

                img.remove();
                ThumbEditor.store.remove(id);
            });

            $scope.on('click', '.close_action_frame', function () {
                $(this).closest('.action_frame').hide();
            });


            $scope.on('click', '#thumb_camera_button', function () {
                $('#thumb_info', $scope).hide();
                $('#thumb_delete_button', $scope).show();

                var screenshot = ThumbEditor.screenshot();
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
            $scope.on('click', '#thumb_validate_button', function () {
                var thumbnail = $('.selected', $sliderWrapper);
                let content = '';
                if (thumbnail.length === 0) {
                    let confirmationDialog = dialog.create({
                        size: 'Alert',
                        title: data.translations.alertTitle,
                        closeOnEscape: true
                    }, 3);

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
                    buttons[localeService.t('valider')] = function () {
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
                            url: '/prod/tools/thumb-extractor/apply/',
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
                    };

                    // show confirm box, content is loaded here /prod/tools/thumb-extractor/confirm-box/
                    var validationDialog = dialog.create({
                        size: 'Small',
                        title: data.translations.thumbnailTitle,
                        cancelButton: true,
                        buttons: buttons
                    }, 2);

                    var datas = {
                        image: $('.selected', $sliderWrapper).attr('src'),
                        sbas_id: sbas_id,
                        record_id: record_id
                    };

                    return $.ajax({
                        type: 'POST',
                        url: '/prod/tools/thumb-extractor/confirm-box/',
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

        if (data.selectionLength === 1) {
            _onUniqueSelection(data.databaseId, data.recordId, tabs);
        }
    };

    const _onUniqueSelection = (databaseId, recordId, tabs) => {

        $('#tools-sharing .stateChange_button').bind('click', function (event) {
            const $btn = $(event.currentTarget);
            let state = true;

            // inverse state
            if ($btn.data('state') === 1) {
                state = false;
            }

            // submit changes
            $.post(`tools/sharing-editor/${databaseId}/${recordId}/`, {
                name: $btn.data('name'),
                state: state
            }).done(function (data) {
                // self reload tab with current active tab:
                activeTab = tabs.tabs('option', 'active');
                openModal($dialog.getOption('contextArgs'), activeTab);
                //openToolModal($dialog.getOption('contextArgs'), activeTab);
            }).error(function (err) {
                alert('forbidden action');
            });
            return false;
        });
    };

    return {openModal};
};

export default recordToolsModal;
