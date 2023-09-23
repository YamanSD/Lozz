import React from "react";
import { View } from 'react-native';
import { Formik, FormikErrors } from "formik";
import * as Yup from 'yup';
import BaseModel from "../../../../services/model/BaseModel";
import InstructionsWrapper from "./InstructionsWrapper";
import { useTheme as useBoilerTheme } from "../../../../hooks";
import { isString } from "lodash";
import { InputField, SpringButton } from "../../../../components";
import { useTheme as usePaperTheme } from "react-native-paper";

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
  const theme = usePaperTheme();

  /* Maximum number of instructions */
  const MaxInstructions = 10;

  /* key for the dynamic field */
  const dynamicFieldsKeys = 'dynamicFields';

  /* initial instruction values */
  const initInstructions = () => {
    return BaseModel.deepCopy({ title: '', description: '' });
  };

  /* initial values of fields */
  const initialValues: FormResponse = {
    // Initialize with an empty array
    dynamicFields: [],
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
   * Checks if the input fields are valid.
   * Used by the InputField components.
   *
   * @param errors Formik errors object
   * @param index of the component to check
   * @param field name of the field to check
   * @returns true if the data is invalid, otherwise false.
   */
  const checkField = (errors: FormikErrors<FormResponse>,
                      index: number,
                      field: "title" | "description") => {
    const fields = errors.dynamicFields;

    if (fields === undefined) {
      return false;
    }

    const indexFields = fields[index];

    if (isString(indexFields)) {
      return false;
    }

    return (
      indexFields !== undefined
      && indexFields[field] !== undefined
    );
  };

  /**
   * @param values to check
   * @param index current index
   * @param value to check
   * @returns true if the title exists on another object value.
   */
  const existsOnOther = (values: FormResponse,
                         index: number,
                         value: string) => {
    return (values.dynamicFields.find(
        (obj: any, curIndex: number) => {
          return obj.title === value
            && index !== curIndex;
        })
    ) !== undefined;
  }

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

  /**
   * @param setFieldValue modifies the dynamicFields
   * @param values original values
   */
  const handleAddField = (setFieldValue: FieldSetter,
                          values: FormResponse) => {
    if (values.dynamicFields.length < MaxInstructions) {
      const updatedFields = [
        ...values.dynamicFields,
        initInstructions()
      ];

      setFieldValue(dynamicFieldsKeys, updatedFields);
      setData(updatedFields);
    }
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        setData(handleSubmit(values));
      }}
    >
      {({ values, setFieldValue, errors }) => {
        return (
          <View>
            {
              values.dynamicFields.map((item, index) => {
                return (
                  <InstructionsWrapper onPress={() => {
                    handleDeleteField(index, setFieldValue, values);
                  }} key={index}>
                    <View style={[
                      Layout.justifyContentBetween,
                    ]}>
                      {/* title field */}
                      <InputField
                        onChangeText={(text) => {
                          const updatedFields = [...values.dynamicFields];
                          updatedFields[index].title = text;
                          setFieldValue(dynamicFieldsKeys, updatedFields);
                          setData(updatedFields);
                        }}
                        label={"Title"}
                        value={item.title}
                        errorChecker={(value) => {
                          return checkField(errors, index, "title")
                            || existsOnOther(values, index, value);
                        }}
                        errorMessage={(value) => {
                          if (checkField(errors, index, "title")) {
                            return "Field is required";
                          } else {
                            return existsOnOther(values, index, value)
                              ? "Title already exists!"
                              : "";
                          }
                        }}
                        outline={true}
                        viewStyle={{ paddingRight: 20 }}
                      />

                      {/* description or body field */}
                      <InputField
                        onChangeText={(text) => {
                          const updatedFields = [...values.dynamicFields];
                          updatedFields[index].description = text;
                          setFieldValue(dynamicFieldsKeys, updatedFields);
                          setData(updatedFields);
                        }}
                        label={"Description"}
                        value={item.description}
                        errorChecker={(ignored) => {
                          return checkField(errors, index, "description");
                        }}
                        errorMessage={(ignored) => {
                          return checkField(errors, index, "description")
                            ? "Field is required"
                            : '';
                        }}
                        outline={true}
                        multiline={true}
                        viewStyle={{ paddingRight: 20 }}
                      />
                    </View>
                  </InstructionsWrapper>
                );
              })
            }
            <SpringButton
              onPress={() => handleAddField(setFieldValue, values)}
              style={{
                marginTop: 20,
              }}
              labelStyle={{
                fontWeight: "700"
              }}
              textColor={theme.colors.primary}
              buttonColor={theme.colors.secondary}
              mode={"contained-tonal"}
              expandBy={0}
            >
              Add instruction
            </SpringButton>
          </View>
        );
      }}
    </Formik>
  );
};

export default InstructionsForm;
