import React from "react";
import { View, Text, TextInput, Button } from 'react-native';
import { Formik } from "formik";
import * as Yup from 'yup';
import BaseModel from "../../../../services/model/BaseModel";
import InstructionsWrapper from "./InstructionsWrapper";
import { useTheme as useBoilerTheme } from "../../../../hooks";

/**
 * - title: Title of the instruction.
 * - description: Description or body of the instruction.
 */
type FormFields = {
  title: string,
  description: string
}[];

/**
 * Type alias for field setter functions.
 */
type FieldSetter = (value: string,
                    newFields: FormFields,
                    shouldValidate?: boolean) => any

/**
 * Type of response returned by the forms.
 */
type FormResponse = {
  dynamicFields: FormFields,
};

/**
 * Prop-type for the instructionsForm
 */
type Properties = {
  setData: React.Dispatch<React.SetStateAction<FormFields>>
};

/**
 * @param setDataGetter modifies the data getter.
 * @param setData modifies the data.
 * @constructor
 */
const InstructionsForm = ({ setData }: Properties) => {
  const { Layout } = useBoilerTheme();

  /* Maximum number of instructions */
  const MaxInstructions = 10;

  /* key for the dynamic field */
  const dynamicFieldsKeys = 'dynamicFields';

  /* initial instruction values */
  const initInstructions = () => {
    return BaseModel.deepCopy({ title: '', description: '' });
  };

  /* initial values of fields */
  const initialValues = {
    // Initialize with an empty item
    dynamicFields: [initInstructions()],
  };

  /* validates the input */
  const validationSchema = Yup.object().shape({
    dynamicFields: Yup.array().of(
      Yup.object().shape({
        title: Yup.string().required('Title is required'),
        description: Yup.string().required('Description is required'),
      })
    ),
  });

  /**
   * @param values form response object
   * @returns a list of {title, description} objects.
   */
  const handleSubmit = (values: FormResponse) => {
    return values.dynamicFields;
  };

  /**
   * @param index to be deleted
   * @param setFieldValue modifies the dynamicFields
   * @param values original values
   */
  const handleDeleteField = (index: number,
                             setFieldValue: FieldSetter,
                             values: FormResponse) => {
    // Copy fields
    const updatedFields: FormFields = [...values.dynamicFields];
    updatedFields.splice(index, 1);

    setFieldValue(dynamicFieldsKeys, updatedFields);
    setData(updatedFields);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        setData(handleSubmit(values));
      }}
    >
      {({ values,
          setFieldValue,
          handleSubmit,
          errors }) => {
        return (
          <>
            {
              values.dynamicFields.map((item, index) => (
                <InstructionsWrapper onPress={() => {
                  handleDeleteField(index, setFieldValue, values);
                }} key={index}>
                  <View style={[
                    Layout.justifyContentBetween,
                  ]}>
                    <TextInput
                      onChangeText={(text) => {
                        const updatedFields = [...values.dynamicFields];
                        updatedFields[index].title = text;
                        setFieldValue(dynamicFieldsKeys, updatedFields);
                        setData(updatedFields);
                      }}
                      value={item.title}
                      placeholder={`Title ${index + 1}`}
                    />
                    <TextInput
                      onChangeText={(text) => {
                        const updatedFields = [...values.dynamicFields];
                        updatedFields[index].description = text;
                        setFieldValue(dynamicFieldsKeys, updatedFields);
                        setData(updatedFields);
                      }}
                      value={item.description}
                      placeholder={`Description ${index + 1}`}
                    />
                    <Text style={{ color: 'red' }}>
                      {errors.dynamicFields && errors.dynamicFields[index]?.title}
                    </Text>
                    <Text style={{ color: 'red' }}>
                      {errors.dynamicFields && errors.dynamicFields[index]?.description}
                    </Text>
                  </View>
                </InstructionsWrapper>
              ))
            }
            <Button
              title="Add Instruction"
              onPress={() => {
                if (values.dynamicFields.length < MaxInstructions) {
                  const updatedFields = [
                    ...values.dynamicFields,
                    initInstructions()
                  ];

                  setFieldValue(dynamicFieldsKeys, updatedFields);
                  setData(updatedFields);
                }
              }}
            />
          </>
        );
      }}
    </Formik>
  );
};

export default InstructionsForm;
