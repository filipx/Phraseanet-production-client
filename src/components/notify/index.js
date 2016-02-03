import $ from 'jquery';
import user from '../user/index.js';


const notifyUiComponent = () => {
    const $notificationBoxContainer = $('#notification_box');

    const bindEvents = () => {
        console.log('>>>> bind events')
        $('#notification_trigger').bind('mousedown', function (event) {
            event.stopPropagation();
            if ($(this).hasClass('open')) {
                $notificationBoxContainer.hide();
                $(this).removeClass('open');
                clear_notifications();
            }
            else {
                $notificationBoxContainer.show();

                fix_notification_height();

                $(this).addClass('open');
                read_notifications();
            }
        });

        $(document).bind('mousedown', function () {
            var not_trigger = $('#notification_trigger');
            if (not_trigger.hasClass('open'))
                not_trigger.trigger('click');

            if ($('#notification_trigger').hasClass('open')) {
                $notificationBoxContainer.hide();
                $('#notification_trigger').removeClass('open');
                clear_notifications();
            }
        });

        $notificationBoxContainer
            .on('mousedown', (event) => {
                event.stopPropagation();
            })
            .on('mouseover', '.notification', (event) => {
                    $(event.currentTarget).addClass('hover');
            })
            .on('mouseout', '.notification', (event) => {
                    $(event.currentTarget).removeClass('hover');
            })
            .on('click', '.notification__print-action', (event) => {
                event.preventDefault();
                const $el = $(event.currentTarget);
                const page = $el.data('page');
                print_notifications(page);
            });

        $(window).bind('resize', function () {
            set_notif_position();
        });
        set_notif_position();

    }
    const addNotifications = (notificationContent) => {
        // var box = $('#notification_box');
        $notificationBoxContainer.empty().append(notificationContent);

        if ($notificationBoxContainer.is(':visible'))
            fix_notification_height();

        if ($('.notification.unread', $notificationBoxContainer).length > 0) {
            var trigger = $('#notification_trigger');
            $('.counter', trigger)
                .empty()
                .append($('.notification.unread', $notificationBoxContainer).length);
            $('.counter', trigger).css('visibility', 'visible');

        }
        else
            $('#notification_trigger .counter').css('visibility', 'hidden').empty();
    }

    const fix_notification_height = () => {
        //var box = $('#notification_box');
        var not = $('.notification', $notificationBoxContainer);
        var n = not.length;
        var not_t = $('.notification_title', $notificationBoxContainer);
        var n_t = not_t.length;

        var h = not.outerHeight() * n + not_t.outerHeight() * n_t;
        h = h > 350 ? 350 : h;

        $notificationBoxContainer.stop().animate({height: h});
    }

    const set_notif_position = () => {
        var trigger = $('#notification_trigger');
        if (trigger.length === 0)
            return;
        $notificationBoxContainer.css({
            'left': Math.round(trigger.offset().left - 1)
        });
    }
    const print_notifications = (page) => {

        page = parseInt(page);
        var buttons = {};

        buttons[language.fermer] = function () {
            $('#notifications-dialog').dialog('close');
        };

        if ($('#notifications-dialog').length === 0)
            $('body').append('<div id="notifications-dialog" class="loading"></div>');

        $('#notifications-dialog')
            .dialog({
                title: language.notifications,
                autoOpen: false,
                closeOnEscape: true,
                resizable: false,
                draggable: false,
                modal: true,
                width: 500,
                height: 400,
                overlay: {
                    backgroundColor: '#000',
                    opacity: 0.7
                },
                close: function (event, ui) {
                    $('#notifications-dialog').dialog('destroy').remove();
                }
            }).dialog('option', 'buttons', buttons)
            .dialog('open');


        $.ajax({
            type: "GET",
            url: "/user/notifications/",
            dataType: 'json',
            data: {
                page: page
            },
            error: function (data) {
                $('#notifications-dialog').removeClass('loading');
            },
            timeout: function (data) {
                $('#notifications-dialog').removeClass('loading');
            },
            success: function (data) {
                $('#notifications-dialog').removeClass('loading');
                var cont = $('#notifications-dialog');

                if (page === 0)
                    cont.empty();
                else
                    $('.notification_next', cont).remove();

                let i = 0;
                for (i in data.notifications) {
                    var id = 'notif_date_' + i;
                    var date_cont = $('#' + id);
                    if (date_cont.length === 0) {
                        cont.append('<div id="' + id + '"><div class="notification_title">' + data.notifications[i].display + '</div></div>');
                        date_cont = $('#' + id);
                    }

                    let j = 0;
                    for (j in data.notifications[i].notifications) {
                        var loc_dat = data.notifications[i].notifications[j];
                        var html = '<div style="position:relative;" id="notification_' + loc_dat.id + '" class="notification">' +
                            '<table style="width:100%;" cellspacing="0" cellpadding="0" border="0"><tr><td style="width:25px;">' +
                            loc_dat.icon +
                            '</td><td>' +
                            '<div style="position:relative;" class="' + loc_dat.classname + '">' +
                            loc_dat.text + ' <span class="time">' + loc_dat.time + '</span></div>' +
                            '</td></tr></table>' +
                            '</div>';
                        date_cont.append(html);
                    }
                }

                var next_ln = $.trim(data.next);

                if (next_ln !== '') {
                    cont.append('<div class="notification_next">' + next_ln + '</div>');
                }

//			'<div style="position:relative;" id="notification_'.$row['id'].'" class="notification '.($row['unread'] == '1' ? 'unread':'').'">'.
//			'<table style="width:100%;" cellspacing="0" cellpadding="0" border="0"><tr><td style="width:25px;">'.
//			'<img src="'.$this->pool_classes[$row['type']]->icon_url().'" style="vertical-align:middle;width:16px;margin:2px;" />'.
//			'</td><td>'.
//			'<div style="position:relative;" class="'.$data['class'].'">'.
//				$data['text'].' <span class="time"></span></div>'.
//			'</td></tr></table>'.
//			'</div>'


            }
        });

    }

    const read_notifications = () => {
        var notifications = [];

        $('#notification_box .unread').each(function () {
            notifications.push($(this).attr('id').split('_').pop());
        });

        $.ajax({
            type: "POST",
            url: "/user/notifications/read/",
            data: {
                notifications: notifications.join('_')
            },
            success: function (data) {
                $('#notification_trigger .counter').css('visibility', 'hidden').empty();
            }
        });
    }

    const clear_notifications = () => {
        var unread = $('#notification_box .unread');

        if (unread.length === 0)
            return;

        unread.removeClass('unread');
        $('#notification_trigger .counter').css('visibility', 'hidden').empty();
    }

    return {
        bindEvents,
        addNotifications
    }
}



