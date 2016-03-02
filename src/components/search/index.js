import $ from 'jquery';

const search = () => {

    const onSpecialSearch = (data) => {
        console.log('catch onSpecialSearch', data);
        if (allbase) {
            searchModule.toggleDatabase(true);
        }
        workzoneFacetsModule.resetSelectedFacets();
        $('#EDIT_query').val(decodeURIComponent(qry).replace(/\+/g, " "));
        searchModule.newSearch(qry);
    }


    const subscribeToEvents = {
        'search.doSpecialSearch': onSpecialSearch    // update basket content on notification feedback
    };

    return { subscribeToEvents };
}

export default search;
