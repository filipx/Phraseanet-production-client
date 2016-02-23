import $ from 'jquery';
import toolbar from './toolbar';
const ui = (services) => {
    const {configService, localeService, appEvents} = services;

    const initialize = () => {
        toolbar(services).initialize();
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



    return { initialize, showModal };
}

export default ui;
