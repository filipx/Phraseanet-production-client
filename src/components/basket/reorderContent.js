/**
 * triggered via workzone > Basket > context menu
 */
import $ from 'jquery';
import * as _ from 'underscore';
import dialog from 'phraseanet-common/src/components/dialog';
import Selectable from '../utils/selectable';

const basketReorderContent = (services) => {
    const { configService, localeService, appEvents } = services;
    const url = configService.get('baseUrl');
    const endPoint = 'prod/baskets/4/reorder/';
    let searchSelectionSerialized = '';
    appEvents.listenAll({
        'broadcast.searchResultSelection': (selection) => {
            searchSelectionSerialized = selection.serialized;
        }
    });

    const initialize = () => {
        $('body').on('click', '.basket-reorder-content-action', (event) => {
            event.preventDefault();
            const $el = $(event.currentTarget);
            let dialogOptions = {};

            if ($el.attr('title') !== undefined) {
                dialogOptions.title = $el.attr('title');
            }

            openModal($el.data('basket-id'), dialogOptions);
        });
    };

    const openModal = (basketId, options = {}) => {

        let dialogOptions = Object.assign({
            size: 'Medium',
            loading: false
        }, options);
        const $dialog = dialog.create(services, dialogOptions);

        return $.get(`${url}prod/baskets/${basketId}/reorder/`, function (data) {
            $dialog.setContent(data);
            _onDialogReady();
            return;
        });
    };

    const _onDialogReady = () => {
        var container = $('#reorder_box');

        $('button.autoorder', container).bind('click', function () {
            autoorder();
            return false;
        });
        $('button.reverseorder', container).bind('click', function () {
            reverse_order();
            return false;
        });

        function autoorder() {
            var val = $.trim($('#auto_order').val());

            if (val === '') {
                return;
            }

            var diapos = [];
            $('#reorder_box .diapo form').each(function (i, n) {
                diapos.push({
                    title: $('input[name=title]', n).val(),
                    order: parseInt($('input[name=default]', n).val(), 10),
                    id: $('input[name=id]', n).val()
                });
            });

            var sorterCallback;

            if (val === 'default') {
                sorterCallback = function (diapo) {
                    return diapo.order;
                };
            } else {
                sorterCallback = function (diapo) {
                    return diapo.title;
                };
            }

            var elements = [];

            _.chain(diapos)
                .sortBy(sorterCallback)
                .each(function (diapo) {
                    elements.push($('#ORDER_' + diapo.id));
                });

            $('#reorder_box .elements').append(elements);
        }

        function reverse_order() {
            var $container = $('#reorder_box .elements');
            $('#reorder_box .diapo').each(function () {
                $(this).prependTo($container);
            });
        }

        $('.elements', container).sortable({
            appendTo: container,
            placeholder: 'diapo ui-sortable-placeholder',
            distance: 20,
            cursorAt: {
                top: 10,
                left: -20
            },
            items: 'div.diapo',
            scroll: true,
            scrollSensitivity: 40,
            scrollSpeed: 30,
            start: function (event, ui) {
                var selected = $('.selected', container);

                selected.each(function (i, n) {
                    $(n).attr('position', i);
                });

                var n = selected.length - 1;

                $('.selected:visible', container).hide();

                while (n > 0) {
                    $('<div style="height:130px;" class="diapo ui-sortable-placeholderfollow"></div>').after($('.diapo.ui-sortable-placeholder', container));
                    n--;
                }
            },
            stop: function (event, ui) {

                $('.diapo.ui-sortable-placeholderfollow', container).remove();

                let main_id = $(ui.item[0]).attr('id');

                let selected = $('.selected', container);
                let sorter = [];


                selected.each(function (i, n) {

                    var position = parseInt($(n).attr('position'), 10);

                    if (position !== '') {
                        sorter[position] = $(n);
                    }

                    var id = $(n).attr('id');
                    if (id === main_id) {
                        return;
                    }

                });

                var before = true;
                var last_moved = $(ui.item[0]);
                $(sorter).each(function (i, n) {
                    $(n).show().removeAttr('position');
                    if ($(n).attr('id') === main_id) {
                        before = false;
                    } else {
                        if (before) {
                            $(n).before($(ui.item[0]));
                        } else {
                            $(n).after($(last_moved));
                        }

                    }
                    last_moved = sorter[i];
                });

            },
            change: function () {
                $('.diapo.ui-sortable-placeholderfollow', container).remove();

                var n = OrderSelection.length() - 1;
                while (n > 0) {
                    $('<div style="height:130px;" class="diapo ui-sortable-placeholderfollow"></div>').after($('.diapo.ui-sortable-placeholder', container));
                    n--;
                }
            }

        }).disableSelection();

        var OrderSelection = new Selectable($('.elements', container), {
            selector: '.CHIM'
        });

        $('form[name="reorder"]', container).bind('submit', function (event) {

            //$this.SetLoader(true);
            var $form = $(this);

            $('.elements form', container).each(function (i, el) {
                var id = $('input[name="id"]', $(el)).val();

                $('input[name="element[' + id + ']"]', $form).val(i + 1);
            });

            $.ajax({
                type: $form.attr('method'),
                url: $form.attr('action'),
                data: $form.serializeArray(),
                dataType: 'json',
                beforeSend: function () {

                },
                success: function (data) {
                    if (!data.success) {
                        alert(data.message);
                    }
                    appEvents.emit('workzone.refresh', {
                        basketId: 'current'
                    });
                    dialog.get(1).close();

                    return;
                }
            });

            return false;
        });
    };

    return {initialize};
};

export default basketReorderContent;
