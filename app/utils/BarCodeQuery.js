import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("products.db");

export const getNextProductBarcode = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT MAX(product_barcode) AS maxProductBarcode FROM products",
        [],
        (_, results) => {
          const maxProductBarcode = results.rows.item(0).maxProductBarcode;
          const nextProductBarcode = maxProductBarcode
            ? maxProductBarcode + 1
            : 1000;
          resolve(nextProductBarcode);
        },
        (error) => {
          console.error("Error selecting table: ", error);
          reject(error);
        }
      );
    });
  });
};
