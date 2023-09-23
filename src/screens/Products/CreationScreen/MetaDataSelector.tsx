import { Surface, Text } from "react-native-paper";
import React, { useState } from "react";
import { useTheme as useBoilerTheme } from "../../../hooks";
import { Dropdown } from "react-native-element-dropdown";
import { useTheme as usePaperTheme } from "react-native-paper";
import { StyleProp, TextStyle } from "react-native";
import { DependencyTree } from "../../../services";
import VendorListItem from "./VendorCategory/VendorListItem";
import CategoryListItem from "./VendorCategory/CategoryListItem";
import CategoryOptions from "./VendorCategory/CategoryOptions";

/**
 * Prop-type for the Instruction selector component.
 */
type Properties = {
  vendorId: string,
  setVendorId:  React.Dispatch<React.SetStateAction<string>>,
  categoryId: string,
  setCategoryId:  React.Dispatch<React.SetStateAction<string>>,
};

/**
 * @param vendorId of the product
 * @param setVendorId modifies the vendorId
 * @param categoryId of the product
 * @param setCategoryId modifies the categoryId
 * @constructor
 */
const MetaDataSelector = ({vendorId, setVendorId,
                            categoryId, setCategoryId}: Properties) => {
  const { Layout } = useBoilerTheme();
  const theme = usePaperTheme();

  /* set of vendor IDs */
  const [vendorIdSet, setVendorIdSet] = useState<Set<string>>(new Set());

  /* set of category IDs */
  const [categoryIdSet, setCategoryIdSet] = useState<Set<string>>(new Set());

  /* placeholder string for the vendors selector */
  const vendorPlaceholder = "Select a vendor";

  /* placeholder string for the categories selector */
  const categoryPlaceholder = "Select a category";

  /* textStyle used for the text fields */
  const textStyle: StyleProp<TextStyle> = {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.primary
  };

  return (
    <Surface style={[
      Layout.justifyContentBetween,
      {
        width: "95%",
        marginTop: 20,
        borderRadius: 10,
        padding: 25,
      }
    ]} elevation={4}>
      {/* vendor selection */}
      <Text style={{
        fontWeight: "600",
        fontSize: 21,
        marginBottom: 7,
      }}>
        Vendor
      </Text>
      <Dropdown
        onFocus={() => setVendorIdSet(DependencyTree.Vendors.idSet)}
        data={[...vendorIdSet].map(id => {
          return {
            vendorId: id
          };
        })}
        renderItem={({ vendorId }) => {
          return <VendorListItem vendorId={vendorId} />
        }}
        placeholder={vendorPlaceholder}
        placeholderStyle={textStyle}
        showsVerticalScrollIndicator={false}
        style={[
          Layout.fullWidth,
          {
            backgroundColor: theme.colors.secondary,
            paddingLeft: 10,
            paddingRight: 5,
            borderRadius: 5,
          }
        ]}
        labelField={"vendorId"}
        valueField={"vendorId"}
        value={vendorId}
        iconColor={theme.colors.primary}
        selectedTextStyle={textStyle}
        itemContainerStyle={{
          backgroundColor: theme.colors.secondary
        }}
        itemTextStyle={textStyle}
        onChange={({ vendorId }) => {
          setVendorId(vendorId);
        }}
      />

      {/* category selection */}
      <Text style={{
        fontWeight: "600",
        fontSize: 21,
        marginBottom: 7,
        marginTop: 15,
      }}>
        Category
      </Text>
      <Dropdown
        onFocus={() => setCategoryIdSet(DependencyTree.Categories.idSet)}
        data={[...categoryIdSet].map(id => {
          return {
            categoryId: id
          };
        })}
        renderItem={({ categoryId }) => {
          return <CategoryListItem categoryId={categoryId} />
        }}
        placeholder={categoryPlaceholder}
        placeholderStyle={textStyle}
        showsVerticalScrollIndicator={false}
        style={[
          Layout.fullWidth,
          {
            backgroundColor: theme.colors.secondary,
            paddingLeft: 10,
            paddingRight: 5,
            borderRadius: 5,
          }
        ]}
        labelField={"categoryId"}
        valueField={"categoryId"}
        value={categoryId}
        iconColor={theme.colors.primary}
        selectedTextStyle={textStyle}
        itemContainerStyle={{
          backgroundColor: theme.colors.secondary
        }}
        itemTextStyle={textStyle}
        onChange={({ categoryId }) => {
          setCategoryId(categoryId);
        }}
      />

      {/* display category options */}
      <Text style={{
        fontWeight: "600",
        fontSize: 21,
        marginBottom: 7,
        marginTop: 15,
      }}>
        Category options
      </Text>
      <CategoryOptions categoryId={categoryId} />
    </Surface>
  );
};

export default MetaDataSelector;
