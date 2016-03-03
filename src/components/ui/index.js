import $ from 'jquery';
import toolbar from './toolbar';
import mainMenu from './mainMenu';
const ui = (services) => {
    const {configService, localeService, appEvents} = services;
    let activeZone = false;

    const initialize = () => {
        // init state navigation

        toolbar(services).initialize();
        mainMenu(services).initialize();
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

        if(typeof(p4.Alerts) == "undefined") {
            alert(localeService.t('serverDisconnected'));
            self.location.replace(self.location.href);
        }
        else {
            p4.Alerts(options.title, content, callback);
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

        if (p4.preview.open)
            recordPreviewModule.resizePreview();

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
        'ui.linearizeUi': linearizeUi
    });


    return { initialize, showModal, activeZoning, resizeAll };
}

export default ui;