const notify = (translations) => {
    const language = translations;
    const defaultPollingTime =  10000;
    const defaultConfig = {
        url: null,
        moduleId: null,
        userId: null,
        _isValid: false
    };

    const createNotifier = (state) => {
        if (state === undefined) {
            return defaultConfig;
        }
        if (state.url === undefined) {
            return defaultConfig;
        }

        return Object.assign({}, defaultConfig, {
            url: state.url,
            moduleId: state.moduleId,
            userId: state.userId,
            _isValid: true
        });
    };

    const bindEvents = notifyUiComponent().bindEvents;
    const appendNotifications = (content) => notifyUiComponent().addNotifications(content);

    const isValid = (notificationInstance) => notificationInstance._isValid || false;

    const poll = (notificationInstance) => {
        return $.ajax({
            type: 'POST',
            url: notificationInstance.url,
            dataType: 'json',
            data: {
                module: notificationInstance.moduleId,
                usr: notificationInstance.userId
            },
            error: () => {
                window.setTimeout(poll, defaultPollingTime, notificationInstance);
            },
            timeout: () => {
                window.setTimeout(poll, defaultPollingTime, notificationInstance);
            },
            success: (data) => {
                let isConnected = false;
                if (data) {
                    isConnected = user(language).manageSession(data, true);
                }
                if (!isConnected) return;
                let t = 120000;
                if (data.apps && parseInt(data.apps, 10) > 1) {
                    t = Math.round((Math.sqrt(parseInt(data.apps, 10) - 1) * 1.3 * 60000));
                }

                window.setTimeout(poll, t, notificationInstance);

                return true;
            }
        });

    };


    return {
        bindEvents,
        appendNotifications,
        createNotifier,
        isValid,
        poll
    };
};


export default notify;
