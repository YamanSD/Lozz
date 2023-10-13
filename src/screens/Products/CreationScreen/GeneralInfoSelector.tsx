import React from "react";
import { Surface, Text, Button } from "react-native-paper";
import { useTheme as useBoilerTheme } from "../../../hooks";
import { useTheme as usePaperTheme } from "react-native-paper";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import NavigationNames from "../NavigationNames";
import { InputField } from "../../../components";
import {
  checkId,
  checkName,
  checkPrice,
  formatPrice,
  maxIdLength,
  maxNameLength, maxPrice,
  MonetaryType, unpackPrice
} from "../../../services";
import Icon from "react-native-vector-icons/MaterialIcons";
import GeneralImagePicker from "./GeneralImagePicker/GeneralImagePicker";

/**
 * Prop-type for the Media selector component.
 */
type Properties = {
  setImages: React.Dispatch<React.SetStateAction<string[]>>,
  images: string[],
  setId: React.Dispatch<React.SetStateAction<string>>,
  id: string,
  setName: React.Dispatch<React.SetStateAction<string>>,
  name: string,
  description: string // Modified by the navigation routes
  setPrice: React.Dispatch<React.SetStateAction<MonetaryType>>,
  price: MonetaryType,
  setCost: React.Dispatch<React.SetStateAction<MonetaryType>>,
  cost: MonetaryType
}

/**
 * Media selector component.
 *
 * @param setImages modifies the selected images.
 * @param images of the product
 * @param setName modifies the name of the product.
 * @param name name of the product.
 * @param description of the product.
 * @param setId modifies the ID of the product.
 * @param id id of the product.
 * @param setPrice modifies the product price
 * @param price of the product
 * @param setCost modifies the product cost
 * @param cost of the product
 * @constructor
 */
const GeneralInfoSelector = ({
    setImages,
    images,
    setName,
    name,
    description,
    setId,
    id,
    setPrice,
    price,
    setCost,
    cost,
  }: Properties) => {
  const { Layout } = useBoilerTheme();
  const theme = usePaperTheme();
  const navigation = useNavigation();

  /**
   * Used by description bar.
   */
  const onDescriptionClick = () => {
    navigation.navigate(
      NavigationNames.DescriptionEditorModal as never,
      {
        description: description
      } as never
    );
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
        fontSize: 22,
        marginBottom: 13,
      }}>
        Media
      </Text>
      {/* image picker */}
      <GeneralImagePicker images={images} setImages={setImages} />

      {/* Name field */}
      <InputField onChangeText={setName}
                  label={"Product Name"}
                  value={name}
                  errorChecker={(value) => {
                    return checkName(value) !== 0;
                  }}
                  errorMessage={(value) => {
                    return checkName(value) === 1
                      ? `Maximum length is ${maxNameLength} characters`
                      : "Only letters, numbers, & spaces are allowed"
                  }}
                  viewStyle={{ marginTop: 20 }}
      />

      {/* ID field */}
      <InputField onChangeText={setId}
                  label={"Product ID"}
                  value={id}
                  errorChecker={(value) => {
                    return checkId(value) !== 0;
                  }}
                  errorMessage={(value) => {
                    return checkId(value) === 1
                      ? `Maximum length is ${maxIdLength} characters`
                      : "Only lower case letters & numbers"
                  }}
      />

      {/* description field */}
      <TouchableOpacity style={[
          Layout.fullWidth,
          Layout.justifyContentBetween,
          Layout.rowHCenter,
          Layout.row,
          {
            borderBottomColor: theme.colors.secondary,
            borderBottomWidth: 1,
            paddingRight: 10,
            marginBottom: 20,
          }
        ]}
        onPress={onDescriptionClick}>
        <Button icon={description.length === 0 ? "plus" : undefined}
                textColor={theme.colors.secondary}
                style={[Layout.alignItemsStart, { width: "96%" }]}
                mode={"text"}>
          {description.length === 0 ? "Add description" : description}
        </Button>
        <Icon name={"chevron-right"} size={22} />
      </TouchableOpacity>

      {/* price field */}
      <InputField
        onChangeText={(value) => {
          setPrice(Math.abs(value));
        }}
        label={"Product price"}
        value={price}
        errorChecker={(value: MonetaryType) => {
          return checkPrice(value) !== 0;
        }}
        errorMessage={(value: MonetaryType) => {
          return checkPrice(value) === 1
            ? `Maximum value is ${maxPrice}`
            : "Only positive values allowed"
        }}
        inputMode={"numeric"}
        unpackValue={unpackPrice}
        formatValue={formatPrice}
      />

      {/* cost field */}
      <InputField
        onChangeText={(value) => {
          setCost(Math.abs(Number.parseFloat(value)));
        }}
        label={"Product cost"}
        value={cost}
        errorChecker={(value: MonetaryType) => {
          return checkPrice(value) !== 0;
        }}
        errorMessage={(value: MonetaryType) => {
          return checkPrice(value) === 1
            ? `Maximum value is $${maxPrice.toFixed(2)}`
            : "Only positive values allowed"
        }}
        inputMode={"numeric"}
        unpackValue={unpackPrice}
        formatValue={formatPrice}
      />
    </Surface>
  );
};

export default GeneralInfoSelector;
