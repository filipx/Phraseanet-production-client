import FieldCollection from './fieldCollection';
import recordModel from '../../../record/model';
class RecordCollection {
    records;
    fieldCollection;
    constructor(recordsList, fieldsList) {
        this.records = recordsList;
        this.fieldCollection = new FieldCollection(fieldsList);
        // set each models
        this.initializeRecordModels();
    }

    getRecordById() {

    }

    initializeRecordModels() {
        for (let recordIndex in this.records) {
            let fields = this.setRecordFields(recordIndex);
            this.records[recordIndex].fields = this.setRecordFields(recordIndex);
            options.fields = fields;

        }
    }
    setRecordFields(recordIndex) {
        let fields = {};
        for (let fieldIndex in this.records[recordIndex].fields) {

            var meta_struct_id = this.records[recordIndex].fields[fieldIndex].meta_struct_id;


            let currentField = this.fieldCollection.getFieldById(meta_struct_id);
            var fieldOptions = this.fieldCollection.getFieldOptionsById(meta_struct_id);

            var databoxField = new recordModel.databoxField(currentField.name, currentField.label, meta_struct_id, fieldOptions);

            var values = [];

            for (let v in options.T_records[recordIndex].fields[fieldIndex].values) {
                var meta_id = options.T_records[recordIndex].fields[fieldIndex].values[v].meta_id;
                var value = options.T_records[recordIndex].fields[fieldIndex].values[v].value;
                var vocabularyId = options.T_records[recordIndex].fields[fieldIndex].values[v].vocabularyId;

                values.push(new recordModel.recordFieldValue(meta_id, value, vocabularyId));
            }

            fields[fieldIndex] = new recordModel.recordField(databoxField, values);
        }
        return fields;
    }


}
export default RecordCollection;
