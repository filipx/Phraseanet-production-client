import $ from 'jquery';
import ui from '../ui';
import notify from '../notify';

const user = (translations) => {

    const onUserDisconnect = (...data) => {
        console.log('user disconnected yeap', data);
    }


    const subscribeToEvents = {
        'user.disconnected': onUserDisconnect
    }

    const language = translations;
    const disconnected = () => {
        ui(language).showModal('disconnected', {title: language.serverDisconnected});
    }

    const manageSession = (...params) => {
        let [data, showMessages] = params;

        if (typeof(showMessages) == "undefined")
            showMessages = false;

        if (data.status == 'disconnected' || data.status == 'session') {
            disconnected();
            return false;
        }
        if (showMessages) {
            //notify().appendNotifications(data.notifications);
            // @todo put into notify component
            /*var box = $('#notification_box');
            box.empty().append(data.notifications);

            if (box.is(':visible'))
                fix_notification_height();

            if ($('.notification.unread', box).length > 0) {
                var trigger = $('#notification_trigger');
                $('.counter', trigger)
                    .empty()
                    .append($('.notification.unread', box).length);
                $('.counter', trigger).css('visibility', 'visible');

            }
            else
                $('#notification_trigger .counter').css('visibility', 'hidden').empty();*/

            /* moved in basket if (data.changed.length > 0) {
                var current_open = $('.SSTT.ui-state-active');
                var current_sstt = current_open.length > 0 ? current_open.attr('id').split('_').pop() : false;

                var main_open = false;
                for (var i = 0; i != data.changed.length; i++) {
                    var sstt = $('#SSTT_' + data.changed[i]);
                    if (sstt.size() === 0) {
                        if (main_open === false) {
                            $('#baskets .bloc').animate({'top': 30}, function () {
                                $('#baskets .alert_datas_changed:first').show()
                            });
                            main_open = true;
                        }
                    }
                    else {
                        if (!sstt.hasClass('active'))
                            sstt.addClass('unread');
                        else {
                            $('.alert_datas_changed', $('#SSTT_content_' + data.changed[i])).show();
                        }
                    }
                }
            }*/
            // @todo: to be moved
            if ('' !== $.trim(data.message)) {
                if ($('#MESSAGE').length === 0)
                    $('body').append('<div id="#MESSAGE"></div>');
                $('#MESSAGE')
                    .empty()
                    .append(data.message + '<div style="margin:20px;"><input type="checkbox" class="dialog_remove" />' + language.hideMessage + '</div>')
                    .attr('title', 'Global Message')
                    .dialog({
                        autoOpen: false,
                        closeOnEscape: true,
                        resizable: false,
                        draggable: false,
                        modal: true,
                        close: function () {
                            if ($('.dialog_remove:checked', $(this)).length > 0)
                                setTemporaryPref('message', 0);
                        }
                    })
                    .dialog('open');
            }
        }
        return true;
    }

    return { manageSession, subscribeToEvents };
}

export default user;
