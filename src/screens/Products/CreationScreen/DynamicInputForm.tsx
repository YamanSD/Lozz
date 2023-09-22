import React from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';

const DynamicInputForm = () => {
  const initialValues = {
    dynamicFields: [{ title: '', description: '' }], // Initialize with an empty item
  };

  const validationSchema = Yup.object().shape({
    dynamicFields: Yup.array().of(
      Yup.object().shape({
        title: Yup.string().required('Title is required'),
        description: Yup.string().required('Description is required'),
      })
    ),
  });

  const handleSubmit = (values) => {
    // Handle form submission here
    console.log('Submitted Values:', values.dynamicFields);
  };

  const handleDeleteField = (index, setFieldValue, values) => {
    const updatedFields = [...values.dynamicFields];
    updatedFields.splice(index, 1);
    setFieldValue('dynamicFields', updatedFields);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ values, setFieldValue, handleSubmit, errors }) => (
        <View>
          {values.dynamicFields.map((item, index) => (
            <View key={index}>
              <TextInput
                onChangeText={(text) => {
                  const updatedFields = [...values.dynamicFields];
                  updatedFields[index].title = text;
                  setFieldValue('dynamicFields', updatedFields);
                }}
                value={item.title}
                placeholder={`Title ${index + 1}`}
              />
              <TextInput
                onChangeText={(text) => {
                  const updatedFields = [...values.dynamicFields];
                  updatedFields[index].description = text;
                  setFieldValue('dynamicFields', updatedFields);
                }}
                value={item.description}
                placeholder={`Description ${index + 1}`}
              />
              <Button
                title="Delete"
                onPress={() => handleDeleteField(index, setFieldValue, values)}
              />
              <Text style={{ color: 'red' }}>
                {errors.dynamicFields && errors.dynamicFields[index]?.title}
              </Text>
              <Text style={{ color: 'red' }}>
                {errors.dynamicFields && errors.dynamicFields[index]?.description}
              </Text>
            </View>
          ))}
          <Button
            title="Add Item"
            onPress={() => {
              if (values.dynamicFields.length < 10) {
                const updatedFields = [...values.dynamicFields, { title: '', description: '' }];
                setFieldValue('dynamicFields', updatedFields);
              }
            }} // Limit to a reasonable number of items
          />
          <Button title="Submit" onPress={handleSubmit} />
        </View>
      )}
    </Formik>
  );
};

export default DynamicInputForm;
