import React, { useEffect, useState } from "react";
import { Surface, Text, Button, TextInput, HelperText } from "react-native-paper";
import { useTheme as useBoilerTheme } from "../../../hooks";
import { useTheme as usePaperTheme } from "react-native-paper";
import { Alert, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import NavigationNames from "../NavigationNames";

/**
 * Prop-type for the Media selector component.
 */
type Properties = {
  setImages: React.Dispatch<React.SetStateAction<string[]>>,
  setId: React.Dispatch<React.SetStateAction<string>>,
  id: string,
  setName: React.Dispatch<React.SetStateAction<string>>,
  name: string,
  setDescription: React.Dispatch<React.SetStateAction<string>>,
  description: string
}

/* maximum name length */
const maxNameLength = 26;

/* maximum ID length */
const maxIdLength = 6;

/**
 * Media selector component.
 *
 * @param setImages modifies the selected images.
 * @param setName modifies the name of the product.
 * @param name name of the product.
 * @param setDescription modifies the description of the product.
 * @param description of the product.
 * @param setId modifies the ID of the product.
 * @param id id of the product.
 * @constructor
 */
const GeneralInfoSelector = ({ setImages,
                               setName,
                               name,
                               setDescription,
                               description,
                               setId,
                               id}: Properties) => {
  const { Layout } = useBoilerTheme();
  const theme = usePaperTheme();
  const navigation = useNavigation();

  /**
   * @param name to check
   * @returns 0 if the name is valid
   */
  const checkName = (name: string) => {
    return (name.length > maxNameLength ? 1 : 0)
      + (name.match(/^([0-9 ]|[a-z ])*?([0-9a-z ]*)$/i) ? 0 : 2);
  };

  /**
   * @param id to check
   * @returns 0 if the name is valid
   */
  const checkId = (id: string) => {
    return (id.length > maxIdLength ? 1 : 0)
      + (id.match(/^([0-9]|[a-z])*?([0-9a-z]*)$/) ? 0 : 2);
  };

  return (
    <Surface style={[
      Layout.justifyContentBetween,
      {
        width: "95%",
        marginTop: 20,
        borderRadius: 10,
        padding: 25,
        marginBottom: 0,
      }
    ]}
    elevation={4}>
      <Text style={{
        fontWeight: "600",
        fontSize: 17,
        marginBottom: 10,
      }}>
        Media
      </Text>
      <Button mode={"outlined"} style={{
          borderRadius: 10,
          margin: 0,
          borderStyle: "dashed",
          borderColor: "rgb(190, 190, 190)"
        }} contentStyle={[Layout.center]} onPress={() => Alert.alert("TODO")}>
          <View style={[
            Layout.center,
            {
              height: 150,
              paddingVertical: 10,
            }
          ]}>
            <MaterialCommunityIcons name={'file-image-plus'}
                                    size={25}
                                    color={theme.colors.secondary}
                                    style={{ margin: 0, marginBottom: 10 }}
            />
            <Text style={{
              fontSize: 16
            }}>
              Add media
            </Text>
          </View>
      </Button>

      {/* ID field */}
      <View style={{ marginTop: 20 }}>
        <TextInput
          selectionColor={theme.colors.secondary}
          activeUnderlineColor={theme.colors.secondary}
          activeOutlineColor={theme.colors.secondary}
          textColor={theme.colors.secondary}
          onChangeText={(value: string) => {
            setName(value);
          }}
          label={"Product Name"}
          value={name}
          error={checkName(name) !== 0}
        />
        <HelperText
          type="error"
          visible={checkName(name) !== 0}
        >
          {checkName(name) === 1
            ? `Maximum length is ${maxNameLength} characters`
            : "Only letters, numbers, & spaces are allowed"}
        </HelperText>
      </View>

      {/* name field */}
      <View>
        <TextInput
          selectionColor={theme.colors.secondary}
          activeUnderlineColor={theme.colors.secondary}
          activeOutlineColor={theme.colors.secondary}
          textColor={theme.colors.secondary}
          autoCapitalize={"none"}
          onChangeText={(value: string) => {
            setId(value);
          }}
          label={"Product ID"}
          value={id}
          error={checkId(id) !== 0}
        />
        <HelperText
          type="error"
          visible={checkId(id) !== 0}
        >
          {checkId(id) === 1
            ? `Maximum length is ${maxIdLength} characters`
            : "Only lower case letters & numbers"}
        </HelperText>
      </View>

      {/* description field */}
      <View>
        <Button mode={"contained-tonal"} onPress={() => {
          navigation.navigate(NavigationNames.DescriptionEditorModal as never);
        }}>
          <Text>{description}</Text>
        </Button>
      </View>
    </Surface>
  );
};

export default GeneralInfoSelector;
