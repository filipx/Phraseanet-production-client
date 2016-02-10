import $ from 'jquery';

const recordToolsModal = (translations, datas, activeTab) => {
    const language = translations;

    var dialog = p4.Dialog.Create({
        size: 'Medium',
        title: language.toolbox,
        loading: true
    });

    $.get("../prod/tools/"
        , datas
        , function (data) {
            dialog.setContent(data);
            dialog.setOption('contextArgs', datas);
            var tabs = $('.tabs', dialog.getDomElement()).tabs();

            // activate tab if exists:
            if( activeTab !== undefined ) {
                tabs.tabs('option', 'active', activeTab);
            }
            return;
        }
    );

    return true;
};

export default recordToolsModal;
