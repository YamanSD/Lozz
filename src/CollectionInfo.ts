import firestore from "@react-native-firebase/firestore";

export default {
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
    properties: "productProperties"
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
