import $ from 'jquery';
import orderItem from './orderItem';
import dialog from 'phraseanet-common/src/components/dialog';

const order = (services) => {
    const { configService, localeService, appEvents } = services;
    const url = configService.get('baseUrl');

    const initialize = (options = {}) => {
        const { $container } = options;
        $container.on('click', '.order-open-action', function (event) {
            event.preventDefault();
            orderModal(event);
        });
    };

    const orderModal = (event) => {
        var $dialog = dialog.create(services, {
            size: 'Full',
            title: $(event).attr('title')
        });

        $.ajax({
            type: 'GET',
            url: `${url}prod/order/`,
            success: function (data) {
                $dialog.setContent(data);
                _onOrderReady($dialog);
            }
        });

        return true;
    };

    const _onOrderReady = ($dialog) => {

        $('a.self-ajax', $dialog.getDomElement()).bind('click', function (e) {
            e.preventDefault();
            var url = $(this).attr('href');
            dialog.load(url);
        });

        $('tr.order_row', $dialog.getDomElement()).bind('click', function (event) {
            event.preventDefault();
            let $el = $(event.currentTarget);
            let orderId = $el.data('order-id');

            orderItem(services).openModal(orderId);
        }).addClass('clickable');
    };

    return {
        initialize
    };
};

export default order;
