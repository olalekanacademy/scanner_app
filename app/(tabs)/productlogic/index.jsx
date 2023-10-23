import {
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from "react-native";

import * as SQLite from "expo-sqlite";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { View, TextInput, Button, Alert, Text } from "react-native";
import NairaIcon from "../../../assets/nairaiconblack.svg";
import { Link } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { useRefresh } from "../../store/mainstore";
import { exportData } from "../../utils/ExportJsonData";
import handleJsonImport from "../../utils/ImportJsonData";
import CurrencySignFormatter from "../../components/CurrencySignFormatter";

const windowWidth = Dimensions.get("screen").width;
const windowHeight = Dimensions.get("screen").height;

const db = SQLite.openDatabase("products.db");
export default function TabTwoScreen() {
  const [productsData, setProductsData] = useState([]);
  const [products, setProducts] = useState([]);

  const { control, handleSubmit, reset } = useForm();
  const [selectedProduct, setSelectedProduct] = useState(null);

  // ... other state variables ...
  const [searchText, setSearchText] = useState("");
  const [filterPrice, setFilterPrice] = useState(null);
  const [filterCount, setFilterCount] = useState(null);

  // Sorting state
  const [sortPriceAsc, setSortPriceAsc] = useState(true);
  const [sortCountAsc, setSortCountAsc] = useState(true);

  // ... other code ...

  const [toggle, setToggle] = useState(true);
  const [dataSwitch, setDataSwitch] = useState(true);
  const [fetchDataCount, setFetchDataCount] = useState(1);

  const Refresh = useRefresh();
  const fetchProducts = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM products",
        [],
        (_, { rows }) => {
          setProducts(rows["_array"]);
        },
        (_, error) => console.error("Error fetching products: ", error)
      );
    });
  };
  const fetchJsonDataAndPopulateDatabase = async () => {
    try {
      const jsonData = await handleJsonImport();
      if (jsonData) {
        const totalProducts = jsonData.length;
        let insertedCount = 0;
        let updatedCount = 0;

        db.transaction(
          (tx) => {
            jsonData.forEach((product) => {
              // Check if the product barcode already exists in the database
              tx.executeSql(
                "SELECT * FROM products WHERE product_barcode = ?",
                [product.product_barcode],
                (_, { rows }) => {
                  const existingProduct = rows._array[0];

                  if (existingProduct) {
                    // Product with the same barcode exists, update the record
                    tx.executeSql(
                      `UPDATE products SET product_name = ?, price = ?, product_count = ? WHERE product_barcode = ${product.product_barcode}`,
                      [
                        product.product_name,
                        product.price,
                        product.product_count,
                      ],
                      (_, results) => {
                        updatedCount++;
                        checkCompletion();
                      }
                    );
                  } else {
                    // Product with the same barcode does not exist, insert a new record
                    tx.executeSql(
                      "INSERT INTO products (product_barcode, product_name, price, product_count,product_dataUrl) VALUES (?, ?, ?, ?, ?)",
                      [
                        product.product_barcode,
                        product.product_name,
                        product.price,
                        product.product_count,
                        product.product_dataUrl,
                      ],
                      (_, results) => {
                        insertedCount++;
                        checkCompletion();
                      }
                    );
                  }
                },
                (error) =>
                  console.error("Error checking product existence: ", error)
              );
            });
          },
          (error) => console.error("Transaction error: ", error)
        );

        const checkCompletion = () => {
          const completedOperations = insertedCount + updatedCount;
          if (completedOperations === totalProducts) {
            // All operations completed
            const message = `Products updated: ${updatedCount} | Products inserted: ${insertedCount}`;
            Alert.alert("Success", message);
            fetchProducts();
          }
        };
      }
    } catch (error) {
      console.error("Error handling file selection:", error);
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
  };
  // Filter and search logic for the FlatList
  const filteredData = products.filter((item) => {
    return (
      searchText === "" ||
      item.product_name.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  const sortedDataPrice = [...filteredData].sort((a, b) => {
    if (sortPriceAsc) {
      return parseInt(a.price) - parseInt(b.price);
    } else {
      return parseInt(b.price) - parseInt(a.price);
    }
  });
  // console.log(filteredData, "ooo");

  const sortedDataByCount = [...filteredData].sort((a, b) => {
    if (sortCountAsc) {
      return a.product_count - b.product_count;
    } else {
      return b.product_count - a.product_count;
    }
  });

  const handleSortByPrice = () => {
    setDataSwitch(false);
    setSortPriceAsc((prev) => !prev);
  };

  const handleSortByCount = () => {
    setDataSwitch(true);
    setSortCountAsc((prev) => !prev);
  };

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_barcode INTEGER UNIQUE,
        product_name TEXT,
        price INTEGER,
        product_count INTEGER
      );
      `,
        [],
        () => console.log("Table created successfully"),
        (error) => console.error("Error creating table: ", error)
      );
    });
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [Refresh.allProductsRefresh, fetchDataCount]);

  //   console.log(products);

  const handleDelete = (productId) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          "DELETE FROM products WHERE id = ?;",
          [productId],
          (_, results) => {
            console.log("Product deleted successfully");
            fetchProducts();
            Alert.alert("Success", "Product deleted successfully");
          },
          (error) => {
            console.error("Error deleting product: ", error);
            Alert.alert("Error", "Error deleting product");
          }
        );
      },
      null,
      null
    );
  };

  const handleDeleteAll = () => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          "DELETE FROM products;",
          [],
          (_, results) => {
            fetchProducts();
            Alert.alert("Success", "Records deleted successfully");
          },
          (error) => {
            Alert.alert("Error", "Error deleting Records");
          }
        );
      },
      null,
      null
    );
  };

  const handlePressDelete = (item) => {
    Alert.alert(
      "Are You Sure?",
      "This action will permanently delete the item.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => handleDelete(item),
        },
      ]
    );
  };

  const handleExportNDel = () => {
    const exportRecords = exportData({
      data: products,
      filename: "products_record_data_",
    });
    if (exportRecords) {
      handleDeleteAll();
    }
  };

  const handleMenuPress = () => {
    Alert.alert("Choose an action", null, [
      {
        text: "Export Records Then Delete",
        onPress: () => handleExportNDel(),
      },
      {
        text: "Delete All",
        onPress: () => handleDeleteAll(),
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const renderProductItem = ({ item }) => (
    <View style={styles.listContainer} key={Refresh?.allProductsRefresh}>
      <View style={styles.listView}>
        <View style={styles.listText}>
          <Text style={styles.listTextProductname}>{item.product_name}</Text>

          <View style={styles.listTextProductprice}>
            <CurrencySignFormatter title={"Price:"} price={item.price} />
          </View>
          <Text style={styles.listTextProductcount}>
            Product Count: {item.product_count}
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 6 }}>
          <Link href={`productlogic/${item.id}`} asChild>
            <TouchableOpacity
              style={styles.listBtn}
              onPress={() => {
                setSelectedProduct(item);
                reset(item); // Populate the form fields with the selected product's data
              }}
            >
              <FontAwesome name="edit" size={20} />
            </TouchableOpacity>
          </Link>
          <TouchableOpacity
            style={styles.listBtnDel}
            onPress={() => handlePressDelete(item.id)}
          >
            {/* <Text style={styles.listBtnTextUpdate}>X</Text> */}
            <FontAwesome name="trash" size={20} style={{ color: "red" }} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#004E69",
        paddingVertical: 4,
      }}
    >
      <Text
        style={{
          fontStyle: "italic",
          fontSize: 10,
          fontWeight: "bold",
          color: "white",
          paddingVertical: 6,
        }}
      >
        List Of Products({products.length})
      </Text>
    </View>
  );
  const renderFooter = () => (
    <View style={{ height: windowHeight * 0.1 }}></View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchfield}>
        <Text
          style={{
            textAlign: "left",
            fontSize: 10,
            color: "white",
            marginBottom: 4,
            marginRight: "auto",
          }}
        >
          Search for products
        </Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by product name"
          onChangeText={handleSearch}
          value={searchText}
        />
      </View>
      <View style={styles.sortBtn}>
        <TouchableOpacity onPress={handleSortByPrice}>
          <Text style={styles.sortButton}>
            {String("Sort by Price").toUpperCase()}{" "}
            {sortPriceAsc ? (
              <FontAwesome name="arrow-up" size={20} />
            ) : (
              <FontAwesome name="arrow-down" size={20} />
            )}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSortByCount}>
          <Text style={styles.sortButton}>
            {String("Sort by Count").toUpperCase()}{" "}
            {sortCountAsc ? (
              <FontAwesome name="arrow-up" size={20} />
            ) : (
              <FontAwesome name="arrow-down" size={20} />
            )}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: "row", gap: 6 }}>
        <TouchableOpacity
          onPress={() =>
            exportData({ data: products, filename: "products_record_data_" })
          }
        >
          <Text style={styles.sortButtonX}>Export Records</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => fetchJsonDataAndPopulateDatabase()}>
          <Text style={styles.sortButtonX}>Import Records</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleMenuPress()}>
          <Text style={styles.sortButtonDel}>
            <FontAwesome name="trash" size={15} />
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1 }}>
        {products.length < 1 ? (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
              flexDirection: "column",
            }}
          >
            <Text
              style={{
                fontSize: 22,
                color: "#FFFBF3",
                fontWeight: "bold",
                opacity: 0.6,
              }}
            >
              Your Product List Is Empty
            </Text>
            <View
              style={{
                flexDirection: "row",
                gap: 4,
                marginBottom: windowHeight * 0.1,
              }}
            >
              <TouchableOpacity
                onPress={() => fetchJsonDataAndPopulateDatabase()}
              >
                <Text style={styles.sortButtonX}>Import Records</Text>
              </TouchableOpacity>

              <Link href={"productlogic/addproduct"} asChild>
                <TouchableOpacity>
                  <Text style={styles.sortButtonX}>Add Product</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        ) : (
          <FlatList
            data={dataSwitch ? sortedDataByCount : sortedDataPrice}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderProductItem}
            style={{ paddingBottom: 100 }}
            ListFooterComponent={renderFooter}
            ListHeaderComponent={renderHeader}
            stickyHeaderIndices={[0]}
          />
        )}
      </View>

      {/* Add Product Button */}
      <TouchableOpacity style={styles.flotingBtn}>
        <Link href={"productlogic/addproduct"} style={styles.flotingPress}>
          <Text style={styles.flotingText}>ADD PRODUCT</Text>
        </Link>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#004e69",
    // paddingVertical: 12,
    // paddingTop: 20,
    // paddingBottom: windowHeight * 0.1,
  },
  mainContainer: {
    backgroundColor: "#004e69",
    minHeight: windowHeight,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  containerx: {
    paddingTop: 100,
    paddingHorizontal: 30,
    backgroundColor: "#004e69",
  },
  listContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    // marginBottom: 20,
    gap: 10,

    // marginTop: 5,
  },
  listView: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "white",
    marginBottom: 6,
    width: windowWidth * 0.95,
    borderRadius: 6,

    // color: "black",
  },
  listText: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
  },
  listTextProductname: {
    color: "black",
    fontWeight: "bold",
    fontSize: 16,
  },
  listTextProductprice: {
    color: "black",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  listTextProductcount: {
    color: "black",
    fontStyle: "italic",
  },
  listBtn: {
    paddingVertical: 4,
  },

  listBtnTextUpdate: {
    color: "white",
    fontSize: 18,
  },
  listBtnDel: {
    // backgroundColor: "#ff636e",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  flotingBtn: {
    backgroundColor: "#FFFBF3",
    borderColor: "#004e69",
    borderWidth: 3,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    position: "absolute",
    right: 0,
    bottom: 0,
    marginBottom: 20,
    marginRight: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  flotingText: {
    fontSize: 16,
    textAlign: "center",
    color: "#004e69",
    // letterSpacing: 0,
  },
  flotingPress: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "red",
  },
  searchInput: {
    backgroundColor: "white",
    // height: windowHeight * 0.1,
    borderColor: "gray",
    borderWidth: 1,
    width: windowWidth * 0.9,
    fontSize: 18,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 9,
    position: "relative",
  },

  filterInput: {
    backgroundColor: "white",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  sortBtn: {
    display: "flex",
    flexDirection: "row",
    alignItems: "",
    marginBottom: 0,
    gap: 6,
  },

  sortButton: {
    backgroundColor: "white",
    marginTop: 10,
    color: "#004e69",
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
    textAlign: "center",
    borderRadius: 6,
    display: "flex",
    // fontSize: 6,
    // gap: 6,
  },
  sortButtonX: {
    backgroundColor: "#edfaff",
    marginTop: 5,
    color: "#004e69",
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
    textAlign: "center",
    borderRadius: 6,
    display: "flex",
    fontSize: 12,
  },
  sortButtonDel: {
    backgroundColor: "#ff3d33",
    marginTop: 5,
    color: "#004e69",
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
    textAlign: "center",
    borderRadius: 6,
    display: "flex",
    fontSize: 12,
    // gap: 6,
  },
  searchfield: {
    marginTop: 10,
    position: "relative",
    width: "100%",
    marginVertical: "auto",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  searchCloseBtn: {
    position: "absolute",
    // top: 0.5,
    // right: 0,
    display: "flex",
    justifyContent: "center",
    // flex: 1,
    alignItems: "flex-end",
    width: "100%",
  },

  flatlist: {
    flex: 1,
  },
});
