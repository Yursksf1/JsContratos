import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';

const contractTemplates = [
  { id: 1, name: 'Contract 1', file: 'contract1.docx', fields: ['name', 'startDate', 'endDate'] },
  { id: 2, name: 'Contract 2', file: 'contract2.docx', fields: ['name', 'startDate', 'endDate'] },
  { id: 3, name: 'Contract 3', file: 'contract3.docx', fields: ['name', 'startDate', 'endDate'] },
  { id: 4, name: 'Contract 4', file: 'contract4.docx', fields: ['name', 'startDate', 'endDate'] },
];

const TemplateEditor = () => {
  const [selectedContractType, setSelectedContractType] = useState(null);
  const [fieldsData, setFieldsData] = useState({});

  const handleContractTypeChange = (e) => {
    const selectedType = contractTemplates.find(type => type.id === parseInt(e.target.value));
    setSelectedContractType(selectedType);
    setFieldsData({});
  };

  const handleFieldChange = (fieldName, value) => {
    setFieldsData({
      ...fieldsData,
      [fieldName]: value,
    });
  };

  const generateDocument = async () => {
    if (!selectedContractType) return;

    const response = await fetch(`/JsContratos/templates/${selectedContractType.file}`);
    const arrayBuffer = await response.arrayBuffer();
    const zip = new PizZip(arrayBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    doc.setData(fieldsData);

    try {
      doc.render();
    } catch (error) {
      console.error('Error rendering document:', error);
      return;
    }

    const outputBlob = doc.getZip().generate({ type: 'blob' });
    saveAs(outputBlob, `output_${selectedContractType.name}.docx`);
  };

  return (
    <div>
      <h1>Word Template Editor</h1>
      <div>
        <label>
          Contract Type:
          <select onChange={handleContractTypeChange}>
            <option value="">Select a contract type</option>
            {contractTemplates.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </label>
      </div>
      {selectedContractType && (
        <div>
          {selectedContractType.fields.map(field => (
            <div key={field}>
              <label>
                {field}:
                {field.includes('Date') ? (
                  <DatePicker
                    selected={fieldsData[field] ? new Date(fieldsData[field]) : new Date()}
                    onChange={date => handleFieldChange(field, date.toLocaleDateString())}
                    dateFormat="MM/dd/yyyy"
                  />
                ) : (
                  <input
                    type="text"
                    value={fieldsData[field] || ''}
                    onChange={e => handleFieldChange(field, e.target.value)}
                  />
                )}
              </label>
            </div>
          ))}
          <button onClick={generateDocument}>Generate Document</button>
        </div>
      )}
    </div>
  );
};

export default TemplateEditor;
