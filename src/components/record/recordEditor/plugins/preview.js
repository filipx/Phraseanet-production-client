import $ from 'jquery';
require('jquery-ui');

const preview = (services) => {
    const {configService, localeService, recordEditorEvents} = services;
    let $container = null;
    let parentOptions = {};

    recordEditorEvents.listenAll({
        // @TODO debounce
        'recordEditor.uiResize': _setPreviewEdit,
        'recordEditor.onSelectRecord': _previewEdit
    })

    const initialize = (options) => {
        let initWith = {$container, parentOptions} = options;
    };

    function _setPreviewEdit() {
        if (!$('#TH_Opreview').is(':visible')) {
            return false;
        }

        var selected = $('#EDIT_FILM2 .diapo.selected');

        if (selected.length !== 1) {
            return false;
        }

        var id = selected.attr('id').split('_').pop();

        var container = $('#TH_Opreview');
        var zoomable = $('img.record.zoomable', container);

        if (zoomable.length > 0 && zoomable.hasClass('zoomed')) {
            return false;
        }

        var h = parseInt($('input[name=height]', container).val(), 10);
        var w = parseInt($('input[name=width]', container).val(), 10);

        var t = 0;
        var de = 0;

        var margX = 0;
        var margY = 0;

        if ($('img.record.record_audio', container).length > 0) {
            margY = 100;
            de = 60;
        }

        var display_box = $('#TH_Opreview .PNB10');
        var dwidth = display_box.width();
        var dheight = display_box.height();


        //  if(datas.doctype != 'flash')
        //  {
        var ratioP = w / h;
        var ratioD = dwidth / dheight;

        if (ratioD > ratioP) {
            // je regle la hauteur d'abord
            if ((parseInt(h, 10) + margY) > dheight) {
                h = Math.round(dheight - margY);
                w = Math.round(h * ratioP);
            }
        } else {
            if ((parseInt(w, 10) + margX) > dwidth) {
                w = Math.round(dwidth - margX);
                h = Math.round(w / ratioP);
            }
        }
        //  }
        //  else
        //  {
        //
        //    h = Math.round(dheight - margY);
        //    w = Math.round(dwidth - margX);
        //  }
        t = Math.round((dheight - h - de) / 2);
        var l = Math.round((dwidth - w) / 2);
        $('.record', container).css({
            width: w,
            height: h,
            top: t,
            left: l
        }).attr('width', w).attr('height', h);

    }

    function _previewEdit(params) {
        let {recordIndex} = params;
        let currentRecord = parentOptions.recordCollection.getRecordByIndex(recordIndex);
        $('#TH_Opreview .PNB10').empty().append(currentRecord.preview);

        if ($('img.PREVIEW_PIC.zoomable').length > 0) {
            $('img.PREVIEW_PIC.zoomable').draggable();
        }
        _setPreviewEdit();
    }

    return {initialize};
};
export default preview;
