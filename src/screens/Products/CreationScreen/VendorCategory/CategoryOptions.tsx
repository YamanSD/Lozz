import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Category, DependencyTree } from "../../../../services";
import CategoryOptionRow from "./CategoryOptionRow";

/**
 * Prop-type for the CategoryOptions display
 */
type Properties = {
  categoryId: string
};

/**
 * @param categoryId ID of the category to display its options.
 * @constructor
 */
const CategoryOptions = ({ categoryId }: Properties) => {
  /* category of the component */
  const [category, setCategory] =
    useState<Category | undefined>(undefined);

  /* load the category */
  useEffect(() => {
    if (!DependencyTree.Categories.idSet.has(categoryId)) {
      return;
    }

    DependencyTree.Categories.get(categoryId).then(c => {
      setCategory(c);
    });
  }, [categoryId]);

  const keys = category?.option_keys

  return (
    <View>
      {keys !== undefined ?
        (
            keys.map((key) => {
            const optionValues = category?.option_sets;

            if (optionValues === undefined) {
              return null;
            }

            return <CategoryOptionRow key={key}
                                      optionKey={key}
                                      optionValues={optionValues[key]}
            />
          })
        ) : null
      }
    </View>
  );
};

export default CategoryOptions;
