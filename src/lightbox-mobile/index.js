import bootstrap from './bootstrap';
let lightboxMobileApplication = {
    bootstrap
};

if (typeof window !== 'undefined') {
    window.lightboxMobileApplication = lightboxMobileApplication;
}

module.exports = lightboxMobileApplication;
