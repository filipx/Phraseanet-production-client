import deleteBasket from './../../../basket/delete';
import archiveBasket from './../../../basket/archive';


const workzoneBaskets =  (services) => {
    const {configService, localeService, appEvents} = services;


    const initialize = () => {
        deleteBasket(services).initialize();
        archiveBasket(services).initialize();

    };

    function openBasketPreferences() {
        $('#basket_preferences').dialog({
            closeOnEscape: true,
            resizable: false,
            width: 450,
            height: 500,
            modal: true,
            draggable: false,
            overlay: {
                backgroundColor: '#000',
                opacity: 0.7
            }
        }).dialog('open');
    }

    appEvents.listenAll({
        'baskets.doOpenBasketPreferences': openBasketPreferences
    });



    return {
        initialize,
        openBasketPreferences

    }
}

export default workzoneBaskets;
