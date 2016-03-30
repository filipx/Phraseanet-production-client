import $ from 'jquery';
import {cleanTags} from '../../utils/utils';

const presetsModule = (services) => {
    const {configService, localeService, appEvents} = services;
    const url = configService.get('baseUrl');
    let $container = null;
    let parentOptions = {};

    const initialize = (options) => {
        let initWith = {$container, parentOptions} = options;
        initPresetsModal();
    };

    const initPresetsModal = () => {
        let buttons = {};
        buttons[localeService.t('valider')] = function (event) {
            $(this).dialog('close');
            appEvents.emit('recordEditor.submitAllChanges', {event});
        };
        buttons[localeService.t('annuler')] = function (event) {
            $(this).dialog('close');
            appEvents.emit('recordEditor.cancelAllChanges', {event});
        };

        $('#EDIT_CLOSEDIALOG', $container).dialog({
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
                        name: parentOptions.T_fields[val].name,
                        value: []
                    };
                    var tval;
                    if (parentOptions.T_fields[val].multi) {
                        field.value = $.map(
                            parentOptions.T_fields[val]._value.split(';'),
                            function (obj, idx) {
                                return obj.trim();
                            }
                        );
                    } else {
                        field.value = [parentOptions.T_fields[val]._value.trim()];
                    }
                    fields.push(field);
                }
            });

            $.ajax({
                type: 'POST',
                url: `${url}prod/records/edit/presets`,
                data: {
                    sbas_id: parentOptions.sbas_id,
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

        $('#Edit_copyPreset_dlg', $container).dialog({
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

        $.ajax({
            type: 'GET',
            url: `${url}prod/records/edit/presets`,
            data: {
                sbas_id: parentOptions.sbas_id
            },
            dataType: 'json',
            success: function (data, textStatus) {
                _preset_paint(data);
            }
        });

        $('#TH_Opresets button.adder').bind('click', function () {
            _preset_copy();
        });
    }

    function _preset_paint(data) {
        $('.EDIT_presets_list', parentOptions.$container).html(data.html);
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
        for (let i in parentOptions.T_fields) {
            if (parentOptions.T_fields[i]._status === 1) {
                if (parentOptions.T_fields[i].readonly) {
                    continue;
                }
                var c = parentOptions.T_fields[i]._value === '' ? '' : 'checked="1"';
                var v = parentOptions.T_fields[i]._value;
                html += '<div><label class="checkbox" for="new_preset_' + parentOptions.T_fields[i].name + '"><input type="checkbox" class="checkbox" id="new_preset_' + parentOptions.T_fields[i].name + '" value="' + i + '" ' + c + '/>' + '<b>' + parentOptions.T_fields[i].label + ' : </b></label> ';
                html += cleanTags(parentOptions.T_fields[i]._value) + '</div>';
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

    function _preset_delete(presetId, li) {
        $.ajax({
            type: 'DELETE',
            url: `${url}prod/records/edit/presets/${presetId}`,
            data: {},
            dataType: 'json',
            success: function (data, textStatus) {
                li.remove();
            }
        });
    }

    function _preset_load(presetId) {
        $.ajax({
            type: 'GET',
            url: `${url}prod/records/edit/presets/${presetId}`,
            data: {},
            dataType: 'json',
            success: function (data, textStatus) {
                if ($('#Edit_copyPreset_dlg').data('ui-dialog')) {
                    $('#Edit_copyPreset_dlg').dialog('close');
                }

                for (let i in parentOptions.T_fields) {
                    parentOptions.T_fields[i].preset = null;
                    if (typeof (data.fields[parentOptions.T_fields[i].name]) !== 'undefined') {
                        parentOptions.T_fields[i].preset = data.fields[parentOptions.T_fields[i].name];
                    }
                }
                for (let r = 0; r < parentOptions.T_records.length; r++) {
                    if (!parentOptions.T_records[r]._selected) {
                        continue;
                    }

                    for (let i in parentOptions.T_fields) {
                        if (parentOptions.T_fields[i].preset !== null) {
                            for (let val in parentOptions.T_fields[i].preset) {
                                // fix : some (old, malformed) presets values may need trim()
                                parentOptions.T_records[r].fields['' + i].addValue(parentOptions.T_fields[i].preset[val].trim(), false, null);
                            }
                        }
                    }
                }
                appEvents.emit('recordEditor.onUpdateFields');
                // _updateEditSelectedRecords();
            }
        });
    }

    return {initialize};
};
export default presetsModule;
