const archiveBasket = (services) => {
    const {configService, localeService, appEvents} = services;
    let $container = null;
    const initialize = () => {
        $container = $('body');
        $container.on('click', '.archive-basket-action', function (event) {
            event.preventDefault();
            let $el = $(event.currentTarget);
            doArchive($el.data('basket-id'));
        });
    }

    function doArchive(basket_id) {
        $.ajax({
            type: "POST",
            url: "../prod/baskets/" + basket_id + "/archive/?archive=1",
            dataType: 'json',
            beforeSend: function () {

            },
            success: function (data) {
                if (data.success) {
                    var basket = $('#SSTT_' + basket_id);
                    var next = basket.next();

                    if (next.data("ui-droppable")) {
                        next.droppable('destroy');
                    }

                    next.slideUp().remove();

                    if (basket.data("ui-droppable")) {
                        basket.droppable('destroy');
                    }

                    basket.slideUp().remove();

                    if ($('#baskets .SSTT').length === 0) {
                        return p4.WorkZone.refresh(false);
                    }
                }
                else {
                    alert(data.message);
                }
                return;
            }
        });
    }

    return {initialize};
}

export default archiveBasket;