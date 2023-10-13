import firestore from "@react-native-firebase/firestore";

export default {
  app_name: "Tester",
  provinces: [
    "Akkar", "Baalbek-Hermel", "Beirut",
    "Beqaa", "Keserwan-Jbeil", "Mount Lebanon",
    "Nabatieh", "North", "South", "Unknown"
  ],
  statistics: {
    name: "statistics_locale",
    id: "timestamp"
  },
  ids: "identifiers",
  online_detection: "online",
  server: firestore,
  testing_id: "TESTING_ID",
  vendor: {
    name: "vendors",
    id: "name"
  },
  category: {
    name: "categories",
    id: "name"
  },
  expense: {
    name: "expenses",
    id: "id"
  },
  courier: {
    name: "couriers",
    id: "name"
  },
  restock: {
    name: "restocks",
    id: "id"
  },
  customer: {
    name: "customers",
    id: "phone_number"
  },
  employee: {
    name: "employees",
    id: "id"
  },
  product: {
    name: "products",
    id: "id",
    properties: "productProperties",
    maxImageCount: 15,
  },
  order: {
    name: "orders",
    id: "id"
  },
  information: {
    name: "informationProperties",
    id: "type",
  }
};
