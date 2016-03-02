import workzoneThesaurus from './thesaurus';
import workzoneFacets from './facets';
import workzoneBaskets from './baskets';




const workzone = (services) => {
    const {configService, localeService, appEvents} = services;



    return {workzoneFacets, workzoneBaskets, workzoneThesaurus}
};
export default workzone;