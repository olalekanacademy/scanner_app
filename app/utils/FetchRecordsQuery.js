import * as SQLite from "expo-sqlite";
import { useState } from "react";

const db = SQLite.openDatabase("products.db");

export const FetchAllRecordsQuery = () => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT * FROM products",
      [],
      (_, { rows }) => {
        return rows["_array"];
      },
      (_, error) => console.error("Error fetching products: ", error)
    );
  });
};
