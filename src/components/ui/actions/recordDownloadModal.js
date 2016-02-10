

import $ from 'jquery';

const recordDownloadModal = (translations, datas) => {
    const language = translations;

    var dialog = p4.Dialog.Create({title: language['export']});

    $.post("../prod/export/multi-export/", datas, function (data) {

        dialog.setContent(data);

        $('.tabs', dialog.getDomElement()).tabs();

        $('.close_button', dialog.getDomElement()).bind('click', function () {
            dialog.Close();
        });

        return false;
    });

    return true;
};

export default recordDownloadModal;
