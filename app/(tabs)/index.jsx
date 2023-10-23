import {
  Button,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";

import EditScreenInfo from "../../components/EditScreenInfo";
import { Text } from "../../components/Themed";
import { useState, useEffect, useMemo, useCallback } from "react";
import { BarCodeScanner } from "expo-barcode-scanner";
import { Dimensions, Alert, Vibration, View } from "react-native";
import * as SQLite from "expo-sqlite";
import { useDataStore } from "../store/mainstore";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import NairaIcon from "../../assets/nairaicon.svg";
import {
  useSalesData,
  useSalesDataFilter,
  useRefresh,
} from "../store/mainstore";
import NairaLogoSvgComp from "../../assets/svgs/NairaLogoSvgComp";
import CurrencySignFormatter from "../components/CurrencySignFormatter";
import LottieView from "lottie-react-native";
import OnBoardingScreen from "../components/OnBoardingScreen";

const windowWidth = Dimensions.get("screen").width;
const windowHeight = Dimensions.get("screen").height;

const db = SQLite.openDatabase("products.db");

const buttonOperation = ({ operation, handleOperation }) => {
  return (
    <Pressable onPress={handleOperation} style={styles.btnOperation}>
      {/* {Vibration.vibrate([100, 50, 100])} */}
      <Text>{operation}</Text>
    </Pressable>
  );
};

export default function TabOneScreen() {
  const setDbValueStore = useSalesData((state) => state.setDbValue);
  const dbValueStore = useSalesData((state) => state.dbValue);
  const setSalesEmpty = useSalesData((state) => state.setDbValueEmpty);

  const setDbFilterStore = useSalesDataFilter((state) => state.setdbFilter);
  const dbFilterStore = useSalesDataFilter((state) => state.dbFilter);

  const [scanned, setScanned] = useState(false);
  const [scanBarcodeValue, setBarcodeValue] = useState([]);
  const [num, setNum] = useState(1);
  const [dbValue, setDbValue] = useState([]);
  const [resultArray, setResultArray] = useState([]);
  const [isLoadingSaving, setIsLoadingSave] = useState(false);
  const [products, setProducts] = useState([]);

  const [dbFilter, setdbFilter] = useState(dbValue);
  // const setProducts = useDataStore((state) => state.setProductsData);
  // const Products = useDataStore((state) => state.products);
  const currentTimestamp = Date.now(); // Returns milliseconds since epoch
  const currentTimestampInSeconds = Math.floor(currentTimestamp / 1000);
  const setSalesRecordRefresh = useRefresh(
    (state) => state.setSalesRecordRefresh
  );
  const [isTrue, setIsTrue] = useState(false);

  // console.log(products);
  useEffect(() => {
    if (dbValue.length > 0) {
      setDbValueStore(dbValue);
      setDbFilterStore(dbFilter);
    }
  }, [dbValue, dbFilter]);

  useEffect(() => {
    if (dbValueStore.length > 0) {
      setDbValue(dbValueStore);
      setdbFilter(dbFilterStore);
    }
  }, []);
  // console.log(dbFilterStore, "mmo");
  // console.log(dbFilter, "lll");

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

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_barcode INTEGER UNIQUE,
        product_name TEXT,
        price INTEGER,
        product_count INTEGER,
        product_dataUrl TEXT
      );

      CREATE TRIGGER IF NOT EXISTS product_barcode_autoincrement
      BEFORE INSERT ON products
      FOR EACH ROW
      BEGIN
        SELECT IFNULL(MAX(product_barcode), 999) + 1
        INTO NEW.product_barcode
        FROM products;

        UPDATE products
        SET product_barcode = NEW.product_barcode
        WHERE NEW.product_barcode IS NULL;
      END;
      `,
        [],
        () => console.log("Table created successfully"),
        (error) => console.error("Error creating table: ", error)
      );
    });
    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS sales
       (id INTEGER PRIMARY KEY,
       sales_data TEXT,
       timestamp INTEGER);`,
        [],
        () => console.log("Sales Record Table created successfully"),
        (error) => console.error("Error creating table: ", error)
      );
    });
  }, []);

  const generateUniqueId = () => {
    // Generate a unique ID using timestamp and a random number
    const timestamp = new Date().getTime();
    const randomNum = Math.floor(Math.random() * 1000);
    return `${timestamp}${randomNum}`;
  };
  console.log(dbValue, "dbvalue");

  const saveSalesData = () => {
    const totalprice = dbValue.reduce((x, y) => Math.round(x + y.price), 0);
    resultArray.sort((a, b) => b.value - a.value);
    dbFilter.sort((a, b) => b.barcode - a.barcode);
    let records = [];
    const salesID = generateUniqueId();
    for (let index = 0; index < dbFilter.length; index++) {
      records[index] = {
        ...dbFilter[index],
        ...resultArray[index],
        salestimestamp: currentTimestampInSeconds,
        totalprice,
      };
    }
    console.log(records, "records");
    const salesDataJson = JSON.stringify(records);
    if (dbValue.length === 0) {
      return;
    }
    if (salesDataJson) {
      db.transaction((tx) => {
        tx.executeSql(
          `INSERT INTO sales (id,sales_data,timestamp)
       VALUES (?, ?, ?);`,
          [salesID, salesDataJson, currentTimestampInSeconds],
          (_, results) => {
            console.log("Sales data saved successfully.");
          },
          (error) => {
            console.error("Error saving sales data:", error);
          }
        );
      });
      setSalesRecordRefresh();
    }
    setDbValue([]);
    setSalesEmpty();
    setdbFilter([]);
    setIsTrue(true);
  };

  // console.log(isLoadingSaving);

  const handleSubtract = (barcode) => {
    const updatedData = dbValue.filter(
      (item) => parseInt(item.barcode) === parseInt(barcode)
    );
    const updatedDataFilter = dbFilter.filter(
      (item) => parseInt(item.barcode) !== parseInt(barcode)
    );

    if (updatedData.length > 1) {
      console.log(updatedDataFilter);
      // Find the index of the last matching item
      const lastIndex = dbValue.lastIndexOf(
        updatedData[updatedData.length - 1]
      );

      // Create a new array excluding the last matching item
      const newData = [
        ...dbValue.slice(0, lastIndex),
        ...dbValue.slice(lastIndex + 1),
      ];

      // Update the state with the new array
      setDbValue(newData);
    } else {
      const lastIndex = dbValue.lastIndexOf(
        updatedData[updatedData.length - 1]
      );

      // Create a new array excluding the last matching item
      const newData = [
        ...dbValue.slice(0, lastIndex),
        ...dbValue.slice(lastIndex + 1),
      ];

      // Update the state with the new array
      setDbValue(newData);
      setdbFilter(updatedDataFilter);
    }
  };

  const handleRemoveItemid = (barcode) => {
    const updatedData = dbFilter.filter((item) => item.barcode !== barcode);
    return setdbFilter(updatedData);
  };

  const handleAdd = (barcode) => {
    const addItem = dbValue.find((item) => item.barcode == parseInt(barcode));
    const { timestamp, ...rest } = addItem;
    const AddMain = { timestamp: currentTimestampInSeconds, ...rest };

    if (addItem) {
      return setDbValue((prev) => [addItem, ...prev]);
    } else {
      return Alert.alert("Add Item", "Cant Add The Item");
    }
  };
  const Item = ({ title, key, price, barcode, product_count }) => {
    const itemToRender = dbValue.find((item) => item.barcode === barcode);
    const itemData = dbValue.filter((item) => item.barcode === barcode);
    // const itemToRender = CurrentSales?.mainSales;
    const single = resultArray.find((x) => x.value === parseInt(barcode));
    return (
      <Pressable
        style={({ pressed }) => [
          {
            backgroundColor: pressed ? "rgba(0, 0, 0, 0.1)" : "white",
          },
          styles.item,
        ]}
        onPress={() => console.log("pre")}
      >
        {buttonOperation({
          operation: "-",
          handleOperation: () => handleSubtract(barcode),
        })}

        <View
          style={{
            backgroundColor: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={styles.titlex}>{title}</Text>
          <CurrencySignFormatter price={price} />
          {/* <Text style={styles.price}>N {price}</Text> */}
        </View>
        {buttonOperation({
          operation: "+",
          handleOperation: () => handleAdd(barcode),
        })}
        <View style={styles.count}>
          {itemData ? (
            <Text style={styles.countText}>{itemData?.length}</Text>
          ) : null}
        </View>
        <View style={styles.remaining}>
          {itemData && itemData.length ? (
            <View style={styles.remainingText}>
              {itemToRender.product_count - itemData?.length < 1 ? (
                <Text style={styles.remainingText}>Out Of Stock</Text>
              ) : (
                <Text style={styles.remainingText}>
                  Remaining:{" "}
                  {Math.abs(itemToRender.product_count - itemData?.length)}
                </Text>
              )}
            </View>
          ) : null}
        </View>
      </Pressable>
    );
  };

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    setBarcodeValue(data);
    Vibration.vibrate([100, 50, 100]);
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM products WHERE product_barcode = ?",
        [data],
        (_, { rows }) => {
          if (rows.length > 0) {
            setDbValue((prev) => [
              {
                barcode: rows.item(0).product_barcode,
                code: rows.item(0).product_name,
                price: rows.item(0).price,
                product_count: rows.item(0).product_count,
                timestamp: currentTimestampInSeconds,
              },
              ...prev,
            ]);
          } else {
            Alert.alert("Error", "Product not found");
          }
        }
      );
    });
    setNum((prevNum) => prevNum + 1);
    return () => {
      Vibration.cancel();
    };
  };

  const handleCancel = () => {
    setDbValue([]), setdbFilter([]), setSalesEmpty();
  };

  useEffect(() => {
    let productBarcodes = [];
    dbValue.map((x) => {
      productBarcodes = [...productBarcodes, x.barcode];
      return null;
    });
    const countOccurrences = () => {
      const countDict = {};
      productBarcodes.forEach((value) => {
        countDict[value] = (countDict[value] || 0) + 1;
      });

      // Convert the dictionary to an array of tuples (value, count)
      const result = Object.entries(countDict).map(([key, value]) => ({
        value: parseInt(key), // Convert key to integer
        count: value,
      }));

      setResultArray(result);
    };

    const ddArray = resultArray.find(
      (x) => x.value === parseInt(scanBarcodeValue)
    );
    const ddCall = dbValue?.find(
      (x) => x.barcode === parseInt(scanBarcodeValue)
    );
    if (ddCall) {
      // Check if the barcode already exists in dbFilter
      const barcodeExists = dbFilter?.some(
        (item) => item.barcode === parseInt(scanBarcodeValue)
      );

      if (barcodeExists) {
        // Update the existing entry
        setdbFilter((prev) =>
          prev.map((item) =>
            item.barcode === parseInt(scanBarcodeValue)
              ? {
                  barcode: ddCall.barcode,
                  code: ddCall.code,
                  price: ddCall.price,
                  product_count: ddCall.product_count,
                  timestamp: ddCall.timestamp,
                  key: item.key, // Maintain the same key for the existing entry
                }
              : item
          )
        );
      } else {
        // Add a new unique entry
        setdbFilter((prev) => [
          {
            barcode: ddCall.barcode,
            code: ddCall.code,
            price: ddCall.price,
            timestamp: ddCall.timestamp,
            key: num,
          },
          ...prev,
        ]);
      }
    } else {
      return console.log("Barcode not found: ");
    }

    // setNum((prevNum) => prevNum + 1);

    countOccurrences();
  }, [dbValue]);

  return (
    <>
      {/* <OnBoardingScreen /> */}
      <SafeAreaView style={styles.container}>
        <View style={styles.details}>
          <View style={styles.cost}>
            <Text style={{ fontSize: 10 }}>Total Cost:</Text>
            <CurrencySignFormatter
              textstyle={{ fontSize: 20, fontWeight: "bold", color: "white" }}
              size={20}
              white={true}
              price={dbValue.reduce((x, y) => Math.round(x + y.price), 0)}
            />
          </View>
          <View style={styles.cost}>
            <Text style={{ fontSize: 10 }}>Total Count:</Text>
            <Text>{dbValue.length}</Text>
          </View>
        </View>
        <View style={styles.overlay}>
          {isTrue && (
            <LottieView
              autoPlay
              onAnimationFinish={() => {
                setIsTrue(false);
              }}
              loop={false}
              style={{
                height: "auto",
                width: windowWidth * 0.9,
                // marginTop: windowHeight * 0.06,
                zIndex: 55,
              }}
              source={require("../../assets/salesConfirm.json")}
            />
          )}
          <View
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "center",
              width: windowWidth,
              height: windowWidth,
              paddingBottom: windowHeight * 0.1,
              // backgroundColor: "#004e69",
            }}
          >
            <FlatList
              data={dbFilter}
              renderItem={({ item }) => (
                <Item
                  title={item.code}
                  id={item.key}
                  price={item.price}
                  barcode={item.barcode}
                  product_count={item.product_count}
                />
              )}
              keyExtractor={(item) => item.key?.toString()}
              numColumns={1}
            />
          </View>
          <View style={styles.scannerstyle}>
            <TouchableOpacity onPress={() => handleCancel()}>
              <View
                style={{
                  backgroundColor: "#ff794d",
                  // padding: 20,
                  height: 60,
                  width: 60,
                  borderRadius: 999,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <FontAwesome name="close" size={30} color={"white"} />
              </View>
            </TouchableOpacity>
            {scanned ? (
              <>
                <TouchableOpacity onPress={() => setScanned(false)}>
                  <View
                    style={{
                      backgroundColor: "#ffb70f",
                      // padding: 20,
                      height: 80,
                      width: 80,
                      borderRadius: 999,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <FontAwesome name="qrcode" size={50} color={"white"} />
                  </View>
                </TouchableOpacity>
              </>
            ) : (
              <LottieView
                autoPlay
                style={{
                  height: 80,
                  width: 80,
                  marginBottom: 12,
                }}
                loop
                source={require("../../assets/scanLoading.json")}
              />
            )}
            <TouchableOpacity onPress={() => saveSalesData()}>
              <View
                style={{
                  backgroundColor: "#05fa53",
                  // padding: 20,
                  height: 60,
                  width: 60,
                  borderRadius: 999,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <FontAwesome name="save" size={30} color={"white"} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={{
            height: windowHeight,
            width: windowWidth,
            position: "absolute",
            bottom: windowHeight * 0.1,
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            // zIndex: 1,
          }}
          // barCodeTypes={[BarCodeScanner.Constants.BarCodeType.code128]}
        />
        <View
          style={{
            position: "absolute",
            width: windowWidth,
            height: windowHeight,
            // zIndex: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            // y: windowHeight * 0.1,
            top: -windowHeight * 0.4,
          }}
        >
          <LottieView
            autoPlay
            style={{
              width: windowWidth * 0.7,
              height: windowHeight * 0.2,
              marginTop: windowHeight * 0.02,
              opacity: 0.7,
            }}
            loop
            source={require("../../assets/QrcodeScan.json")}
          />
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "flex-end",
    position: "relative",
    // backgroundColor: "#015c7a",
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
  overlay: {
    backgroundColor: "#004e69",
    position: "relative",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    zIndex: 50,
    width: windowWidth,
    height: windowHeight * 0.5,
    // paddingTop: 40,
  },
  item: {
    backgroundColor: "white",
    paddingHorizontal: 6,
    paddingVertical: 8,
    marginTop: 25,
    marginHorizontal: 15,
    borderRadius: 12,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 6,
    position: "relative",
    width: windowWidth * 0.8,
    height: windowHeight * 0.08,
    // backgroundColor: "#57ff84",
  },
  titlex: {
    fontSize: 18,
    color: "black",
  },
  price: {
    fontSize: 12,
    color: "black",
  },
  details: {
    backgroundColor: "#015c7a",
    position: "relative",
    width: windowWidth,
    height: windowHeight * 0.06,
    zIndex: 6,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  cost: {
    backgroundColor: "#015c7a",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 2,
  },
  btnOperation: {
    backgroundColor: "#2b2b2b",
    width: 30,
    height: 30,
    borderRadius: 60,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  count: {
    position: "absolute",
    top: -20,
    left: -15,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: 30,
    height: 30,
    borderRadius: 50,
    backgroundColor: "black",
  },
  remaining: {
    position: "absolute",
    top: -10,
    right: -15,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 50,
    backgroundColor: "black",
  },
  countText: {
    color: "white",

    // fontSize: 18,
    // padding: 6,
  },
  remainingText: {
    color: "white",
    fontSize: 9,
    // fontSize: 18,
    // padding: 6,
  },
  scannerstyle: {
    backgroundColor: "#004e69",
    position: "absolute",
    bottom: 0,
    width: windowWidth,
    // height: windowHeight * 0.06,
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "row",
  },
});
