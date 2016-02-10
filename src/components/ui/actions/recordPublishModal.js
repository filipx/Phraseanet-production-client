import $ from 'jquery';

const recordPublishModal = (translations, datas) => {
    const language = translations;

    $.post("../prod/feeds/requestavailable/"
        , datas
        , function (data) {

            return set_up_feed_box(data);
        });

    return true;
};

export default recordPublishModal;
