import $ from 'jquery';
import ui from '../ui';
import notify from '../notify';

const basket = () => {

    const onUpdatedContent = (data) => {

        console.log('catch changed content', contentCollection);
        if (data.changed.length > 0) {
            var current_open = $('.SSTT.ui-state-active');
            var current_sstt = current_open.length > 0 ? current_open.attr('id').split('_').pop() : false;

            var main_open = false;
            for (var i = 0; i !== data.changed.length; i++) {
                var sstt = $('#SSTT_' + data.changed[i]);
                if (sstt.size() === 0) {
                    if (main_open === false) {
                        $('#baskets .bloc').animate({ 'top': 30 }, function () {
                            $('#baskets .alert_datas_changed:first').show();
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
        }
    };


    const subscribeToEvents = {
        'notification.refresh': onUpdatedContent    // update basket content on notification feedback
    };

    return { subscribeToEvents };
};

export default basket;
