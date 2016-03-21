import bootstrap from './bootstrap';
let lightboxApplication = {
    bootstrap
};

if (typeof window !== 'undefined') {
    window.lightboxApplication = lightboxApplication;
}

module.exports = lightboxApplication;
