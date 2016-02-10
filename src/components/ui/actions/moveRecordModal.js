import $ from 'jquery';

const moveRecordModal = (translations, datas) => {
    const language = translations;

    $dialog = p4.Dialog.Create({
        size: 'Small',
        title: language.move,
        closeButton: true
    });
    $.ajax({
        type: "POST",
        url: "../prod/records/movecollection/",
        data: datas,
        success: function (data) {
            $dialog.setContent(data);
        }
    });

    return true;
};

export default moveRecordModal;
