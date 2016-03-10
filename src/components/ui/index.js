import $ from 'jquery';
import toolbar from './toolbar';
import mainMenu from './mainMenu';
import keyboard from './keyboard';
import editRecordService from '../record/edit';
import exportRecord from '../record/export';
import addToBasket from '../record/addToBasket';
import removeFromBasket from '../record/removeFromBasket';
import printRecord from '../record/print';
import previewRecordService from '../record/recordPreview';
import Alerts from '../utils/alert';
import uploader from '../uploader';
const ui = (services) => {
    const {configService, localeService, appEvents} = services;
    let activeZone = false;


    const initialize = () => {
        // init state navigation
        // records and baskets actions in global interface:
        exportRecord(services).initialize();
        addToBasket(services).initialize();
        removeFromBasket(services).initialize();
        printRecord(services).initialize();


        let editRecord = editRecordService(services);
        editRecord.initialize();

        let previewRecord = previewRecordService(services);

        let previewIsOpen = false;
        previewRecord.getPreviewOptionStream().subscribe(function (data) {
                previewIsOpen = data.object.open;
                console.log('previewRecordService Next: ', data);
            },
            function (err) {
                console.log('previewRecordService Error: %s', err);
            },
            function () {
                console.log('previewRecordService Completed');
            });
        previewRecord.initialize();


        // add interface components:
        toolbar(services).initialize();
        mainMenu(services).initialize();
        keyboard(services).initialize();
        uploader(services).initialize();


        // main menu > help context menu
        $('.shortcuts-trigger').bind('click', function () {
            keyboard(services).openModal();
        });

        $('body').on('keydown', function (event) {
            let specialKeyState = {
                isCancelKey: false,
                isShortcutKey: false
            };

            if ($('#MODALDL').is(':visible')) {
                switch (event.keyCode) {
                    case 27:
                        // hide download
                        commonModule.hideOverlay(2);
                        $('#MODALDL').css({
                            'display': 'none'
                        });
                        break;
                }
            }
            else {
                if ($('#EDITWINDOW').is(':visible')) {
                    // access to editor instead of edit modal
                    //specialKeyState = editRecord.onGlobalKeydown(event, specialKeyState);
                }
                else {
                    if (previewIsOpen) {
                        specialKeyState = previewRecord.onGlobalKeydown(event, specialKeyState);
                    }
                    else {
                        if ($('#EDIT_query').hasClass('focused'))
                            return true;

                        if ($('.overlay').is(':visible'))
                            return true;

                        if ($('.ui-widget-overlay').is(':visible'))
                            return true;

                        switch (this.appUi.getActiveZone()) {
                            case 'rightFrame':
                                switch (event.keyCode) {
                                    case 65:	// a
                                        if (utilsModule.is_ctrl_key(event)) {
                                            $('.tools .answer_selector.all_selector').trigger('click');
                                            specialKeyState.isCancelKey = specialKeyState.isShortcutKey = true;
                                        }
                                        break;
                                    case 80://P
                                        if (utilsModule.is_ctrl_key(event)) {
                                            _onOpenPrintModal("lst=" + p4.Results.Selection.serialize());
                                            specialKeyState.isCancelKey = specialKeyState.isShortcutKey = true;
                                        }
                                        break;
                                    case 69://e
                                        if (utilsModule.is_ctrl_key(event)) {
                                            openRecordEditor('IMGT', p4.Results.Selection.serialize());
                                            specialKeyState.isCancelKey = specialKeyState.isShortcutKey = true;
                                        }
                                        break;
                                    case 40:	// down arrow
                                        $('#answers').scrollTop($('#answers').scrollTop() + 30);
                                        specialKeyState.isCancelKey = specialKeyState.isShortcutKey = true;
                                        break;
                                    case 38:	// down arrow
                                        $('#answers').scrollTop($('#answers').scrollTop() - 30);
                                        specialKeyState.isCancelKey = specialKeyState.isShortcutKey = true;
                                        break;
                                    case 37://previous page
                                        $('#PREV_PAGE').trigger('click');
                                        specialKeyState.isShortcutKey = true;
                                        break;
                                    case 39://previous page
                                        $('#NEXT_PAGE').trigger('click');
                                        specialKeyState.isShortcutKey = true;
                                        break;
                                    case 9://tab
                                        if (!utilsModule.is_ctrl_key(event) && !$('.ui-widget-overlay').is(':visible') && !$('.overlay_box').is(':visible')) {
                                            document.getElementById('EDIT_query').focus();
                                            specialKeyState.isCancelKey = specialKeyState.isShortcutKey = true;
                                        }
                                        break;
                                }
                                break;


                            case 'idFrameC':
                                switch (event.keyCode) {
                                    case 65:	// a
                                        if (utilsModule.is_ctrl_key(event)) {
                                            p4.WorkZone.Selection.selectAll();
                                            specialKeyState.isCancelKey = specialKeyState.isShortcutKey = true;
                                        }
                                        break;
                                    case 80://P
                                        if (utilsModule.is_ctrl_key(event)) {
                                            _onOpenPrintModal("lst=" + p4.WorkZone.Selection.serialize());
                                            specialKeyState.isCancelKey = specialKeyState.isShortcutKey = true;
                                        }
                                        break;
                                    case 69://e
                                        if (utilsModule.is_ctrl_key(event)) {
                                            openRecordEditor('IMGT', p4.WorkZone.Selection.serialize());
                                            specialKeyState.isCancelKey = specialKeyState.isShortcutKey = true;
                                        }
                                        break;
                                    //						case 46://del
                                    //								_deleteRecords(p4.Results.Selection.serialize());
                                    //								specialKeyState.isCancelKey = true;
                                    //							break;
                                    case 40:	// down arrow
                                        $('#baskets div.bloc').scrollTop($('#baskets div.bloc').scrollTop() + 30);
                                        specialKeyState.isCancelKey = specialKeyState.isShortcutKey = true;
                                        break;
                                    case 38:	// down arrow
                                        $('#baskets div.bloc').scrollTop($('#baskets div.bloc').scrollTop() - 30);
                                        specialKeyState.isCancelKey = specialKeyState.isShortcutKey = true;
                                        break;
                                    //								case 37://previous page
                                    //									$('#PREV_PAGE').trigger('click');
                                    //									break;
                                    //								case 39://previous page
                                    //									$('#NEXT_PAGE').trigger('click');
                                    //									break;
                                    case 9://tab
                                        if (!utilsModule.is_ctrl_key(event) && !$('.ui-widget-overlay').is(':visible') && !$('.overlay_box').is(':visible')) {
                                            document.getElementById('EDIT_query').focus();
                                            specialKeyState.isCancelKey = specialKeyState.isShortcutKey = true;
                                        }
                                        break;
                                }
                                break;


                            case 'mainMenu':
                                break;


                            case 'headBlock':
                                break;

                            default:
                                break;

                        }
                    }
                }
            }

            if (!$('#EDIT_query').hasClass('focused') && event.keyCode !== 17) {

                if ($('#keyboard-dialog.auto').length > 0 && specialKeyState.isShortcutKey) {
                    keyboard(services).openModal();
                }
            }
            if (specialKeyState.isCancelKey) {
                event.cancelBubble = true;
                if (event.stopPropagation)
                    event.stopPropagation();
                return(false);
            }
            return(true);
        });
    };

    const hideOverlay = (n) => {
        var div = "OVERLAY";
        if (typeof(n) != "undefined")
            div += n;
        $('#' + div).hide().remove();
    }

    const showModal = (cas, options) => {

        var content = '';
        var callback = null;
        var button = {
            "OK": function (e) {
                hideOverlay(3);
                $(this).dialog("close");
                return;
            }};
        var escape = true;
        var onClose = function () {
        };

        switch (cas) {
            case 'timeout':
                content = localeService.t('serverTimeout');
                break;
            case 'error':
                content = localeService.t('serverError');
                break;
            case 'disconnected':
                content = localeService.t('serverDisconnected');
                escape = false;
                callback = function (e) {
                    self.location.replace(self.location.href);
                };
                break;
            default:
                break;
        }

        if(typeof(Alerts) == "undefined") {
            alert(localeService.t('serverDisconnected'));
            self.location.replace(self.location.href);
        }
        else {
            Alerts(options.title, content, callback);
        }
        return;
    }

    const getActiveZone = () => {
        return activeZone;
    }
    const setActiveZone = (zoneId) => {
        activeZone = zoneId;
        return activeZone;
    }

    const activeZoning = () => {
        $('#idFrameC, #rightFrame').bind('mousedown', function (event) {
            var old_zone = getActiveZone();
            setActiveZone($(this).attr('id') );
            if (getActiveZone() !== old_zone && getActiveZone() !== 'headBlock') {
                $('.effectiveZone.activeZone').removeClass('activeZone');
                $('.effectiveZone', this).addClass('activeZone');//.flash('#555555');
            }
            $('#EDIT_query').blur();
        });
        $('#rightFrame').trigger('mousedown');
    }

    const resizeAll = () => {
        var body = $('body');
        bodySize.y = body.height();
        bodySize.x = body.width();

        var headBlockH = $('#headBlock').outerHeight();
        var bodyY = bodySize.y - headBlockH - 2;
        var bodyW = bodySize.x - 2;
        //$('#desktop').height(bodyY).width(bodyW);

        appEvents.emit('preview.doResize');

        if ($('#idFrameC').data('ui-resizable')) {
            $('#idFrameC').resizable('option', 'maxWidth', (480));
            $('#idFrameC').resizable('option', 'minWidth', 300);
        }

        answerSizer();
        linearizeUi();


    }
    const answerSizer = () => {
        var el = $('#idFrameC').outerWidth();
        if (!$.support.cssFloat) {
            // $('#idFrameC .insidebloc').width(el - 56);
        }
        var widthA = Math.round(bodySize.x - el - 10);
        $('#rightFrame').width(widthA);
        $('#rightFrame').css('left', $('#idFrameC').width());

    }
    const linearizeUi = () => {
        var list = $('#answers .list');
        if (list.length > 0) {
            var fllWidth = $('#answers').innerWidth();
            fllWidth -= 16;

            var stdWidth = 460;
            var diff = 28;
            var n = Math.round(fllWidth / (stdWidth));
            var w = Math.floor(fllWidth / n) - diff;
            if (w < 360 && n > 1)
                w = Math.floor(fllWidth / (n - 1)) - diff;
            $('#answers .list').width(w);
        }
        else {

            var minMargin = 5;
            var margin = 0;
            var el = $('#answers .diapo:first');
            var diapoWidth = el.outerWidth() + (minMargin * 2);
            var fllWidth = $('#answers').innerWidth();
            fllWidth -= 26;

            var n = Math.floor(fllWidth / (diapoWidth));

            margin = Math.floor((fllWidth % diapoWidth) / (2 * n));
            margin = margin + minMargin;

            $('#answers .diapo').css('margin', '5px ' + (margin) + 'px');
        }

    }

    appEvents.listenAll({
        'ui.resizeAll': resizeAll,
        'ui.answerSizer': answerSizer,
        'ui.linearizeUi': linearizeUi
    });


    return { initialize, showModal, activeZoning, getActiveZone, resizeAll };
}

export default ui;
