import dialog from '../../utils/dialog';
import * as _ from 'underscore';
const listShare = (services, options) => {
    const {configService, localeService, appEvents} = services;
    const url = configService.get('baseUrl');
    const shareTemplateEndPoint = 'prod/lists/list/1/share/';
    let $dialog = null;


    const initialize = () => {};


    const openModal = (options) => {
        let {listId, modalOptions, modalLevel} = options;

        $dialog = dialog.create(services, modalOptions, modalLevel);

        return $.get(`${url}prod/lists/list/${listId}/share/`, function (data) {
            $dialog.setContent(data);
            onModalReady(listId);
        });
    };

    const onModalReady = (listId) => {
        var $container = $('#ListShare'),
            $completer_form = $('form[name="list_share_user"]', $container),
            $owners_form = $('form[name="owners"]', $container),
            $autocompleter = $('input[name="user"]', $completer_form),
            $dialog = dialog.get(2); //p4.Dialog.get(2);

        $completer_form.bind('submit', function(){
            return false;
        });

        $('select[name="role"]', $owners_form).bind('change', function(event){
            event.preventDefault();
            let $el = $(event.currentTarget);
            const userId = $el.data('user-id');

            shareWith(userId, $el.val());

            return false;
        });
        $container.on('click', '.listmanager-share-delete-user-action', () => {
            event.preventDefault();
            let $el = $(event.currentTarget);
            const userId = $el.data('user-id');

            let $owner = $el.closest('.owner');

            unShareWith(userId, function(data){
                $owner.remove();
            });

            return false;
        });


        function shareWith(userId, role)
        {
            var role = typeof role === 'undefined' ? 1 : role;

            $.ajax({
                type: 'POST',
                url: '/prod/lists/list/'+listId+'/share/' + userId + '/',
                dataType: 'json',
                data : {role : role},
                beforeSend:function(){
                },
                success: function(data){
                    if(data.success)
                    {
                        humane.info(data.message);
                    }
                    else
                    {
                        humane.error(data.message);
                    }
                    $dialog.refresh();

                    return;
                }
            });
        }

        function unShareWith(usr_id, callback)
        {
            $.ajax({
                type: 'POST',
                url: '/prod/lists/list/'+listId+'/unshare/' + usr_id + '/',
                dataType: 'json',
                data : {},
                beforeSend:function(){
                },
                success: function(data){
                    if(data.success)
                    {
                        humane.info(data.message);
                        callback(data);
                    }
                    else
                    {
                        humane.error(data.message);
                    }
                    $dialog.refresh();

                    return;
                },
                error: function(){
                    return;
                },
                timeout: function(){
                    return;
                }
            });
        }

        $autocompleter.autocomplete({
                minLength: 2,
                source: function( request, response ) {
                    $.ajax({
                        url: '/prod/push/search-user/',
                        dataType: "json",
                        data: {
                            query: request.term
                        },
                        success: function( data ) {
                            response( data );
                        }
                    });
                },
                select: function( event, ui ) {
                    if(ui.item.type === 'USER')
                    {
                        shareWith(ui.item.usr_id);
                    }

                    return false;
                }
            })
            .data( "ui-autocomplete" )._renderItem = function( ul, item ) {
            if(item.type === 'USER') {
                var html = _.template($("#list_user_tpl").html())( {
                    item: item
                });

                return  $(html).data( "ui-autocomplete-item", item ).appendTo(ul);
            }
        };
    }




    return {
        openModal
    }
};

export default listShare;
