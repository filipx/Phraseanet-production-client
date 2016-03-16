import $ from 'jquery';
import * as _ from 'underscore';
import dialog from 'phraseanet-common/src/components/dialog';
import Alerts from '../utils/alert';
require('phraseanet-common/src/components/tooltip');

const uploader = (services) => {
    const { configService, localeService, appEvents } = services;
    let UploaderManager;
    const initialize = () => {
        $('body').on('click', '.uploader-open-action', (event) => {
            event.preventDefault();
            var $this = $(event.currentTarget);

            require.ensure([], () => {
                // load uploader manager dep
                UploaderManager = require('./uploaderService').default;
                openModal($this);
            });
        });
    };

    const openModal = ($this) => {
        var options = {
            size: 'Full',
            loading: true,
            title: $this.attr('title'),
            closeOnEscape: true
        };

        let $dialog = dialog.create(services, options);
        $.ajax({
            type: 'GET',
            url: $this.attr('href'),
            dataType: 'html',
            success: function (data) {
                $dialog.setContent(data);
                $(document).ready(() => onOpenModal());
                return;
            }
        });
    };
    const onOpenModal = () => {

        // @TODO replace with feature detection:
        var iev = 0;
        var ieold = (/MSIE (\d+\.\d+);/.test(navigator.userAgent));
        var trident = !!navigator.userAgent.match(/Trident\/7.0/);
        var rv = navigator.userAgent.indexOf('rv:11.0');

        if (ieold) iev = new Number(RegExp.$1);
        if (navigator.appVersion.indexOf('MSIE 10') !== -1) iev = 10;
        if (trident && rv !== -1) iev = 11;

        if (iev >= 10) {
            $('#UPLOAD_FLASH_LINK').hide();
        }
        // Upload management
        var uploaderInstance = new UploaderManager({
            container: $('#uploadBox'),
            uploadBox: $('#uploadBox .upload-box-addedfiles'),
            settingsBox: $('#uploadBox .settings-box'),
            downloadBox: $('#uploadBox .download-box')
        });

        var totalElement;
        var maxFileSize = window.uploaderOptions.maxFileSize;

        uploaderInstance.Preview.setOptions({
            maxWidth: 130,
            maxHeight: 120
        });

        // Init jquery tabs
        $('.upload-tabs', uploaderInstance.getContainer()).tabs({
            beforeLoad: function (event, ui) {
                ui.jqXHR.success(function (xhr, status, index, anchor) {
                    var lazaretBox = $('#lazaretBox');

                    $('.userTips', lazaretBox).tooltip();
                });
                ui.jqXHR.error(function (xhr, status, index, anchor) {
                    // display error message if ajax failed
                    $(anchor.hash).html(language.error);
                });

                ui.tab.find('span').html(' <img src="/assets/common/images/icons/loader404040.gif"/>');
            },
            load: function (event, ui) {
                ui.tab.find('span').empty();
                $('.btn.page-lazaret', uploaderInstance.getContainer()).bind('click', function () {
                    $('.lazaret-target').attr('href', $('a', $(this)).attr('href'));
                    $('.upload-tabs', uploaderInstance.getContainer()).tabs('load', 1);
                    $('#lazaretBox').empty();

                    return false;
                });
            },
            create: function () {
                $('#tab-upload').css('overflow', 'hidden');
            },
            heightStyle: 'fill'
        });

        // Show the good collection status box
        $('select[name="base_id"]', uploaderInstance.getSettingsBox()).bind('change', function () {
            var selectedCollId = $(this).find('option:selected').val();

            $('#uploadBox .settings-box .collection-status').hide();

            $('#uploadBox #status-' + selectedCollId).show();
        });

        uploaderInstance.getContainer().on('file-added', function () {
            $('.number-files').html(uploaderInstance.countData());
        });

        uploaderInstance.getContainer().on('file-removed', function () {
            $('.number-files').html(uploaderInstance.countData());
        });

        uploaderInstance.getContainer().on('file-transmited', function () {
            var domEl = $('.number-files-transmited');
            domEl.html(parseInt(domEl.html(), 10) + 1);
        });

        uploaderInstance.getContainer().on('uploaded-file-removed', function () {
            var domEl = $('.number-files-to-transmit');
            domEl.html(parseInt(domEl.html(), 10) - 1);
        });

        // Remove all element from upload box
        $('button.clear-queue', uploaderInstance.getContainer()).bind('click', function () {
            uploaderInstance.clearUploadBox();
            $('ul', $(this).closest('.upload-box')).empty();
            uploaderInstance.getContainer().trigger('file-removed');
        });

        // Cancel all upload
        $('#cancel-all').bind('click', function () {
            //Remove all cancel
            $('button.remove-element', uploaderInstance.getDownloadBox()).each(function (i, el) {
                $(el).trigger('click');
            });

            progressbarAll.width('0%');
        });

        // Remove an element from the upload box
        $(uploaderInstance.getUploadBox()).on('click', 'button.remove-element', function () {
            var container = $(this).closest('li');
            var uploadIndex = container.find('input[name=uploadIndex]').val();
            uploaderInstance.removeData(uploadIndex);
            container.remove();
            uploaderInstance.getContainer().trigger('file-removed');
        });

        // Get all elements in the upload box & trigger the submit event
        $('button.upload-submitter', uploaderInstance.getContainer()).bind('click', function () {
            // Fetch all valid elements
            var documents = uploaderInstance.getUploadBox().find('li.upload-valid');

            totalElement = documents.length;

            if (totalElement > 0) {
                $('.number-files').html('');
                $('.number-files-to-transmit').html(totalElement);
                $('.transmit-box').show();

                var $dialog = dialog.get(1);

                // reset progressbar for iframe uploads
                if (!$.support.xhrFileUpload && !$.support.xhrFormDataFileUpload) {
                    progressbarAll.width('0%');
                }
                // enabled cancel all button
                $('#cancel-all').attr('disabled', false);

                // prevent dialog box from being closed while files are being downloaded
                $dialog.getDomElement().bind('dialogbeforeclose', function (event, ui) {
                    if (!uploaderInstance.Queue.isEmpty()) {
                        Alerts(language.warning, language.fileBeingDownloaded);
                        return false;
                    }
                });

                documents.each(function (index, el) {
                    let indexValue = $(el).find('input[name=uploadIndex]').val();
                    uploaderInstance.getData(indexValue).submit();
                });
            }
        });

        $('#fileupload', uploaderInstance.getContainer()).fileupload({
            namespace: 'phrasea-upload',
            // define our own mediatype to handle and convert the response
            // to prevent errors when Iframe based uploads
            // as they require text/plain or text/html Content-type
            // see http://api.jquery.com/extending-ajax/#Converters
            dataType: 'phrjson',
            converters: {
                'html phrjson': function (htmlEncodedJson) {
                    return $.parseJSON(htmlEncodedJson);
                },
                'iframe phrjson': function (iframe) {
                    return $.parseJSON(iframe.find('body').text());
                }
            },
            // override "on error" local ajax event to prevent global ajax event from being triggered
            // as all fileupload options are passed as argument to the $.ajax jquery function
            error: function () {
                return false;
            },
            // Set singleFileUploads, sequentialUploads to true so the files
            // are upload one by one
            singleFileUploads: true,
            sequentialUploads: true,
            recalculateProgress: true,
            // When a file is added
            add: function (e, data) {
                // Since singleFileUploads &  sequentialUploads are setted to true
                // There is only on file data.files
                $.each(data.files, function (index, file) {
                    $('.upload-box').show();
                    let params = {};
                    let html = '';
                    if (file.error) {
                        params = $.extend({}, file, {error: language.errorFileApi, language: language});
                        html = _.template($('#upload_items_error_tpl').html())(params);
                        uploaderInstance.getUploadBox().append(html);
                    } else if (file.size > maxFileSize) {
                        params = $.extend({}, file, {error: language.errorFileApiTooBig, language: language});
                        html = _.template($('#upload_items_error_tpl').html())(params);
                        uploaderInstance.getUploadBox().append(html);
                    } else {
                        // Add data to Queue
                        uploaderInstance.addData(data);

                        // Check support of file.size && file.type property
                        var formatedFile = {
                            id: 'file-' + index,
                            size: typeof file.size !== 'undefined' ? uploaderInstance.Formater.size(file.size) : '',
                            name: file.name,
                            type: typeof file.type !== 'undefined' ? file.type : '',
                            uploadIndex: uploaderInstance.getUploadIndex(),
                            language: language
                        };

                        // Set context in upload-box
                        html = _.template($('#upload_items_tpl').html())(formatedFile);
                        uploaderInstance.getUploadBox().append(html);

                        var context = $('li', uploaderInstance.getUploadBox()).last();

                        var uploadIndex = context.find('input[name=uploadIndex]').val();

                        uploaderInstance.addAttributeToData(uploadIndex, 'context', context);

                        uploaderInstance.Preview.render(file, function (img) {
                            context.find('.thumbnail .canva-wrapper').prepend(img);
                            uploaderInstance.addAttributeToData(uploadIndex, 'image', img);
                            uploaderInstance.addAttributeToData(uploadIndex, 'b64_image', img.toDataURL('image/png') || '');
                        });
                    }
                });

                uploaderInstance.getContainer().trigger('file-added');
            },
            // on success upload
            done: function (e, data) {
                // set progress bar to 100% for preventing mozilla bug which never reach 100%
                data.context.find('.progress-bar').width('100%');
                data.context.find('div.progress').removeClass('progress-striped active');
                data.context.find('button.remove-element').removeClass('btn-inverse').addClass('disabled');

                uploaderInstance.removeData(data.uploadIndex);
                uploaderInstance.getContainer().trigger('file-transmited');

                data.context.find('button.remove-element').remove();

                if (!$.support.xhrFileUpload && !$.support.xhrFormDataFileUpload) {
                    progressbarAll.width(100 - Math.round((uploaderInstance.Queue.getLength() * (100 / totalElement))) + '%');
                }

                if (uploaderInstance.Queue.isEmpty()) {
                    progressbarAll.width('100%');
                    bitrateBox.empty();
                    $('#uploadBoxRight .progress').removeClass('progress-striped active');
                    var $dialog = dialog.get(1);
                    // unbind check before close event & disabled button for cancel all download
                    $dialog.getDomElement().unbind('dialogbeforeclose');
                    // disabled cancel-all button, if queue is empty and last upload success
                    $('#cancel-all').attr('disabled', true);
                }

                return false;
            },
            fail: function () {
                // disabled cancel-all button, if queue is empty and last upload fail
                if (uploaderInstance.Queue.isEmpty()) {
                    $('#cancel-all').attr('disabled', true);
                }
            }
        });

        // on submit file
        $('#fileupload', uploaderInstance.getContainer()).bind('fileuploadsubmit', function (e, data) {
            var $this = $(this);
            var params = [];
            data.formData = [];

            // get form datas attached to the file
            params.push(data.context.find('input, select').serializeArray());
            params.push($('input', $('.collection-status:visible', uploaderInstance.getSettingsBox())).serializeArray());
            params.push($('select', uploaderInstance.getSettingsBox()).serializeArray());

            $.each(params, function (i, p) {
                $.each(p, function (i, f) {
                    data.formData.push(f);
                });
            });

            // remove current context
            data.context.remove();

            // Set new context in download-box
            $.each(data.files, function (index, file) {
                let params = $.extend({}, file, {language: language, id: 'file-' + index});
                let html = _.template($('#download_items_tpl').html())(params);

                uploaderInstance.getDownloadBox().append(html);

                data.context = $('li', uploaderInstance.getDownloadBox()).last();

                // copy image
                data.context.find('.upload-record .canva-wrapper').prepend(data.image);

                // launch ajax request
                var jqXHR = $this.fileupload('send', data)
                    .success(function (response) {
                        if (response.success) {
                            // case record
                            if (response.element === 'record') {
                                html = _.template($('#download_finish_tpl').html())({
                                    heading: response.message,
                                    reasons: response.reasons
                                });
                                data.context.find('.upload-record p.success').append(html).show();
                            } else {
                                // case quarantine
                                html = _.template($('#download_finish_tpl').html())({
                                    heading: response.message,
                                    reasons: response.reasons
                                });
                                data.context.find('.upload-record p.error').append(html).show();
                            }
                        } else {
                            // fail
                            html = _.template($('#download_finish_tpl').html())({
                                heading: response.message,
                                reasons: response.reasons
                            });
                            data.context.find('.upload-record p.error').append(html).show();
                        }
                    })
                    .error(function (jqXHR, textStatus, errorThrown) {
                        // Request is aborted
                        if (errorThrown === 'abort') {
                            return false;
                        } else {
                            data.context.find('.upload-record p.error').append(jqXHR.status + ' ' + jqXHR.statusText).show();
                        }
                        // Remove data
                        uploaderInstance.removeData(data.uploadIndex);
                        // Remove cancel button
                        $('button.remove-element', data.context).remove();
                    });

                // cancel request
                $('button.remove-element', data.context).bind('click', function (e) {
                    jqXHR.abort();
                    data.context.remove();

                    uploaderInstance.getContainer().trigger('uploaded-file-removed');
                });
            });

            return false;
        });

        var bitrateBox = $('#uploadBoxRight .bitrate-box');

        // Get one file upload progress & bitrate
        $('#fileupload', uploaderInstance.getContainer()).bind('fileuploadprogress', function (e, data) {
            var progressbar = data.context.find('.progress-bar');
            progressbar.width(Math.round(uploaderInstance.Formater.pourcent(data.loaded, data.total)) + '%');
            bitrateBox.empty().append(uploaderInstance.Formater.bitrate(data.bitrate));
        });

        var progressbarAll = $('#uploadBoxRight .progress-bar-total');

        // Get global upload progress
        $('#fileupload', uploaderInstance.getContainer()).bind('fileuploadprogressall', function (e, data) {
            progressbarAll.width(Math.round(uploaderInstance.Formater.pourcent(data.loaded, data.total)) + '%');
        });

        $('#fileupload', uploaderInstance.getContainer()).bind('fileuploadfail', function (e, data) {
            // Remove from queue
            uploaderInstance.removeData(data.uploadIndex);
        });

        $('#fileupload', uploaderInstance.getContainer()).bind('fileuploadsend', function (e, data) {

            // IFRAME progress fix
            if (!$.support.xhrFileUpload && !$.support.xhrFormDataFileUpload) {
                data.context.find('.progress-bar').width('25%');
            }
        });
    };

    return {initialize};
};
export default uploader;
