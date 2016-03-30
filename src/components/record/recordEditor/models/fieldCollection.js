class FieldCollection {
    fields;
    constructor(fieldsList) {
        this.fields = fieldsList;
    }
    exportAsArray() {
        return this.fields;
    }
    getFieldOptionsById(meta_struct_id) {
        /*var name = this.fields[meta_struct_id].name;
        var label = this.fields[meta_struct_id].label;
        var multi = ;
        var required = this.fields[meta_struct_id].required;
        var readonly = this.fields[meta_struct_id].readonly;
        var maxLength = this.fields[meta_struct_id].maxLength;
        var minLength = this.fields[meta_struct_id].minLength;
        var type = this.fields[meta_struct_id].type;
        var separator = this.fields[meta_struct_id].separator;
        var vocabularyControl = this.fields[meta_struct_id].vocabularyControl || null;
        var vocabularyRestricted = this.fields[meta_struct_id].vocabularyRestricted || null;*/

        return {
            multi: this.fields[meta_struct_id].multi,
            required: this.fields[meta_struct_id].required,
            readonly: this.fields[meta_struct_id].readonly,
            maxLength: this.fields[meta_struct_id].maxLength,
            minLength: this.fields[meta_struct_id].minLength,
            type: this.fields[meta_struct_id].type,
            separator: this.fields[meta_struct_id].separator,
            vocabularyControl:  this.fields[meta_struct_id].vocabularyControl || null,
            vocabularyRestricted: this.fields[meta_struct_id].vocabularyRestricted || null
        };
    }
    getFieldById(id = false) {
        if( this.fields[id] !== undefined ) {
            return this.fields[id];
        }
        return false;
    }
    
}
export default FieldCollection;
