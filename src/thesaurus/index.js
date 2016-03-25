import bootstrap from './bootstrap';
let thesaurusApplication = {
    bootstrap
};

if (typeof window !== 'undefined') {
    window.thesaurusApplication = thesaurusApplication;
}

module.exports = thesaurusApplication;
