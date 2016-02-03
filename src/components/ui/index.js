import $ from 'jquery';

const ui = (translations) => {
    const language = translations;


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
                content = language.serverTimeout;
                break;
            case 'error':
                content = language.serverError;
                break;
            case 'disconnected':
                content = language.serverDisconnected;
                escape = false;
                callback = function (e) {
                    self.location.replace(self.location.href);
                };
                break;
            default:
                break;
        }

        if(typeof(p4.Alerts) == "undefined") {
            alert(language.serverDisconnected);
            self.location.replace(self.location.href);
        }
        else {
            p4.Alerts(options.title, content, callback);
        }
        return;
    }



    return { showModal };
}

export default ui;
