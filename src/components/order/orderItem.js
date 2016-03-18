import $ from 'jquery';
import dialog from 'phraseanet-common/src/components/dialog';
import * as appCommons from 'phraseanet-common';
const orderItem = (services) => {
    const { configService, localeService, appEvents } = services;
    const url = configService.get('baseUrl');
    const openModal = (orderId) => {
        let $dialog = dialog.create(services, {
            size: 'Medium'
        });

        $.ajax({
            type: 'GET',
            url: `${url}prod/order/${orderId}`,
            success: function (data) {
                $dialog.setContent(data);
                _onOrderItemReady($dialog);
            }
        });

        return true;
    };

    const _onOrderItemReady = ($dialog) => {
        if ($('#notification_box').is(':visible')) {
            $('#notification_trigger').trigger('mousedown');
        }

        let orderId = $('input[name=order_id]').val();

        $('.order_list .selectable', $dialog.getDomElement()).bind('click', function (event) {

            let $this = $(this);

            if (appCommons.utilsModule.is_ctrl_key(event)) {
                if ($this.hasClass('selected')) {
                    $this.removeClass('selected');
                } else {
                    $this.addClass('selected');
                }
            } else {
                if (appCommons.utilsModule.is_shift_key(event)) {
                    let first = false;
                    let last = false;

                    $('.order_list .selectable', $dialog.getDomElement()).each(function (i, n) {
                        if (last) {
                            first = last = false;
                        }

                        if ($(n).attr('id') === $this.attr('id') || $(n).hasClass('last_selected')) {
                            if (first) {
                                last = true;
                            }

                            first = true;
                        }

                        if (first || last) {
                            $(n).addClass('selected');
                        }
                    });
                } else {
                    $('.order_list .selectable.selected', $dialog.getDomElement()).removeClass('selected');
                    $this.addClass('selected');
                }
            }

            $('.order_list .selectable.last_selected', $dialog.getDomElement()).removeClass('last_selected');
            $this.addClass('last_selected');
        });

        $('.captionTips, .captionRolloverTips, .infoTips', $dialog.getDomElement()).tooltip({
            delay: 0
        });
        $('.previewTips', $dialog.getDomElement()).tooltip({
            fixable: true
        });

        $('button.send', $dialog.getDomElement()).bind('click', function () {
            send_documents(orderId);
        });

        $('button.deny', $dialog.getDomElement()).bind('click', function () {
            deny_documents(orderId);
        });

        $('.force_sender', $dialog.getDomElement()).bind('click', function () {
            if (confirm(localeService.t('forceSendDocument'))) {
                let elementId = [];
                elementId.push($(this).closest('.order_wrapper').find('input[name=order_element_id]').val());
                do_send_documents(orderId, elementId, true);
            }
        });
    };


    function do_send_documents(order_id, elements_ids, force) {
        let $dialog = dialog.get(1);
        let dialogContainer = $dialog.getDomElement();

        $('button.deny, button.send', dialogContainer).prop('disabled', true);
        $('.activity_indicator', dialogContainer).show();

        $.ajax({
            type: 'POST',
            url: `${url}prod/order/${order_id}/send/`,
            dataType: 'json',
            data: {
                'elements[]': elements_ids,
                force: (force ? 1 : 0)
            },
            success: function (data) {
                let success = '0';

                if (data.success) {
                    success = '1';
                }

                $dialog.load(`${url}prod/order/${order_id}/?success=${success}&action=send`);
            },
            error: function () {
                $('button.deny, button.send', dialogContainer).prop('disabled', false);
                $('.activity_indicator', dialogContainer).hide();
            },
            timeout: function () {
                $('button.deny, button.send', dialogContainer).prop('disabled', false);
                $('.activity_indicator', dialogContainer).hide();
            }
        });
    }

    function deny_documents(order_id) {
        let $dialog = dialog.get(1);
        let dialogContainer = $dialog.getDomElement();

        let elements = $('.order_list .selectable.selected', dialogContainer);

        let elements_ids = [];

        elements.each(function (i, n) {
            elements_ids.push($(n).find('input[name=order_element_id]').val());
        });

        if (elements_ids.length === 0) {
            alert(localeService.t('nodocselected'));
            return;
        }

        $('button.deny, button.send', dialogContainer).prop('disabled', true);
        $('.activity_indicator', dialogContainer).show();

        $.ajax({
            type: 'POST',
            url: `${url}prod/order/${order_id}/deny/`,
            dataType: 'json',
            data: {
                'elements[]': elements_ids
            },
            success: function (data) {
                let success = '0';

                if (data.success) {
                    success = '1';
                }

                $dialog.load(`${url}prod/order/${order_id}/?success=${success}&action=deny`);
            },
            error: function () {
                $('button.deny, button.send', dialogContainer).prop('disabled', false);
                $('.activity_indicator', dialogContainer).hide();
            },
            timeout: function () {
                $('button.deny, button.send', dialogContainer).prop('disabled', false);
                $('.activity_indicator', dialogContainer).hide();
            }
        });
    }


    function send_documents(order_id) {
        let $dialog = dialog.get(1);
        let elements_ids = [];

        $('.order_list .selectable.selected', $dialog.getDomElement()).each(function (i, n) {
            elements_ids.push($(n).find('input[name=order_element_id]').val());
        });

        if (elements_ids.length === 0) {
            alert(localeService.t('nodocselected'));
            return;
        }

        do_send_documents(order_id, elements_ids, false);
    }

    return {
        openModal
    };
};

export default orderItem;
