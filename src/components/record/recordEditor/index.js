import $ from 'jquery';
import * as appCommons from 'phraseanet-common';
import { sprintf } from 'sprintf-js';
import * as recordModel from '../../record/model';
import * as Rx from 'rx';
require('phraseanet-common/src/components/tooltip');
require('phraseanet-common/src/components/vendors/contextMenu');

const recordEditorService = (services) => {
    const { configService, localeService, appEvents } = services;
    let $container = null;
    let options = {};
    let stream = new Rx.Subject();
    let ETHSeeker;
    var $editorContainer = null;
    $(document).ready(function () {
        $editorContainer = $('#EDITWINDOW');
        $(window).bind('resize', function () {
            _setPreviewEdit();
            _setSizeLimits();
        });


        // idEditZTextArea
    });

    let $ztextStatus;
    let $editTextArea;
    const initialize = () => {
        options = {};
        options.curField = '?'; // "?";
        options.$container = $('#idFrameE');
        options.textareaIsDirty = false;
        options.fieldLastValue = '';
        options.lastClickId = null;
        options.sbas_id = false;
        options.what = false;
        // editor.regbasprid = false;
        options.newrepresent = false;
        // editor.ssel = false;

        $ztextStatus = $('#ZTextStatus', options.$container);
        $editTextArea = $('#idEditZTextArea', options.$container);
        _bindEvents();
    };

    const _bindEvents = () => {
        let cclicks = 0;
        const cDelay = 350;
        let cTimer = null;
        // edit_clk_editimg
        $editorContainer
            .on('click', '.select-record-action', (event) => {
                let $el = $(event.currentTarget);
                _onSelectRecord(event, $el.data('index'));
            })
            // set grouping (regroupement) image
            .on('click', '.set-grouping-image-action', (event) => {
                let $el = $(event.currentTarget);
                setRegDefault($el.data('index'), $el.data('record-id'));
            })
            // status field edition
            .on('click', '.edit-status-action', (event) => {
                event.cancelBubble = true;
                event.stopPropagation();

                if (!options.textareaIsDirty || edit_validField(event, 'ask_ok') === true) {
                    _editStatus(event);
                }
                return false;
            })
            // edit field by name / set active for edition
            .on('click', '.edit-field-action', (event) => {
                let $el = $(event.currentTarget);
                if (!options.textareaIsDirty || edit_validField(event, 'ask_ok') === true) {
                    _editField(event, $el.data('id'));
                }
                return false;
            })
            .on('click', '.field-navigate-action', (event) => {
                event.preventDefault();
                let $el = $(event.currentTarget);
                let dir = $el.data('direction') === 'forward' ? 1 : -1;

                fieldNavigate(event, dir);
            })
            .on('click submit', '.add-multivalued-field-action', (event) => {
                event.preventDefault();
                let $el = $(event.currentTarget);
                let fieldValue = $('#' + $el.data('input-id')).val();

                _addMultivaluedField(fieldValue, null);
            })
            .on('click', '.edit-multivalued-field-action', (event) => {
                event.preventDefault();
                let $el = $(event.currentTarget);

                _editMultivaluedField(event, $el.data('index'));
            })
            .on('click', '.toggle-status-field-action', (event) => {
                event.preventDefault();
                let $el = $(event.currentTarget);
                let state = $el.data('state') === 1 ? 1 : 0;
                edit_clkstatus(event, $el.data('bit'), state);
            })
            .on('click', '.commit-field-action', (event) => {
                event.preventDefault();
                let $el = $(event.currentTarget);
                edit_validField(event, $el.data('mode'));
            })


            .on('click', '.edit-thesaurus-action', (event) => {
                event.preventDefault();
                cclicks++;

                if (cclicks === 1) {
                    cTimer = setTimeout(function () {
                        edit_clickThesaurus(event);
                        cclicks = 0;
                    }, cDelay);

                } else {
                    clearTimeout(cTimer);
                    edit_dblclickThesaurus(event);
                    cclicks = 0;
                }
            })
            .on('dblclick', '.thesaurus-branch-action', (event) => {
                // dbl is handled by click event
                event.preventDefault();
            })

            .on('change', '.toggle-replace-mode-action', (event) => {
                event.preventDefault();
                _toggleReplaceMode(event);
            })

            .on('click', '.apply-multi-desc-action', (event) => {
                event.preventDefault();
                edit_applyMultiDesc(event);
            })
            .on('click', '.cancel-multi-desc-action', (event) => {
                event.preventDefault();
                edit_cancelMultiDesc(event);
            })

            .on('mouseup mousedown keyup keydown', '#idEditZTextArea', function (event) {


                switch (event.type) {
                    case 'mouseup':
                        _onTextareaMouseUp(event);
                        break;
                    case 'mousedown':
                        _onTextareaMouseDown(event);
                        break;
                    case 'keyup':
                        _onTextareaKeyUp(event);
                        break;
                    case 'keydown':
                        _onTextareaKeyDown(event);
                        break;
                    default:
                }
            });

    };

    const onGlobalKeydown = (event, specialKeyState) => {
        if (specialKeyState === undefined) {
            let specialKeyState = {
                isCancelKey: false,
                isShortcutKey: false
            };
        }
        switch (event.keyCode) {
            case 9:	// tab ou shift-tab
                fieldNavigate(event, appCommons.utilsModule.is_shift_key(event) ? -1 : 1);
                specialKeyState.isCancelKey = specialKeyState.isShortcutKey = true;
                break;
            case 27:
                edit_cancelMultiDesc(event);
                specialKeyState.isShortcutKey = true;
                break;

            case 33:	// pg up
                if (!options.textareaIsDirty || edit_validField(event, 'ask_ok')) {
                    skipImage(event, 1);
                }
                specialKeyState.isCancelKey = true;
                break;
            case 34:	// pg dn
                if (!options.textareaIsDirty || edit_validField(event, 'ask_ok')) {
                    skipImage(event, -1);
                }
                specialKeyState.isCancelKey = true;
                break;
            default:
        }
        return specialKeyState;
    };

    function startThisEditing(params) {// sbas_id, what, regbasprid, ssel) {
        let { hasMultipleDatabases, databoxId, mode, notActionable, notActionableMsg, state } = params;

        if (hasMultipleDatabases === true) {
            $('#EDITWINDOW').hide();
            // editor can't be run
            $('#dialog-edit-many-sbas', options.$container).dialog({
                modal: true,
                resizable: false,
                buttons: {
                    Ok: function () {
                        $(this).dialog('close');
                    }
                }
            });
            return;
        }

        if (notActionable > 0) {
            alert(notActionableMsg);
        }

        options.sbas_id = databoxId;
        options.what = mode;
        options = Object.assign(options, state);
        // editor.regbasprid = regbasprid;
        // editor.ssel = ssel;
        $editTextArea = $('#idEditZTextArea', options.$container);

        let recordCollection = options.T_records;
        for (let r in recordCollection) {
            var fields = {};

            for (let f in options.T_records[r].fields) {

                var meta_struct_id = options.T_records[r].fields[f].meta_struct_id;

                var name = options.T_fields[meta_struct_id].name;
                var label = options.T_fields[meta_struct_id].label;
                var multi = options.T_fields[meta_struct_id].multi;
                var required = options.T_fields[meta_struct_id].required;
                var readonly = options.T_fields[meta_struct_id].readonly;
                var maxLength = options.T_fields[meta_struct_id].maxLength;
                var minLength = options.T_fields[meta_struct_id].minLength;
                var type = options.T_fields[meta_struct_id].type;
                var separator = options.T_fields[meta_struct_id].separator;
                var vocabularyControl = options.T_fields[meta_struct_id].vocabularyControl || null;
                var vocabularyRestricted = options.T_fields[meta_struct_id].vocabularyRestricted || null;

                var fieldOptions = {
                    multi: multi,
                    required: required,
                    readonly: readonly,
                    maxLength: maxLength,
                    minLength: minLength,
                    type: type,
                    separator: separator,
                    vocabularyControl: vocabularyControl,
                    vocabularyRestricted: vocabularyRestricted
                };

                var databoxField = new recordModel.databoxField(name, label, meta_struct_id, fieldOptions);

                var values = [];

                for (let v in options.T_records[r].fields[f].values) {
                    var meta_id = options.T_records[r].fields[f].values[v].meta_id;
                    var value = options.T_records[r].fields[f].values[v].value;
                    var vocabularyId = options.T_records[r].fields[f].values[v].vocabularyId;

                    values.push(new recordModel.recordFieldValue(meta_id, value, vocabularyId));
                }

                fields[f] = new recordModel.recordField(databoxField, values);
            }

            options.T_records[r].fields = fields;
            options.fields = fields;

        }

        $('#EditTextMultiValued').bind('keyup', function () {
            _reveal_mval($(this).val());
        });

        $('#EDIT_MID_R .tabs').tabs();

        $('#divS div.edit_field:odd').addClass('odd');
        $('#divS div').bind('mouseover', function () {
            $(this).addClass('hover');
        }).bind('mouseout', function () {
            $(this).removeClass('hover');
        });

        $('#editcontextwrap').remove();

        if ($('#editcontextwrap').length === 0) {
            $('body').append('<div id="editcontextwrap"></div>');
        }


        // if is a group, only select the group
        if (options.what === 'GRP') {
            _toggleGroupSelection();
        } else {
            _edit_select_all();
        }


        $('.previewTips, .DCESTips, .fieldTips', options.$container).tooltip({
            fixable: true,
            fixableIndex: 1200
        });
        $('.infoTips', options.$container).tooltip();

        if (options.what === 'GRP') {
            $('#EDIT_FILM2 .reg_opts').show();

            $.each($('#EDIT_FILM2 .contextMenuTrigger'), function () {

                var id = $(this).attr('id').split('_').slice(1, 3).join('_');
                $(this).contextMenu('#editContext_' + id + '', {
                    appendTo: '#editcontextwrap',
                    openEvt: 'click',
                    dropDown: true,
                    theme: 'vista',
                    showTransition: 'slideDown',
                    hideTransition: 'hide',
                    shadow: false
                });
            });
        }

        _hsplit1();
        _vsplit2();
        _vsplit1();

        $('#EDIT_TOP', options.$container).resizable({
            handles: 's',
            minHeight: 100,
            resize: function () {
                _hsplit1();
                _setPreviewEdit();
            },
            stop: function () {
                _hsplit1();
                appCommons.userModule.setPref('editing_top_box', Math.floor($('#EDIT_TOP').height() * 100 / $('#EDIT_ALL').height()));
                _setSizeLimits();
            }
        });

        $('#divS_wrapper', options.$container).resizable({
            handles: 'e',
            minWidth: 200,
            resize: function () {
                _vsplit1();
                _setPreviewEdit();
            },
            stop: function () {
                appCommons.userModule.setPref('editing_right_box', Math.floor($('#divS').width() * 100 / $('#EDIT_MID_L').width()));
                _vsplit1();
                _setSizeLimits();
            }
        });

        $('#EDIT_MID_R')
            .css('left', $('#EDIT_MID_L').position().left + $('#EDIT_MID_L').width() + 15)
            .resizable({
                handles: 'w',
                minWidth: 200,
                resize: function () {
                    _vsplit2();
                    _setPreviewEdit();
                },
                stop: function () {
                    appCommons.userModule.setPref('editing_left_box', Math.floor($('#EDIT_MID_R').width() * 100 / $('#EDIT_MID').width()));
                    _vsplit2();
                    _setSizeLimits();
                }
            });

        $('#EDIT_ZOOMSLIDER', options.$container).slider({
            min: 60,
            max: 300,
            value: options.diapoSize,
            slide: function (event, ui) {
                var v = $(ui.value)[0];
                $('#EDIT_FILM2 .diapo', options.$container).width(v).height(v);
            },
            change: function (event, ui) {
                options.diapoSize = $(ui.value)[0];
                appCommons.userModule.setPref('editing_images_size', options.diapoSize);
            }
        });

        let buttons = {};
        buttons[localeService.t('valider')] = function (e) {
            $(this).dialog('close');
            edit_applyMultiDesc(e);
        };
        buttons[localeService.t('annuler')] = function (e) {
            $(this).dialog('close');
            edit_cancelMultiDesc(e);
        };

        $('#EDIT_CLOSEDIALOG', options.$container).dialog({
            autoOpen: false,
            closeOnEscape: true,
            resizable: false,
            draggable: false,
            modal: true,
            buttons: buttons
        });

        buttons[localeService.t('valider')] = function () {
            var form = $('#Edit_copyPreset_dlg FORM');
            var jtitle = $('.EDIT_presetTitle', form);
            if (jtitle.val() === '') {
                alert(localeService.t('needTitle'));
                jtitle[0].focus();
                return;
            }

            var fields = [];
            $(':checkbox', form).each(function (idx, elem) {
                var $el = $(elem);
                if ($el.is(':checked')) {
                    var val = $el.val();
                    var field = {
                        name: options.T_fields[val].name,
                        value: []
                    };
                    var tval;
                    if (options.T_fields[val].multi) {
                        field.value = $.map(
                            options.T_fields[val]._value.split(';'),
                            function (obj, idx) {
                                return obj.trim();
                            }
                        );
                    } else {
                        field.value = [options.T_fields[val]._value.trim()];
                    }
                    fields.push(field);
                }
            });

            $.ajax({
                type: 'POST',
                url: '../prod/records/edit/presets',
                data: {
                    sbas_id: options.sbas_id,
                    title: jtitle.val(),
                    fields: fields
                },
                dataType: 'json',
                success: function (data, textStatus) {
                    _preset_paint(data);

                    if ($('#Edit_copyPreset_dlg').data('ui-dialog')) {
                        $('#Edit_copyPreset_dlg').dialog('close');
                    }
                }
            });
        };

        buttons[localeService.t('annuler')] = function () {
            $(this).dialog('close');

        };

        $('#Edit_copyPreset_dlg', options.$container).dialog({
            stack: true,
            closeOnEscape: true,
            resizable: false,
            draggable: false,
            autoOpen: false,
            modal: true,
            width: 600,
            title: localeService.t('newPreset'),
            close: function (event, ui) {
                $(this).dialog('widget').css('z-index', 'auto');
            },
            open: function (event, ui) {
                $(this).dialog('widget').css('z-index', '5000');
                $('.EDIT_presetTitle')[0].focus();
            },
            buttons: buttons
        });

        $('#idEditDateZone', options.$container).datepicker({
            changeYear: true,
            changeMonth: true,
            dateFormat: 'yy/mm/dd',
            onSelect: function (dateText, inst) {
                var lval = $editTextArea.val();
                if (lval !== dateText) {
                    options.fieldLastValue = lval;
                    $editTextArea.val(dateText);
                    $('#idEditZTextArea').trigger('keyup.maxLength');
                    options.textareaIsDirty = true;
                    edit_validField(null, 'ok');
                }
            }
        });

        ETHSeeker = new _EditThesaurusSeeker(options.sbas_id);

        _setSizeLimits();

        $.ajax({
            type: 'GET',
            url: '../prod/records/edit/presets',
            data: {
                sbas_id: options.sbas_id
            },
            dataType: 'json',
            success: function (data, textStatus) {
                _preset_paint(data);
            }
        });

        _check_required();

        $('#TH_Opresets button.adder').bind('click', function () {
            _preset_copy();
        });

        try {
            $('#divS .edit_field:first').trigger('mousedown');
        } catch (err) {

        }
    }

    function _toggleGroupSelection() {
        var groupIndex = 0;
        _onSelectRecord(false, groupIndex);

    }

    function _preset_paint(data) {
        $('.EDIT_presets_list', options.$container).html(data.html);
        $('.EDIT_presets_list A.triangle').click(
            function () {
                $(this).parent().parent().toggleClass('opened');
                return false;
            }
        );

        $('.EDIT_presets_list A.title').dblclick(
            function () {
                var preset_id = $(this).parent().parent().attr('id');
                if (preset_id.substr(0, 12) === 'EDIT_PRESET_') {
                    _preset_load(preset_id.substr(12));
                }
                return false;
            }
        );

        $('.EDIT_presets_list A.delete').click(
            function () {
                var li = $(this).closest('LI');
                var preset_id = li.attr('id');
                var title = $(this).parent().children('.title').html();
                if (preset_id.substr(0, 12) === 'EDIT_PRESET_' && confirm("supprimer le preset '" + title + "' ?")) {
                    _preset_delete(preset_id.substr(12), li);
                }
                return false;
            }
        );
    }

    function _preset_copy() {
        var html = '';
        for (let i in options.T_fields) {
            if (options.T_fields[i]._status === 1) {
                if (options.T_fields[i].readonly) {
                    continue;
                }
                var c = options.T_fields[i]._value === '' ? '' : 'checked="1"';
                var v = options.T_fields[i]._value;
                html += '<div><label class="checkbox" for="new_preset_' + options.T_fields[i].name + '"><input type="checkbox" class="checkbox" id="new_preset_' + options.T_fields[i].name + '" value="' + i + '" ' + c + '/>' + '<b>' + options.T_fields[i].label + ' : </b></label> ';
                html += _cleanTags(options.T_fields[i]._value) + '</div>';
            }
        }
        $('#Edit_copyPreset_dlg FORM DIV').html(html);
        var $dialog = $('#Edit_copyPreset_dlg');
        if ($dialog.data('ui-dialog')) {
            // to show dialog on top of edit window
            $dialog.dialog('widget').css('z-index', 1300);
            $dialog.dialog('open');
        }
    }

    function _preset_delete(preset_id, li) {
        $.ajax({
            type: 'DELETE',
            url: '../prod/records/edit/presets/' + preset_id,
            data: {},
            dataType: 'json',
            success: function (data, textStatus) {
                li.remove();
            }
        });
    }

    function _preset_load(preset_id) {
        $.ajax({
            type: 'GET',
            url: '../prod/records/edit/presets/' + preset_id,
            data: {},
            dataType: 'json',
            success: function (data, textStatus) {
                if ($('#Edit_copyPreset_dlg').data('ui-dialog')) {
                    $('#Edit_copyPreset_dlg').dialog('close');
                }

                for (let i in options.T_fields) {
                    options.T_fields[i].preset = null;
                    if (typeof (data.fields[options.T_fields[i].name]) !== 'undefined') {
                        options.T_fields[i].preset = data.fields[options.T_fields[i].name];
                    }
                }
                for (let r = 0; r < options.T_records.length; r++) {
                    if (!options.T_records[r]._selected) {
                        continue;
                    }

                    for (let i in options.T_fields) {
                        if (options.T_fields[i].preset !== null) {
                            for (let val in options.T_fields[i].preset) {
                                // fix : some (old, malformed) presets values may need trim()
                                options.T_records[r].fields['' + i].addValue(options.T_fields[i].preset[val].trim(), false, null);
                            }
                        }
                    }
                }
                _updateEditSelectedRecords();
            }
        });
    }

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

        //  var datas = editor.T_records[id].preview;

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

    function _previewEdit(r) {
        $('#TH_Opreview .PNB10').empty().append(options.T_records[r].preview);

        if ($('img.PREVIEW_PIC.zoomable').length > 0) {
            $('img.PREVIEW_PIC.zoomable').draggable();
        }
        _setPreviewEdit();
    }

    function skipImage(evt, step) {
        let cache = $('#EDIT_FILM2');
        let first = $('.diapo.selected:first', cache);
        let last = $('.diapo.selected:last', cache);
        let sel = $('.diapo.selected', cache);

        sel.removeClass('selected');

        let i = step === 1 ? (parseInt(last.attr('pos'), 10) + 1) : (parseInt(first.attr('pos'), 10) - 1);

        if (i < 0) {
            i = parseInt($('.diapo:last', cache).attr('pos'), 10);
        } else if (i >= $('.diapo', cache).length) {
            i = 0;
        }

        _onSelectRecord(evt, i);
    }

    function setRegDefault(n, record_id) {
        options.newrepresent = record_id;

        var src = $('#idEditDiapo_' + n).find('img.edit_IMGT').attr('src');
        var style = $('#idEditDiapo_' + n).find('img.edit_IMGT').attr('style');

        $('#EDIT_GRPDIAPO .edit_IMGT').attr('src', src).attr('style', style);
    }

    // // ---------------------------------------------------------------------------
// // on change de champ courant
// // ---------------------------------------------------------------------------

    function _editField(evt, meta_struct_id) {
        document.getElementById('idEditZTextArea').blur();
        document.getElementById('EditTextMultiValued').blur();
        $('.editDiaButtons', options.$container).hide();

        $('#idEditZTextArea, #EditTextMultiValued').unbind('keyup.maxLength');


        options.curField = meta_struct_id;

        if (meta_struct_id >= 0) {


            let field = null;
            if (options.T_fields === undefined) {
                return;
            }

            if (options.T_fields[meta_struct_id] !== undefined) {
                field = options.T_fields[meta_struct_id];

                var name = field.required ? field.label + '<span style="font-weight:bold;font-size:16px;"> * </span>' : field.label;

                $('#idFieldNameEdit', options.$container).html(name);


                var vocabType = options.T_fields[meta_struct_id].vocabularyControl;

                $('#idEditZTextArea, #EditTextMultiValued').autocomplete({
                    minLength: 2,
                    appendTo: '#idEditZone',
                    source: function (request, response) {
                        $.ajax({
                            url: '../prod/records/edit/vocabulary/' + vocabType + '/',
                            dataType: 'json',
                            data: {
                                sbas_id: options.sbas_id,
                                query: request.term
                            },
                            success: function (data) {
                                response(data.results);
                            }
                        });
                    },
                    select: function (event, ui) {

                        _addMultivaluedField(ui.item.label, ui.item.id);

                        return false;
                    }
                });


                if (options.T_fields[meta_struct_id].maxLength > 0) {
                    var idexplain = $('#idExplain');
                    idexplain.html('');

                    $('#idEditZTextArea, #EditTextMultiValued').bind('keyup.maxLength', function () {
                        var remaining = Math.max((options.T_fields[meta_struct_id].maxLength - $(this).val().length), 0);
                        idexplain.html("<span class='metadatas_restrictionsTips' tooltipsrc='../prod/tooltip/metas/restrictionsInfos/" + options.sbas_id + '/' + meta_struct_id + "/'><img src='/assets/common/images/icons/help32.png' /><!--<img src='/assets/common/images/icons/alert.png' />--> Caracteres restants : " + (remaining) + '</span>');
                        $('.metadatas_restrictionsTips', idexplain).tooltip();
                    }).trigger('keyup.maxLength');
                } else {
                    $('#idExplain').html('');
                }

                if (!options.T_fields[meta_struct_id].multi) {
                    // champ monovalue : textarea
                    $('.editDiaButtons', options.$container).hide();

                    if (options.T_fields[meta_struct_id].type === 'date') {
                        $editTextArea.css('height', '16px');
                        $('#idEditDateZone', options.$container).show();
                    } else {
                        $('#idEditDateZone', options.$container).hide();
                        $editTextArea.css('height', '100%');
                    }

                    $ztextStatus.hide();
                    $('#ZTextMultiValued', options.$container).hide();
                    $('#ZTextMonoValued', options.$container).show();

                    if (options.T_fields[meta_struct_id]._status === 2) {
                        // heterogene
                        $editTextArea.val(options.fieldLastValue = '');
                        $editTextArea.addClass('hetero');
                        $('#idDivButtons', options.$container).show();	// valeurs h�t�rog�nes : les 3 boutons remplacer/ajouter/annuler
                    } else {
                        // homogene
                        $editTextArea.val(options.fieldLastValue = options.T_fields[meta_struct_id]._value);
                        $editTextArea.removeClass('hetero');

                        $('#idDivButtons', options.$container).hide();	// valeurs homog�nes
                        if (options.T_fields[meta_struct_id].type === 'date') {
                            let v = options.T_fields[meta_struct_id]._value.split(' ');
                            let d = v[0].split('/');
                            let dateObj = new Date();
                            if (d.length === 3) {
                                dateObj.setYear(d[0]);
                                dateObj.setMonth((d[1] - 1));
                                dateObj.setDate(d[2]);
                            }

                            if ($('#idEditDateZone', options.$container).data('ui-datepicker')) {
                                $('#idEditDateZone', options.$container).datepicker('setDate', dateObj);
                            }
                        }
                    }
                    options.textareaIsDirty = false;

                    $('#idEditZone', options.$container).show();

                    $('#idEditZTextArea').trigger('keyup.maxLength');

                    self.setTimeout("document.getElementById('idEditZTextArea').focus();", 50);
                } else {
                    // champ multivalue : liste
                    $ztextStatus.hide();
                    $('#ZTextMonoValued', options.$container).hide();
                    $('#ZTextMultiValued', options.$container).show();

                    $('#idDivButtons', options.$container).hide();	// valeurs homogenes

                    _updateCurrentMval(meta_struct_id);

                    $('#EditTextMultiValued', options.$container).val('');
                    $('#idEditZone', options.$container).show();

                    $('#EditTextMultiValued').trigger('keyup.maxLength');

                    self.setTimeout("document.getElementById('EditTextMultiValued').focus();", 50);

                    //      reveal_mval();
                }
            }
        } else {
            // pas de champ, masquer la zone du textarea
            $('#idEditZone', options.$container).hide();
            $('.editDiaButtons', options.$container).hide();

        }
        _activeField();
    }

    function _updateEditSelectedRecords(evt) {
        $('.editDiaButtons', options.$container).hide();
// tous les statusbits de la base
        for (let n in options.T_statbits) {
            options.T_statbits[n]._value = '-1';			// val unknown
            for (let i in options.T_records) {
                if (!options.T_records[i]._selected) {
                    continue;
                }
                if (options.T_records[i].statbits.length === 0) {
                    continue;
                }

                if (options.T_statbits[n]._value === '-1') {
                    options.T_statbits[n]._value = options.T_records[i].statbits[n].value;
                } else if (options.T_statbits[n]._value !== options.T_records[i].statbits[n].value) {
                    options.T_statbits[n]._value = '2';
                }
            }
            var ck0 = $('#idCheckboxStatbit0_' + n);
            var ck1 = $('#idCheckboxStatbit1_' + n);

            switch (options.T_statbits[n]._value) {
                case '0':
                case 0:
                    ck0.removeClass('gui_ckbox_0 gui_ckbox_2').addClass('gui_ckbox_1');
                    ck1.removeClass('gui_ckbox_1 gui_ckbox_2').addClass('gui_ckbox_0');
                    break;
                case '1':
                case 1:
                    ck0.removeClass('gui_ckbox_1 gui_ckbox_2').addClass('gui_ckbox_0');
                    ck1.removeClass('gui_ckbox_0 gui_ckbox_2').addClass('gui_ckbox_1');
                    break;
                case '2':
                    ck0.removeClass('gui_ckbox_0 gui_ckbox_1').addClass('gui_ckbox_2');
                    ck1.removeClass('gui_ckbox_0 gui_ckbox_1').addClass('gui_ckbox_2');
                    break;
                default:
            }
        }


        var nostatus = $('.diapo.selected.nostatus', options.$container).length;
        var status_box = $('#ZTextStatus');
        $('.nostatus, .somestatus, .displaystatus', status_box).hide();

        if (nostatus === 0) {
            $('.displaystatus', status_box).show();
        } else {
            var yesstatus = $('.diapo.selected', options.$container).length;
            if (nostatus === yesstatus) {
                $('.nostatus', status_box).show();
            } else {
                $('.somestatus, .displaystatus', status_box).show();
            }
        }

        // calcul des valeurs suggerees COMMUNES aux records (collections) selectionnes //
        // tous les champs de la base
        for (let f in options.T_fields) {
            options.T_fields[f]._sgval = [];
        }
        var t_lsgval = {};
        var t_selcol = {};		// les bases (coll) dont au - une thumb est selectionnee
        var ncolsel = 0;
        var nrecsel = 0;
        for (let i in options.T_records) {
            if (!options.T_records[i]._selected) {
                continue;
            }
            nrecsel++;

            var bid = 'b' + options.T_records[i].bid;
            if (t_selcol[bid]) {
                continue;
            }

            t_selcol[bid] = 1;
            ncolsel++;
            for (let f in options.T_sgval[bid]) {
                if (!t_lsgval[f]) {
                    t_lsgval[f] = {};
                }
                for (let ivs in options.T_sgval[bid][f]) {
                    let vs = options.T_sgval[bid][f][ivs];
                    if (!t_lsgval[f][vs]) {
                        t_lsgval[f][vs] = 0;
                    }
                    t_lsgval[f][vs]++;
                }
            }
        }
        var t_sgval = {};
        for (let f in t_lsgval) {
            for (let sv in t_lsgval[f]) {
                if (t_lsgval[f][sv] === ncolsel) {
                    options.T_fields[f]._sgval.push({
                            label: sv,
                            onclick: function (menuItem, menu, e, label) {
                                if (options.T_fields[options.curField].multi) {
                                    $('#EditTextMultiValued', options.$container).val(label);
                                    $('#EditTextMultiValued').trigger('keyup.maxLength');
                                    _addMultivaluedField($('#EditTextMultiValued', options.$container).val(), null);
                                } else {
                                    if (appCommons.utilsModule.is_ctrl_key(e)) {
                                        var t = $editTextArea.val();
                                        $editTextArea.val(t + (t ? ' ; ' : '') + label);
                                    } else {
                                        $editTextArea.val(label);
                                    }
                                    $('#idEditZTextArea').trigger('keyup.maxLength');
                                    options.textareaIsDirty = true;
                                    if (options.T_fields[options.curField]._status !== 2) {
                                        edit_validField(evt, 'ask_ok');
                                    }
                                }
                            }
                        }
                    );
                }
            }
            if (options.T_fields[f]._sgval.length > 0) {
                $('#editSGtri_' + f, options.$container).css('visibility', 'visible');
                $('#editSGtri_' + f, options.$container).unbind();
                $('#editSGtri_' + f, options.$container).contextMenu(
                    options.T_fields[f]._sgval,
                    {
                        theme: 'vista',
                        openEvt: 'click',
                        beforeShow: function (a, b, c, d) {
                            var fid = this.target.getAttribute('id').substr(10);
                            if (!options.textareaIsDirty || edit_validField(null, 'ask_ok') === true) {
                                _editField(null, fid);
                                return (true);
                            } else {
                                return (false);
                            }
                        }
                    }
                );
            } else {
                $('#editSGtri_' + f, options.$container).css('visibility', 'hidden');
            }
        }

        // $('#idFrameE .ww_status', editor.$container).html(nrecsel + " record(s) selected for editing");

        _updateFieldDisplay();

        if (options.curField === -1) {
            _editStatus(evt);
        } else {
            _editField(evt, options.curField);
        }
    }

    function _updateFieldDisplay() {
        // tous les champs de la base
        for (let f in options.T_fields) {
            options.T_fields[f]._status = 0;			// val unknown
            for (let i in options.T_records) {
                if (!options.T_records[i]._selected) {
                    continue;
                }

                let v = '';
                if (!options.T_records[i].fields[f].isEmpty()) {
                    // le champ existe dans la fiche
                    if (options.T_fields[f].multi) {
                        // champ multi : on compare la concat des valeurs
                        v = options.T_records[i].fields[f].getSerializedValues();
                    } else {
                        v = options.T_records[i].fields[f].getValue().getValue();
                    }
                }

                if (options.T_fields[f]._status === 0) {
                    options.T_fields[f]._value = v;
                    options.T_fields[f]._status = 1;
                } else if (options.T_fields[f]._status === 1 && options.T_fields[f]._value !== v) {
                    options.T_fields[f]._value = '*****';
                    options.T_fields[f]._status = 2;
                    break;	// plus la peine de verifier le champ sur les autres records
                }
            }
            var o = document.getElementById('idEditField_' + f);

            if (o) {
                // mixed
                if (options.T_fields[f]._status === 2) {
                    o.innerHTML = "<span class='hetero'>xxxxx</span>";
                } else {
                    var v = options.T_fields[f]._value;
                    v = (v instanceof (Array)) ? v.join(';') : v;
                    o.innerHTML = _cleanTags(v).replace(/\n/gm, "<span style='color:#0080ff'>&para;</span><br/>");
                }
            }
        }
    }

    // ---------------------------------------------------------------------------
// on active le pseudo champ 'status'
// ---------------------------------------------------------------------------
    function _editStatus(evt) {
        $('.editDiaButtons', options.$container).hide();

        document.getElementById('idEditZTextArea').blur();
        document.getElementById('EditTextMultiValued').blur();

        $('#idFieldNameEdit', options.$container).html('[STATUS]');
        $('#idExplain', options.$container).html('&nbsp;');

        $('#ZTextMultiValued', options.$container).hide();
        $('#ZTextMonoValued', options.$container).hide();
        $ztextStatus.show();

        $('#idEditZone', options.$container).show();

        document.getElementById('editFakefocus').focus();
        options.curField = -1;
        _activeField();
    }

    function _updateCurrentMval(meta_struct_id, HighlightValue, vocabularyId) {

        // on compare toutes les valeurs de chaque fiche selectionnee
        options.T_mval = [];			// tab des mots, pour trier
        var a = [];		// key : mot ; val : nbr d'occurences distinctes
        var n = 0;					// le nbr de records selectionnes

        for (let r in options.T_records) {
            if (!options.T_records[r]._selected) {
                continue;
            }

            options.T_records[r].fields[meta_struct_id].sort(_sortCompareMetas);

            var values = options.T_records[r].fields[meta_struct_id].getValues();

            for (let v in values) {
                let word = values[v].getValue();
                let key = values[v].getVocabularyId() + '%' + word;

                if (typeof (a[key]) === 'undefined') {
                    a[key] = {
                        n: 0,
                        f: []
                    };	// n:nbr d'occurences DISTINCTES du mot ; f:flag presence mot dans r
                    options.T_mval.push(values[v]);
                }

                if (!a[key].f[r]) {
                    a[key].n++; // premiere apparition du mot dans le record r
                }
                a[key].f[r] = true;	// on ne recomptera pas le mot s'il apparait a nouveau dans le meme record

            }

            n++;
        }

        options.T_mval.sort(_sortCompareMetas);

        var t = '';
        // pour lire le tableau 'a' dans l'ordre trie par 'editor.T_mval'
        for (let i in options.T_mval) {
            let value = options.T_mval[i];
            let word = value.getValue();
            let key = value.getVocabularyId() + '%' + word;

            let extra = value.getVocabularyId() ? '<img src="/assets/common/images/icons/ressource16.png" /> ' : '';

            if (i > 0) {
                if (value.getVocabularyId() !== null && options.T_mval[i - 1].getVocabularyId() === value.getVocabularyId()) {
                    continue;
                }
                if (value.getVocabularyId() === null && options.T_mval[i - 1].getVocabularyId() === null) {
                    if (options.T_mval[i - 1].getValue() === value.getValue()) {
                        continue;	// on n'accepte pas les doublons
                    }
                }
            }

            t += '<div data-index="' + i + '" class="edit-multivalued-field-action '
                + (((value.getVocabularyId() === null || value.getVocabularyId() === vocabularyId) && HighlightValue === word) ? ' hilighted ' : '')
                + (a[key].n !== n ? ' hetero ' : '') + '">'
                + '<table><tr><td>'
                + extra
                + '<span class="value" vocabId="' + (value.getVocabularyId() ? value.getVocabularyId() : '') + '">'
                + $('<div/>').text(word).html()
                + "</span></td><td class='options'>"
                + '<a href="#" class="add_all"><img src="/assets/common/images/icons/plus11.png"/></a> '
                + '<a href="#" class="remove_all"><img src="/assets/common/images/icons/minus11.png"/></a>'
                + '</td></tr></table>'
                + '</div>';
        }
        $('#ZTextMultiValued_values', options.$container).html(t);

        $('#ZTextMultiValued_values .add_all', options.$container).unbind('click').bind('click', function () {
            let container = $(this).closest('div');

            let span = $('span.value', container);

            let value = span.text();
            let vocab_id = span.attr('vocabid');

            _addMultivaluedField(value, vocab_id);
            _updateFieldDisplay();
            return false;
        });
        $('#ZTextMultiValued_values .remove_all', options.$container).unbind('click').bind('click', function () {
            let container = $(this).closest('div');

            let span = $('span.value', container);

            let value = span.text();
            let vocab_id = span.attr('vocabid');

            _edit_delmval(value, vocab_id);
            _updateFieldDisplay();
            return false;
        });

        _updateFieldDisplay();
    }

    // ---------------------------------------------------------------------------------------------------------
// en mode textarea, on clique sur ok, cancel ou fusion
// appele egalement quand on essaye de changer de champ ou d'image : si ret=false on interdit le changement
// ---------------------------------------------------------------------------------------------------------
    function edit_validField(evt, action) {
        // action : 'ok', 'fusion' ou 'cancel'
        if (options.curField === '?') {
            return (true);
        }

        if (action === 'cancel') {
            // on restore le contenu du champ
            $editTextArea.val(options.fieldLastValue);
            $('#idEditZTextArea').trigger('keyup.maxLength');
            options.textareaIsDirty = false;
            return (true);
        }

        if (action === 'ask_ok' && options.textareaIsDirty && options.T_fields[options.curField]._status === 2) {
            alert(localeService.t('edit_hetero'));
            return (false);
        }
        let o;
        let newvalue;
        if (o = document.getElementById('idEditField_' + options.curField)) {
            let t = $editTextArea.val();

            let status = 0;
            let firstvalue = '';
            for (let i = 0; i < options.T_records.length; i++) {
                if (!options.T_records[i]._selected) {
                    continue;			// on ne modifie pas les fiches non selectionnees
                }

                if (action === 'ok' || action === 'ask_ok') {
                    options.T_records[i].fields[options.curField].addValue(t, false, null);
                } else if (action === 'fusion' || action === 'ask_fusion') {
                    options.T_records[i].fields[options.curField].addValue(t, true, null);
                }

                _check_required(i, options.curField);
            }
        }

        _updateFieldDisplay();

        options.textareaIsDirty = false;


        _editField(evt, options.curField);
        return (true);
    }

    // ---------------------------------------------------------------------------
// on a clique sur une checkbox de status
// ---------------------------------------------------------------------------
    function edit_clkstatus(evt, bit, val) {
        let ck0 = $('#idCheckboxStatbit0_' + bit);
        let ck1 = $('#idCheckboxStatbit1_' + bit);
        switch (val) {
            case 0:
                ck0.attr('class', 'gui_ckbox_1');
                ck1.attr('class', 'gui_ckbox_0');
                break;
            case 1:
                ck0.attr('class', 'gui_ckbox_0');
                ck1.attr('class', 'gui_ckbox_1');
                break;
            default:
        }

        for (let id in options.T_records) {
            // toutes les fiches selectionnees
            if (options.T_records[id]._selected) {
                if ($('#idEditDiapo_' + id).hasClass('nostatus')) {
                    continue;
                }

                options.T_records[id].statbits[bit].value = val;
                options.T_records[id].statbits[bit].dirty = true;
            }
        }
    }

    // ---------------------------------------------------------------------------
// on a clique sur une thumbnail
// ---------------------------------------------------------------------------
    function _onSelectRecord(evt, i) {
        if (options.curField >= 0) {
            if (options.textareaIsDirty && edit_validField(evt, 'ask_ok') === false) {
                return;
            }
        }

        // guideline : si on mousedown sur une selection, c'est qu'on risque de draguer, donc on ne desectionne pas
        if (evt && evt.type === 'mousedown' && options.T_records[i]._selected) {
            return;
        }

        if (evt && appCommons.utilsModule.is_shift_key(evt) && options.lastClickId !== null) {
            // shift donc on sel du editor.lastClickId a ici
            let pos_from = options.T_pos[options.lastClickId];
            let pos_to = options.T_pos[i];
            if (pos_from > pos_to) {
                let tmp = pos_from;
                pos_from = pos_to;
                pos_to = tmp;
            }

            for (let pos = pos_from; pos <= pos_to; pos++) {
                let id = options.T_id[pos];
                // toutes les fiches selectionnees
                if (!options.T_records[id]._selected) {
                    options.T_records[id]._selected = true;
                    $('#idEditDiapo_' + id, options.$container).addClass('selected');
                }
            }
        } else {
            if (!evt || !appCommons.utilsModule.is_ctrl_key(evt)) {
                // on deselectionne tout avant

                for (let id in options.T_records) {
                    // toutes les fiches selectionnees
                    if (options.T_records[id]._selected) {
                        options.T_records[id]._selected = false;
                        $('#idEditDiapo_' + id, options.$container).removeClass('selected');
                    }
                }
            }
            if (i >= 0) {
                options.T_records[i]._selected = !options.T_records[i]._selected;
                if (options.T_records[i]._selected) {
                    $('#idEditDiapo_' + i, options.$container).addClass('selected');
                } else {
                    $('#idEditDiapo_' + i, options.$container).removeClass('selected');
                }
            }
        }

        $('#TH_Opreview .PNB10').empty();

        let selected = $('#EDIT_FILM2 .diapo.selected');
        if (selected.length === 1) {

            let r = selected.attr('id').split('_').pop();
            _previewEdit(r);
        }

        options.lastClickId = i;
        _updateEditSelectedRecords(evt);
    }

    // ----------------------------------------------------------------------------------
// on a clique sur le 'ok' general : save
// ----------------------------------------------------------------------------------
    function edit_applyMultiDesc(evt) {
        let sendorder = '';
        let sendChuOrder = '';

        let t = [];

        if (options.textareaIsDirty && edit_validField(evt, 'ask_ok') === false) {
            return false;
        }

        let required_fields = _check_required();

        if (required_fields) {
            alert(localeService.t('some_required_fields'));
            return false;
        }

        $('#EDIT_ALL', options.$container).hide();

        $('#EDIT_WORKING', options.$container).show();

        for (let r in options.T_records) {
            let record_datas = {
                record_id: options.T_records[r].rid,
                metadatas: [],
                edit: 0,
                status: null
            };

            let editDirty = false;

            for (let f in options.T_records[r].fields) {
                if (!options.T_records[r].fields[f].isDirty()) {
                    continue;
                }

                editDirty = true;
                record_datas.edit = 1;

                record_datas.metadatas = record_datas.metadatas.concat(
                    options.T_records[r].fields[f].exportDatas()
                );
            }

            // les statbits
            let tsb = [];
            for (let n = 0; n < 64; n++) {
                tsb[n] = 'x';
            }
            let sb_dirty = false;
            for (let n in options.T_records[r].statbits) {
                if (options.T_records[r].statbits[n].dirty) {
                    tsb[63 - n] = options.T_records[r].statbits[n].value;
                    sb_dirty = true;
                }
            }

            if (sb_dirty || editDirty) {
                if (sb_dirty === true) {
                    record_datas.status = tsb.join('');
                }

                t.push(record_datas);
            }
        }

        let params = {
            mds: t,
            sbid: options.sbas_id,
            act: 'WORK',
            lst: $('#edit_lst').val(),
            act_option: 'SAVE' + options.what,
            // regbasprid: editor.regbasprid,
            ssel: options.ssel
        };
        if (options.newrepresent !== false) {
            params.newrepresent = options.newrepresent;
        }

        $.ajax({
            url: '../prod/records/edit/apply/',
            data: params,
            type: 'POST',
            success: function (data) {
                if (options.what === 'GRP' || options.what === 'SSEL') {
                    appEvents.emit('workzone.refresh', {
                        basketId: 'current'
                    });
                }
                $('#Edit_copyPreset_dlg').remove();
                $('#EDITWINDOW').hide();
                appEvents.emit('preview.doReload');
                return;
            }
        });

    }

    function edit_cancelMultiDesc(evt) {


        let dirty = false;

        evt.cancelBubble = true;
        if (evt.stopPropagation) {
            evt.stopPropagation();
        }

        if (options.curField >= 0) {
            if (options.textareaIsDirty && edit_validField(evt, 'ask_ok') === false) {
                return;
            }
        }

        for (let r in options.T_records) {
            for (let f in options.T_records[r].fields) {
                if ((dirty |= options.T_records[r].fields[f].isDirty())) {
                    break;
                }
            }
            for (let n in options.T_records[r].statbits) {
                if ((dirty |= options.T_records[r].statbits[n].dirty)) {
                    break;
                }
            }
        }
        if (!dirty || confirm(localeService.t('confirm_abandon'))) {
            $('#Edit_copyPreset_dlg').remove();
            $('#idFrameE .ww_content', options.$container).empty();

            // on reaffiche tous les thesaurus
            /*for (let i in p4.thesau.thlist)	// tous les thesaurus
             {
             let bid = p4.thesau.thlist[i].sbas_id;
             let e = document.getElementById('TH_T.' + bid + '.T');
             if (e)
             e.style.display = "";
             }*/
            // display all thesaurus
            $('.thesaurus-db-root').show();

            self.setTimeout("$('#EDITWINDOW').fadeOut();", 100);

        }
    }

    function _EditThesaurusSeeker(sbas_id) {
        this.jq = null;

        this.sbas_id = sbas_id;

        let zid = ('' + sbas_id).replace(new RegExp('\\.', 'g'), '\\.') + '\\.T';

        this.TH_P_node = $('#TH_P\\.' + zid, options.$container);
        this.TH_K_node = $('#TH_K\\.' + zid, options.$container);

        this._ctimer = null;

        this.search = function (txt) {
            // @TODO - external call
            if (this._ctimer) {
                clearTimeout(this._ctimer);
            }
            let js = "ETHSeeker.search_delayed('" + txt.replace("'", "\\'") + "');";
            this._ctimer = setTimeout(js, 125);
        };

        this.search_delayed = function (txt) {
            if (this.jq && typeof this.jq.abort === 'function') {
                this.jq.abort();
                this.jq = null;
            }
            txt = txt.replace("'", "\\'");
            let url = '/xmlhttp/openbranches_prod.h.php';
            let parms = {
                bid: this.sbas_id,
                lng: localeService.getLocale(),
                t: txt,
                mod: 'TREE',
                u: Math.random()
            };

            let me = this;

            this.jq = $.ajax({
                url: url,
                data: parms,
                type: 'POST',
                success: function (ret) {
                    me.TH_P_node.html('...');
                    me.TH_K_node.attr('class', 'h').html(ret);
                    me.jq = null;
                }
            });
        };

        this.openBranch = function (id, thid) {
            if (this.jq) {
                this.jq.abort();
                this.jq = null;
            }
            let url = '/xmlhttp/getterm_prod.h.php';
            let parms = {
                bid: this.sbas_id,
                lng: localeService.getLocale(),
                sortsy: 1,
                id: thid,
                typ: 'TH'
            };
            let me = this;


            this.jq = $.ajax({
                url: url,
                data: parms,
                success: function (ret) {
                    let zid = '#TH_K\\.' + id.replace(new RegExp('\\.', 'g'), '\\.');	// escape les '.' pour jquery
                    $(zid, options.$container).html(ret);
                    me.jq = null;
                }
            });
        };
    }

// onclick dans le thesaurus
    function edit_clickThesaurus(event) {
        let e;
        for (e = event.srcElement ? event.srcElement : event.target; e && ((!e.tagName) || (!e.id)); e = e.parentNode);

        if (e) {
            switch (e.id.substr(0, 4)) {
                case 'TH_P':	// +/- de deploiement de mot
                    edit_thesaurus_ow(e.id.substr(5));
                    break;
                default:
            }
        }
        return (false);
    }

// ondblclick dans le thesaurus
    function edit_dblclickThesaurus(event) {
        let e;
        for (e = event.srcElement ? event.srcElement : event.target; e && ((!e.tagName) || (!e.id)); e = e.parentNode);

        if (e) {
            switch (e.id.substr(0, 4)) {
                case 'TH_W':
                    if (options.curField >= 0) {
                        let w = $(e).text();
                        if (options.T_fields[options.curField].multi) {
                            $('#EditTextMultiValued', options.$container).val(w);
                            $('#EditTextMultiValued').trigger('keyup.maxLength');
                            _addMultivaluedField($('#EditTextMultiValued', options.$container).val(), null);
                        } else {
                            $editTextArea.val(w);
                            $('#idEditZTextArea').trigger('keyup.maxLength');
                            options.textareaIsDirty = true;
                        }
                    }
                    break;
                default:
            }
        }
        return (false);
    }

// on ouvre ou ferme une branche de thesaurus
    function edit_thesaurus_ow(id) {
        let o = document.getElementById('TH_K.' + id);
        if (o.className === 'o') {
            // on ferme
            o.className = 'c';
            document.getElementById('TH_P.' + id).innerHTML = '+';
            document.getElementById('TH_K.' + id).innerHTML = localeService.t('loading');
        } else if (o.className === 'c' || o.className === 'h') {
            // on ouvre
            o.className = 'o';
            document.getElementById('TH_P.' + id).innerHTML = '-';

            let t_id = id.split('.');
            let sbas_id = t_id[0];
            t_id.shift();
            let thid = t_id.join('.');
            let url = '/xmlhttp/getterm_prod.x.php';
            let parms = 'bid=' + sbas_id;
            parms += '&lng=' + localeService.getLocale();
            parms += '&sortsy=1';
            parms += '&id=' + thid;
            parms += '&typ=TH';

            ETHSeeker.openBranch(id, thid);
        }
        return (false);
    }


    function _toggleReplaceMode(ckRegExp) {


        if (ckRegExp.checked) {
            $('#EditSR_TX', options.$container).hide();
            $('#EditSR_RX', options.$container).show();
        } else {
            $('#EditSR_RX', options.$container).hide();
            $('#EditSR_TX', options.$container).show();
        }
    }

    function _setSizeLimits() {
        if (!$('#EDITWINDOW').is(':visible')) {
            return;
        }

        if ($('#EDIT_TOP').data('ui-resizable')) {
            $('#EDIT_TOP').resizable('option', 'maxHeight', ($('#EDIT_ALL').height() - $('#buttonEditing').height() - 10 - 160));
        }
        if ($('#divS_wrapper').data('ui-resizable')) {
            $('#divS_wrapper').resizable('option', 'maxWidth', ($('#EDIT_MID_L').width() - 270));
        }
        if ($('#EDIT_MID_R').data('ui-resizable')) {
            $('#EDIT_MID_R').resizable('option', 'maxWidth', ($('#EDIT_MID_R').width() + $('#idEditZone').width() - 240));
        }
    }

    function _hsplit1() {
        let el = $('#EDIT_TOP');
        if (el.length === 0) {
            return;
        }
        let h = $(el).outerHeight();
        $(el).height(h);
        let t = $(el).offset().top + h;

        $('#EDIT_MID', options.$container).css('top', (t) + 'px');
    }

    function _vsplit1() {
        $('#divS_wrapper').height('auto');

        let el = $('#divS_wrapper');
        if (el.length === 0) {
            return;
        }
        let a = $(el).width();
        el.width(a);

        $('#idEditZone', options.$container).css('left', (a + 20));
    }

    function _vsplit2() {
        let el = $('#EDIT_MID_R');
        if (el.length === 0) {
            return;
        }
        let a = $(el).width();
        el.width(a);
        let v = $('#EDIT_ALL').width() - a - 20;

        $('#EDIT_MID_L', options.$container).width(v);
    }

    function _activeField() {
        let meta_struct_id = parseInt(options.curField, 10);

        meta_struct_id = (isNaN(meta_struct_id) || meta_struct_id < 0) ? 'status' : meta_struct_id;

        $('#divS div.active, #divS div.hover').removeClass('active hover');
        $('#EditFieldBox_' + meta_struct_id).addClass('active');

        let cont = $('#divS');
        let calc = $('#EditFieldBox_' + meta_struct_id).offset().top - cont.offset().top;// hauteur relative par rapport au visible

        if (calc > cont.height() || calc < 0) {
            cont.scrollTop(calc + cont.scrollTop());
        }
    }

    function _sortCompareMetas(a, b) {
        if (typeof (a) !== 'object') {
            return (-1);
        }
        if (typeof (b) !== 'object') {
            return (1);
        }
        let na = a.getValue().toUpperCase();
        let nb = b.getValue().toUpperCase();
        if (na === nb) {
            return (0);
        }
        return (na < nb ? -1 : 1);
    }

    // ---------------------------------------------------------------------
// nettoie
// ---------------------------------------------------------------------
    function _cleanTags(string) {
        let chars2replace = [{
            f: '&',
            t: '&amp;'
        }, {
            f: '<',
            t: '&lt;'
        }, {
            f: '>',
            t: '&gt;'
        }];
        for (let c in chars2replace) {
            string = string.replace(RegExp(chars2replace[c].f, 'g'), chars2replace[c].t);
        }
        return string;
    }

    function _check_required(id_r, id_f) {
        let required_fields = false;

        if (typeof id_r === 'undefined') {
            id_r = false;
        }
        if (typeof id_f === 'undefined') {
            id_f = false;
        }

        for (let f in options.T_fields) {
            if (id_f !== false && f !== id_f) {
                continue;
            }

            let name = options.T_fields[f].name;

            if (!options.T_fields[f].required) {
                continue;
            }

            for (let r in options.T_records) {
                if (id_r !== false && r !== id_r) {
                    continue;
                }

                let elem = $('#idEditDiapo_' + r + ' .require_alert');

                elem.hide();

                if (!options.T_records[r].fields[f]) {
                    elem.show();
                    required_fields = true;
                } else {

                    let check_required = '';

                    // le champ existe dans la fiche
                    if (options.T_fields[f].multi) {
                        // champ multi : on compare la concat des valeurs
                        check_required = $.trim(options.T_records[r].fields[f].getSerializedValues());
                    } else if (options.T_records[r].fields[f].getValue()) {
                        check_required = $.trim(options.T_records[r].fields[f].getValue().getValue());
                    }


                    if (check_required === '') {
                        elem.show();
                        required_fields = true;
                    }
                }
            }

        }
        return required_fields;
    }


    function _edit_select_all() {
        $('#EDIT_FILM2 .diapo', options.$container).addClass('selected');

        for (let i in options.T_records) {
            options.T_records[i]._selected = true;
        }

        options.lastClickId = 1;

        _updateEditSelectedRecords(null);		// null : no evt available
    }

    // ---------------------------------------------------------------------------
// highlight la valeur en cours de saisie dans la liste des multi-valeurs
// appele par le onkeyup
// ---------------------------------------------------------------------------
    function _reveal_mval(value, vocabularyId) {
        let talt;

        if (typeof vocabularyId === 'undefined') {
            vocabularyId = null;
        }

        let textZone = $('#EditTextMultiValued');

        if (options.T_fields[options.curField].tbranch) {
            if (value !== '') {
                ETHSeeker.search(value);
            }
        }

        if (value !== '') {
            // 		let nsel = 0;
            for (let rec_i in options.T_records) {
                if (options.T_records[rec_i].fields[options.curField].hasValue(value, vocabularyId)) {
                    $('#idEditDiaButtonsP_' + rec_i).hide();
                    talt = sprintf(localeService.t('editDelSimple'), value);
                    $('#idEditDiaButtonsM_' + rec_i).show()
                        .attr('alt', talt)
                        .attr('Title', talt)
                        .unbind('click').bind('click', function () {
                        let indice = $(this).attr('id').split('_').pop();
                        _edit_diabutton(indice, 'del', value, vocabularyId);
                    });
                } else {
                    $('#idEditDiaButtonsM_' + rec_i).hide();
                    $('#idEditDiaButtonsP_' + rec_i).show();
                    talt = sprintf(localeService.t('editAddSimple'), value);
                    $('#idEditDiaButtonsP_' + rec_i).show().attr('alt', talt)
                        .attr('Title', talt)
                        .unbind('click').bind('click', function () {
                        let indice = $(this).attr('id').split('_').pop();
                        _edit_diabutton(indice, 'add', value, vocabularyId);
                    });
                }
            }
            $('.editDiaButtons', options.$container).show();
        }

        textZone.trigger('focus');
        return (true);
    }

    // ---------------------------------------------------------------------------
// on a clique sur le bouton 'supprimer' un mot dans le multi-val
// ---------------------------------------------------------------------------
    function _edit_delmval(value, VocabularyId) {
        let meta_struct_id = options.curField;		// le champ en cours d'editing

        for (let r = 0; r < options.T_records.length; r++) {
            if (!options.T_records[r]._selected) {
                continue;
            }

            options.T_records[r].fields[meta_struct_id].removeValue(value, VocabularyId);
        }

        _updateEditSelectedRecords(null);
    }

    // ---------------------------------------------------------------------------
// on a clique sur le bouton 'ajouter' un mot dans le multi-val
// ---------------------------------------------------------------------------
    function _addMultivaluedField(value, VocabularyId) {
        let meta_struct_id = options.curField;		// le champ en cours d'editing

        // on ajoute le mot dans tous les records selectionnes
        for (let r = 0; r < options.T_records.length; r++) {
            if (!options.T_records[r]._selected) {
                continue;
            }

            options.T_records[r].fields[meta_struct_id].addValue(value, false, VocabularyId);
        }

        _updateEditSelectedRecords(null);
    }

    // ---------------------------------------------------------------------------
    // on a clique sur une des multi-valeurs dans la liste
    // ---------------------------------------------------------------------------
    function _editMultivaluedField(mvaldiv, ival) {
        $(mvaldiv).parent().find('.hilighted').removeClass('hilighted');
        $(mvaldiv).addClass('hilighted');
        _reveal_mval(options.T_mval[ival].getValue(), options.T_mval[ival].getVocabularyId());
    }

    function _edit_diabutton(record_indice, act, value, vocabularyId) {
        let meta_struct_id = options.curField;		// le champ en cours d'editing
        if (act === 'del') {
            options.T_records[record_indice].fields[meta_struct_id].removeValue(value, vocabularyId);
        }

        if (act === 'add') {
            options.T_records[record_indice].fields[meta_struct_id].addValue(value, false, vocabularyId);
        }
        _updateCurrentMval(meta_struct_id, value, vocabularyId);
        _reveal_mval(value, vocabularyId);

    }

    // ---------------------------------------------------------------------------
// change de champ (avec les fleches autour du nom champ)
// ---------------------------------------------------------------------------
    // edit_chgFld
    function fieldNavigate(evt, dir) {
        let current_field = $('#divS .edit_field.active');
        if (current_field.length === 0) {
            current_field = $('#divS .edit_field:first');
            current_field.trigger('click');
        } else {
            if (dir >= 0) {
                current_field.next().trigger('click');
            } else {
                current_field.prev().trigger('click');
            }
        }
    }


    // ---------------------------------------------------------------------------
// on a clique sur le peudo champ 'status'
// ---------------------------------------------------------------------------
    /*function edit_mdwn_status(evt) {
     if (!editor.textareaIsDirty || edit_validField(evt, "ask_ok") == true)
     _editStatus(evt);
     evt.cancelBubble = true;
     if (evt.stopPropagation)
     evt.stopPropagation();
     return(false);
     }*/


    function _onTextareaKeyDown(event) {
        let $el = $(event.currentTarget);
        let cancelKey = false;

        switch (event.keyCode) {
            case 13:
            case 10:
                if (options.T_fields[options.curField].type === 'date') {
                    cancelKey = true;
                }
                break;
            default:
        }

        if (cancelKey) {
            event.cancelBubble = true;
            if (event.stopPropagation) {
                event.stopPropagation();
            }
            return (false);
        }
        return (true);
    }

    // ----------------------------------------------------------------------------------------------
// des events sur le textarea pour tracker la selection (chercher dans le thesaurus...)
// ----------------------------------------------------------------------------------------------
    function _onTextareaMouseDown(evt) {
        evt.cancelBubble = true;
        return (true);
    }

    // mouse up textarea
    function _onTextareaMouseUp(event, obj) {
        let $el = $(event.currentTarget);
        let value = $el.val();

        if (options.T_fields[options.curField].tbranch) {
            if (value !== '') {
                ETHSeeker.search(value);
            }
        }
        return (true);
    }

    // key up textarea
    function _onTextareaKeyUp(event, obj) {
        let $el = $(event.currentTarget);
        let cancelKey = false;
        let o;
        switch (event.keyCode) {
            case 27:	// esc : on restore la valeur avant editing
                // 			$("#btn_cancel", editor.$container).parent().css("backgroundColor", "#000000");
                edit_validField(event, 'cancel');
                // 			self.setTimeout("document.getElementById('btn_cancel').parentNode.style.backgroundColor = '';", 100);
                cancelKey = true;
                break;
            default:
        }

        if (cancelKey) {
            event.cancelBubble = true;
            if (event.stopPropagation) {
                event.stopPropagation();
            }
            return (false);
        }
        if (!options.textareaIsDirty && ($editTextArea.val() !== options.fieldLastValue)) {
            options.textareaIsDirty = true;
        }

        let s = $el.val(); // obj.value;
        if (options.T_fields[options.curField].tbranch) {
            if (s !== '') {
                ETHSeeker.search(s);
            }
        }
        return (true);
    }

    appEvents.listenAll({
        'recordEditor.start': startThisEditing
    });


    return {
        initialize: initialize,
        onGlobalKeydown: onGlobalKeydown,
        startThisEditing: startThisEditing,
        setRegDefault: setRegDefault,
        skipImage: skipImage,
        edit_clkstatus: edit_clkstatus,
        edit_validField: edit_validField,
        edit_applyMultiDesc: edit_applyMultiDesc,
        edit_cancelMultiDesc: edit_cancelMultiDesc,
        edit_clickThesaurus: edit_clickThesaurus,
        edit_dblclickThesaurus: edit_dblclickThesaurus,
        edit_thesaurus_ow: edit_thesaurus_ow
    };
};
export default recordEditorService;
