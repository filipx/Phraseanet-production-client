import $ from 'jquery';
import dialog from 'phraseanet-common/src/components/dialog';
import videoScreenCapture from './videoScreenCapture';
import videoRangeCapture from './videoRangeCapture';
import sharingManager from './sharingManager';
import * as Rx from 'rx';

const humane = require('humane-js');

const recordToolsModal = (services, datas, activeTab = false) => {
    const {configService, localeService, appEvents} = services;
    const url = configService.get('baseUrl');
    let $dialog = null;
    let toolsStream = new Rx.Subject();

    toolsStream.subscribe((params) => {
        switch (params.action) {
            case 'refresh':

                console.log('trigger openModal')
                openModal.apply(null, params.options);

                break;

            default:
        }
    })
    const openModal = (datas, activeTab) => {
        console.log('activeTab', activeTab)
        $dialog = dialog.create(services, {
            size: 'Medium',
            title: localeService.t('toolbox'),
            loading: true
        });

        return $.get(`${url}prod/tools/`
            , datas
            , function (data) {
                $dialog.setContent(data);
                $dialog.setOption('contextArgs', datas);
                _onModalReady(data, window.toolsConfig, activeTab);
                return;
            }
        );
    };


    const _onModalReady = (template, data, activeTab) => {

        var $scope = $('#prod-tool-box');
        var tabs = $('#tool-tabs', $scope).tabs();
        if (activeTab !== false) {
            tabs.tabs('option', 'active', activeTab);
        }

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


        // available if only 1 record is selected:
        if (data.selectionLength === 1) {
            sharingManager({configService, localeService, toolsStream}).initialize({
                $container: $dialog, data, tabs,
                dialogParams: $dialog.getOption('contextArgs')
            });
            videoScreenCapture(services).initialize({$container: $scope, data});
            videoRangeCapture(services).initialize({$container: $('.video-range-editor-container'), data});
        }
    };

    return {openModal};
};

export default recordToolsModal;
