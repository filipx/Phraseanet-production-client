const thesaurus = (services) => {
    const {configService, localeService, appEvents} = services;
    let $container = null;
    const initialize = () => {
        $container = $('body');
    }

    return {initialize};
};

export default thesaurus;