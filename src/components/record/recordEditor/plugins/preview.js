import $ from 'jquery';
import pym from 'pym.js';
import videoEditor from './videoEditor';
//require('jquery-ui');

const preview = services => {
    const { configService, localeService, recordEditorEvents } = services;
    let $container = null;
    let parentOptions = {};
    let activeThumbnailFrame = false;
    let lastRecordIndex = false;

    recordEditorEvents.listenAll({
        // @TODO debounce
        'recordEditor.uiResize': onResize,
        'recordSelection.changed': onSelectionChange,
        'recordEditor.onSelectRecord': renderPreview,
        'recordEditor.tabChange': tabChanged
    });

    const initialize = options => {
        let initWith = ({ $container, parentOptions } = options);
    };

    function onResize() {
        var selected = $('#EDIT_FILM2 .diapo.selected');

        if (selected.length !== 1) {
            return false;
        }

        var id = selected.attr('id').split('_').pop();

        var zoomable = $('img.record.zoomable', $container.parent());

        if (zoomable.length > 0 && zoomable.hasClass('zoomed')) {
            return false;
        }

        var h = parseInt(
            $($container.children()).attr('data-original-height'),
            10
        );
        var w = parseInt(
            $($container.children()).attr('data-original-width'),
            10
        );

        var t = 0;
        var de = 0;

        var margX = 20;
        var margY = 20;

        if ($('img.record.record_audio', $container).length > 0) {
            margY = 100;
            de = 60;
        }
        let containerWidth = $container.parent().width();
        let containerHeight = $container.parent().height();

        //  if(datas.doctype != 'flash')
        //  {
        var ratioP = w / h;
        var ratioD = containerWidth / containerHeight;

        if (ratioD > ratioP) {
            // je regle la hauteur d'abord
            if (parseInt(h, 10) + margY > containerHeight) {
                h = Math.round(containerHeight - margY);
                w = Math.round(h * ratioP);
            }
        } else {
            if (parseInt(w, 10) + margX > containerWidth) {
                w = Math.round(containerWidth - margX);
                h = Math.round(w / ratioP);
            }
        }
        t = Math.round((containerHeight - h - de) / 2);
        var l = Math.round((containerWidth - w) / 2);
        $('.record', $container.parent())
            .css({
                width: w,
                height: h,
                top: t,
                left: l,
                margin: '0 auto',
                display: 'block'
            })
            .attr('width', w)
            .attr('height', h);
    }

    function tabChanged(params) {
        if (params.tab === '#TH_Opreview') {
            //redraw preview
            var selected = $('#EDIT_FILM2 .diapo.selected');
            if (selected.length !== 1) {
                return false;
            }
            var id = selected.attr('id').split('_').pop();
            renderPreview({
                recordIndex: id
            });
        }
    }

    function renderPreview(params) {
        let { recordIndex } = params;

        lastRecordIndex = recordIndex;

        let currentRecord = parentOptions.recordCollection.getRecordByIndex(
            recordIndex
        );

        $container.empty();

        switch (currentRecord.type) {
            case 'video':
                // checkif video editor is enabled
                let hasVideoEditor = false;
                if (parentOptions.recordConfig.videoEditorConfig !== null) {
                    hasVideoEditor = true;
                }
                if (hasVideoEditor) {
                    // get records information for videoEditor
                    let videoRecords = [];
                    for (let recordIndex in parentOptions.recordConfig
                        .records) {
                        if (
                            parentOptions.recordConfig.records[recordIndex]
                                .id === currentRecord.rid
                        ) {
                            videoRecords.push(
                                parentOptions.recordConfig.records[recordIndex]
                            );
                        }
                    }

                    videoEditor(services).initialize({
                        $container,
                        parentOptions,
                        data: {
                            videoEditorConfig:
                                parentOptions.recordConfig.videoEditorConfig,
                            records: videoRecords
                        }
                    });
                } else {
                    // transform default embed ID in order to avoid conflicts:
                    let customId = 'phraseanet-embed-editor-frame';
                    let $template = $(currentRecord.template);
                    $template.attr('id', customId);

                    $container.append($template.get(0));
                    activeThumbnailFrame = new pym.Parent(
                        customId,
                        currentRecord.data.preview.url
                    );
                    activeThumbnailFrame.iframe.setAttribute(
                        'allowfullscreen',
                        ''
                    );
                }
                break;
            case 'audio':
            case 'document':
                let customId = 'phraseanet-embed-editor-frame';
                let $template = $(currentRecord.template);
                $template.attr('id', customId);

                $container.append($template.get(0));
                activeThumbnailFrame = new pym.Parent(
                    customId,
                    currentRecord.data.preview.url
                );
                activeThumbnailFrame.iframe.setAttribute('allowfullscreen', '');
                break;
            case 'image':
            default:
                $container.append(currentRecord.template);
                onResize();
        }

        if ($('img.PREVIEW_PIC.zoomable').length > 0) {
            $('img.PREVIEW_PIC.zoomable').draggable();
        }
    }

    /**
     * refresh preview if only one record is selected
     * @param params
     */
    function onSelectionChange(params) {
        let { selection } = params;
        if (selection.length === 1) {
            renderPreview({
                recordIndex: selection[0]
            });
        }
    }

    return { initialize };
};
export default preview;
