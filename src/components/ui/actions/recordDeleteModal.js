import $ from 'jquery';

const recordDeleteModal = (translations, datas) => {
    const language = translations;

    var $dialog = p4.Dialog.Create({
        size: 'Small',
        title: language.deleteRecords
    });

    $.ajax({
        type: "POST",
        url: "../prod/records/delete/what/",
        dataType: 'html',
        data: datas,
        success: function (data) {
            $dialog.setContent(data);
        }
    });

    return true;
};

export default recordDeleteModal;
