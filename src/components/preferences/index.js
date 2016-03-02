import * as appCommons from 'phraseanet-common';

const preferences = (services) => {
    const {configService, localeService, appEvents} = services;
    const initialize = (options = {}) => {
        const {$container} = options;

        $container.on('click', '.open-preferences', (event) => {
            event.preventDefault();
            openModal(event);
        });
        $container.on('click', '.preferences-options-submit', (event) => {
            event.preventDefault();
            submitState();
        });
        $container.on('change', '.preferences-options-start-page', (event) => {
            event.preventDefault();
            setInitialStateOptions();
        });

        $('#nperpage_slider').slider({
            value: parseInt($('#nperpage_value').val()),
            min: 10,
            max: 100,
            step: 10,
            slide: function (event, ui) {
                $('#nperpage_value').val(ui.value);
            },
            stop: function (event, ui) {
                appCommons.userModule.setPref('images_per_page', $('#nperpage_value').val());
            }
        });
        $('#sizeAns_slider').slider({
            value: parseInt($('#sizeAns_value').val()),
            min: 90,
            max: 270,
            step: 10,
            slide: function (event, ui) {
                $('#sizeAns_value').val(ui.value);
            },
            stop: function (event, ui) {
                appCommons.userModule.setPref('images_size', $('#sizeAns_value').val());
            }
        });
        $('#backcolorpickerHolder').ColorPicker({
            flat: true,
            color: '404040',
            livePreview: false,
            eventName: 'mouseover',
            onSubmit: function (hsb, hex, rgb, el) {
                var back_hex = '';
                var unactive = '';


                if (hsb.b >= 50) {
                    back_hex = '000000';

                    var sim_b = 0.1 * hsb.b;
                }
                else {
                    back_hex = 'FFFFFF';

                    var sim_b = 100 - 0.1 * (100 - hsb.b);
                }

                var sim_b = 0.1 * hsb.b;

                var sim_rgb = utilsModule.hsl2rgb(hsb.h, hsb.s, sim_b);
                var sim_hex = utilsModule.RGBtoHex(sim_rgb.r, sim_rgb.g, sim_rgb.b);

                appCommons.userModule.setPref('background-selection', hex);
                appCommons.userModule.setPref('background-selection-disabled', sim_hex);
                appCommons.userModule.setPref('fontcolor-selection', back_hex);

                $('style[title=color_selection]').empty();

                var datas = '.diapo.selected,#reorder_box .diapo.selected, #EDIT_ALL .diapo.selected, .list.selected, .list.selected .diapo' +
                    '{' +
                    '    COLOR: #' + back_hex + ';' +
                    '    BACKGROUND-COLOR: #' + hex + ';' +
                    '}';
                $('style[title=color_selection]').empty().text(datas);
            }
        });
        $('#backcolorpickerHolder').find('.colorpicker_submit').append($('#backcolorpickerHolder .submiter')).bind('click', function () {
            $(this).highlight('#CCCCCC');
        });
        $('#look_box .tabs').tabs();
    }

// look_box
    function setInitialStateOptions() {
        var el = $('#look_box_settings select[name=start_page]');

        switch (el.val()) {
            case "LAST_QUERY":
            case "PUBLI":
            case "HELP":
                $('#look_box_settings input[name=start_page_value]').hide();
                break;
            case "QUERY":
                $('#look_box_settings input[name=start_page_value]').show();
                break;
        }
    }

    function submitState() {
        var el = $('#look_box_settings select[name=start_page]');
        var val = el.val();


        var start_page_query = $('#look_box_settings input[name=start_page_value]').val();

        if (val === 'QUERY') {
            appCommons.userModule.setPref('start_page_query', start_page_query);
        }

        appCommons.userModule.setPref('start_page', val);

    }


    function openModal(event) {
        $("#look_box").dialog({
            closeOnEscape: true,
            resizable: false,
            width: 450,
            height: 500,
            modal: true,
            draggable: false,
            overlay: {
                backgroundColor: '#000',
                opacity: 0.7
            }
        }).dialog('open');
    }
    return {
        initialize,
        openModal
    }
};

export default preferences;
