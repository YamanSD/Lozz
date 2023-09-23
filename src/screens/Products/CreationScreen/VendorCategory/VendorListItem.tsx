import React, { useEffect, useState } from "react";
import { StyleProp, TextStyle, View, ViewStyle } from "react-native";
import { DependencyTree, Vendor } from "../../../../services";
import { Surface, Text } from "react-native-paper";
import { useTheme as useBoilerTheme } from "../../../../hooks";
import { useTheme as usePaperTheme } from "react-native-paper";

/**
 * Prop-type for the VendorListItems
 */
type Properties = {
  vendorId: string,
};

/**
 * @param vendorId to display its data
 * @constructor
 */
const VendorListItem = ({ vendorId }: Properties) => {
  const { Layout } = useBoilerTheme();
  const theme = usePaperTheme();

  /* used when a value is undefined */
  const placeholderText = "Loading...";
  const placeholderEmail = "No registered emails";
  const placeholderPhone = "No registered phone numbers";

  /* vendor of the component */
  const [vendor, setVendor] =
    useState<Vendor | undefined>(undefined);

  /* load the vendor */
  useEffect(() => {
    DependencyTree.Vendors.get(vendorId).then(v => {
      setVendor(v);
    });
  }, [vendorId]);

  /* used by text fields */
  const textStyle: StyleProp<TextStyle> = [
    {
      fontWeight: "700",
      color: theme.colors.primary,
      marginVertical: 3,
    }
  ];

  /* used by text field containers */
  const textContainerStyle: StyleProp<ViewStyle> = [
    Layout.fullWidth,
    Layout.row,
    Layout.rowHCenter,
    Layout.justifyContentBetween,
    {
      borderBottomColor: theme.colors.primary,
      borderBottomWidth: 1,
      paddingVertical: 4,
    }
  ];

  return (
    <Surface style={[
      Layout.fullWidth,
      {
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: theme.colors.secondary,
        borderBottomColor: theme.colors.primary,
        borderBottomWidth: 3
      }
    ]} elevation={5}>
      <View style={textContainerStyle}>
        <Text style={textStyle}>
          -Name:
        </Text>
        <Text style={textStyle}>
          {vendor?.name ?? placeholderText}
        </Text>
      </View>

      <View style={textContainerStyle}>
        <Text style={textStyle}>
          -Emails:
        </Text>
        <Text style={textStyle}>
          {vendor?.emails?.at(0) ?? placeholderEmail}
        </Text>
      </View>

      <View style={textContainerStyle}>
        <Text style={textStyle}>
          -Phone:
        </Text>
        <Text style={textStyle}>
          {vendor?.phone_numbers?.at(0) ?? placeholderPhone}
        </Text>
      </View>
    </Surface>
  );
}

export default VendorListItem;
