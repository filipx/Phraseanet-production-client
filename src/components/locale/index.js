/**
 * Locale singleton Class
 */
import $ from 'jquery';

let instance = null;

class Locale {
    language;

    constructor() {
        if(!instance){
            console.log(instance);
            this.fetchLang()/*.then((lang) => {
                console.log('passed lang', lang)
                this.language = lang;
            });*/
            instance = this;
        }

        return instance;
    }

    getLanguage() {
        return this.language
    };

    fetchLang() {
        return $.ajax({
            type: "GET",
            url: "../prod/language/",
            dataType: 'json',
            success: function (data) {

                // register globale:
                if (typeof window !== 'undefined') {
                    window.language = data;
                }
                this.language = data;
                return data;
            }
        });
    }
}

export default Locale;
