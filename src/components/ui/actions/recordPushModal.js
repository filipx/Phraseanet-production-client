import $ from 'jquery';

const recordPushModal = (translations, datas) => {
    const language = translations;

    $dialog = p4.Dialog.Create({
        size: 'Full',
        title: language.push
    });

    $.post("../prod/push/sendform/", datas, function (data) {
        $dialog.setContent(data);
        return;
    });

    return true;
};

export default recordPushModal;
