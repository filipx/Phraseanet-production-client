

var listEditor = (services, options) => {
    console.log('init list editor')
    const {configService, localeService, appEvents} = services;
    let {$container, listManagerInstance} = options;

    var $editor = $('#list-editor-search-results');


    var $form = $('#ListManager .editor').find('form[name="list-editor-search"]');

    $('a.next, a.prev', $editor).bind('click', function(){
        var page = $(this).attr('value');

        $('input[name="page"]', $form).val(page);
        $form.trigger('submit');

        return false;
    });

    $('input[name="page"]', $form).val('');

    $('th.sortable', $editor).bind('click', function(){

            var $this = $(this);

            var sort = $('input', $this).val();

            if((sort == $('input[name="srt"]', $form).val())
                && ($('input[name="ord"]', $form).val() == 'asc'))
            {
                var ord = 'desc';
            }
            else
            {
                var ord = 'asc';
            }

            $('input[name="srt"]', $form).val(sort);
            $('input[name="ord"]', $form).val(ord);

            $form.trigger('submit');
        })
        .bind('mouseover', function(){$(this).addClass('hover');})
        .bind('mouseout', function(){$(this).removeClass('hover');});

    $('tbody tr', $editor).bind('click', function(){

        var $this = $(this);
        var usr_id = $('input[name="usr_id"]', $this).val();

        var counters = $('#ListManager .counter.current, #ListManager .lists .list.selected .counter');

        if($this.hasClass('selected'))
        {
            $this.removeClass('selected');
            listManagerInstance.getList().removeUser(usr_id);

            counters.each(function(i,el){
                var n = parseInt($(el).text());
                $(el).text(n - 1);
            });
        }
        else
        {
            $this.addClass('selected');
            listManagerInstance.getList().addUser(usr_id);

            counters.each(function(i,el){
                var n = parseInt($(el).text());
                $(el).text(n + 1);
            });
        }

    });
};

export default listEditor;