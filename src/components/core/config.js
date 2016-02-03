import $ from 'jquery';
import ui from '../ui';

const config = (translations) => {
    const language = translations;

    const setupAppConfig = () => {
        console.log('while setup config has following translations', language);
        $.ajaxSetup({

            error: function (jqXHR, textStatus, errorThrown) {
                //Request is aborted
                if(jqXHR.status == 403 && jqXHR.getResponseHeader("X-Phraseanet-End-Session") == "1") {
                    ui(language).showModal('disconnected', {title: language.serverDisconnected});
                }
                else if (errorThrown === 'abort') {
                    return false;
                } else {
                    ui(language).showModal('error', {
                        title: language.errorAjaxRequest + ' ' + jqXHR.responseText
                    });
                }
            },
            timeout: function () {
                ui(language).showModal('timeout', {
                    title: 'Server not responding'
                });
            }
        });
    }
    return { setupAppConfig };
}

export default config;
