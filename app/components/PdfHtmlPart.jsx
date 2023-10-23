import React, {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useMemo,
  lazy,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
// import PDFGenerator from "../components/PdfGenerator";
import * as SQLite from "expo-sqlite";
import { useDataStore, useRefresh } from "../store/mainstore";
import Checkbox from "expo-checkbox";
import LottieView from "lottie-react-native";
import { removeItem } from "../utils/asyncStorage";
import { useNavigation, Link } from "expo-router";

const db = SQLite.openDatabase("products.db");
const windowWidth = Dimensions.get("screen").width;
const windowHeight = Dimensions.get("screen").height;

export default function PdfHtmlPart() {
  // const [data, setValue] = useState([]);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatepdfloading, setGeneratepdfloading] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  const [generate, setGenerate] = useState(false);
  const Refresh = useRefresh();

  const handleReset = async () => {
    await removeItem("onboarded");
  };

  console.log(filteredData, "pp");

  const handleCheckboxChange = (product_name) => {
    setGenerate(false);
    const updatedCheckedItems = {
      ...checkedItems,
      [product_name]: !checkedItems[product_name],
    };
    setCheckedItems(updatedCheckedItems);
    const filtered = products.filter(
      (item) => updatedCheckedItems[item.product_name]
    );
    setFilteredData(filtered);
  };

  useEffect(() => {
    const fetchProducts = () => {
      db.transaction((tx) => {
        tx.executeSql(
          "SELECT * FROM products",
          [],
          (_, { rows }) => {
            setProducts(rows["_array"]);
            setFilteredData(rows["_array"]);
          },
          (_, error) => console.error("Error fetching products: ", error)
        );
      });
    };
    fetchProducts();
  }, [Refresh.allProductsRefresh]);

  useEffect(() => {
    if (products) {
      // Initialize checkedItems state based on product names in the data
      const initialCheckedItems = {};
      products?.forEach((item) => {
        initialCheckedItems[item.product_name] = true; // Default all checkboxes to true
      });
      setCheckedItems(initialCheckedItems);
    }
  }, [products]);

  const handleSelectAll = () => {
    let selectItems = {};
    products.forEach((product) => {
      selectItems[product.product_name] = true;
    });
    setCheckedItems(selectItems);
    const filtered = products.filter((item) => selectItems[item.product_name]);
    setFilteredData(filtered);
  };

  const renderHeader = () => (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        position: "sticky",
        backgroundColor: "#004E69",
        // width: windowWidth,
        marginBottom: 10,
        paddingVertical: 5,
      }}
    >
      <Text
        style={{
          fontStyle: "italic",
          fontSize: 12,
          fontWeight: "bold",
          color: "#FFFBF3",
          paddingVertical: 6,
        }}
      >
        List Of Products Selected({filteredData.length})
      </Text>
    </View>
  );
  const renderFooter = () => (
    <View style={{ height: windowHeight * 0.3 }}></View>
  );

  const handleDeselectAll = () => {
    let selectItems = {};
    products.forEach((product) => {
      selectItems[product.product_name] = false;
    });
    setCheckedItems(selectItems);
    // Filter data based on checked checkboxes
    const filtered = products.filter((item) => selectItems[item.product_name]);
    setFilteredData(filtered);
  };

  const generatePDF = async () => {
    setLoading(true);
    const QrGenerate = filteredData?.map((product, index) => {
      const productElements = Array.from(
        { length: product.product_count },
        (_, i) => `
      <div style="border-width: 0px 3px 0px 0px; border-style: solid; border-color: white; margin-right: 10px; margin-bottom: 5px;">
        <img width="50" height="50" src="data:image/png;base64,${product.product_dataUrl}"/>
        <p style="width:50px ; text-align:center; font-size:6px;">${product.product_name}</p>
      </div>
    `
      );

      return `
    <div style="display: flex; flex-direction: row; flex-wrap: wrap; ">
      ${productElements.join(" ")}
    </div>
  `;
    });
    const html = `
  <html>
    <head>
      <style>
        body {
          display: flex;
          flex-direction: column;
          align-items: center;
        } 
      </style>
    </head>
    <body>
      <h1>QR Code</h1>
      <div class="">
        ${QrGenerate}
      </div>
    </body>
  </html>
`;
    try {
      const pdf = await Print.printToFileAsync({
        html: html,
        base64: true,
      });

      await Sharing.shareAsync(pdf.uri, {
        mimeType: "application/pdf",
        dialogTitle: "Share PDF",
        UTI: "com.adobe.pdf",
      });
    } catch (error) {
      console.error("Error generating or sharing PDF:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <View style={styles.flatlistStyle}>
          {products?.length < 1 ? (
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
                  color: "rgba(255, 251, 243, 0.9)",
                  fontWeight: "bold",
                  opacity: 0.6,
                }}
              >
                Please add or import products before QR codes can be created.
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

                <Link href={"/(tabs)/productlogic/addproduct"} asChild>
                  <TouchableOpacity>
                    <Text style={styles.sortButtonX}>Add Product</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          ) : (
            <FlatList
              data={products}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View key={item.id} style={styles.checkBoxCover}>
                  <Checkbox
                    value={checkedItems[item.product_name]}
                    style={{ width: 30, height: 30 }}
                    onValueChange={() =>
                      handleCheckboxChange(item.product_name)
                    }
                  />
                  <Text
                    style={{
                      color: "white",
                      width: windowWidth * 0.25,
                      fontSize: 12,
                      textAlign: "center",
                      marginTop: 1,
                    }}
                  >
                    {item.product_name}
                  </Text>
                  <Text
                    style={{
                      color: "white",
                      width: windowWidth * 0.25,
                      fontSize: 10,
                      textAlign: "center",
                      marginTop: 1,
                    }}
                  >
                    ({item.product_count})
                  </Text>
                </View>
              )}
              numColumns={3}
              ListFooterComponent={renderFooter}
              ListHeaderComponent={renderHeader}
              stickyHeaderIndices={[0]}
            />
          )}
        </View>
      </View>
      <View
        style={{
          position: "absolute",
          bottom: 0,
          width: windowWidth,
          height: "auto",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#FFFBF3",
          // backgroundColor: "rgba(0, 78, 105, 0.7)",
          // marginBottom: windowHeight * 0.1,
          gap: 8,
          paddingHorizontal: 6,
        }}
      >
        <View style={styles.selectContainer}>
          {/* <View>
            <TouchableOpacity onPress={handleReset}>
              <Text>Reset Onboarding</Text>
            </TouchableOpacity>
          </View> */}
          <TouchableOpacity onPress={handleSelectAll} style={styles.selectBtnX}>
            <Text style={styles.selectText}>Select All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDeselectAll}
            style={styles.selectBtnX}
          >
            <Text style={styles.selectText}>Deselect All</Text>
          </TouchableOpacity>
        </View>
        {products?.length < 1 && filteredData?.length < 1 ? (
          <TouchableOpacity style={styles.generatePdfX}>
            <Text style={styles.selectText}>Generate PDF</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => generatePDF()}
            style={styles.generatePdf}
          >
            <Text style={styles.selectText}>Generate PDF</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && (
        <View
          style={{
            position: "absolute",
            backgroundColor: "#004e69",
            width: windowWidth,
            height: windowHeight,
            top: 0,
            opacity: 0.7,
            justifyContent: "center",
            alignItems: "center",
            // flex: 1,
            paddingBottom: windowHeight * 0.5,
          }}
        >
          <LottieView
            autoPlay
            style={{
              width: windowWidth * 0.7,
              // height: 200,
              // backgroundColor: "#eee",
            }}
            loop
            source={require("../../assets/filesLoadingLottie.json")}
          />
          <Text style={{ color: "white", marginTop: 10 }}>
            Generating Qrcodes...
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "column",
    // marginTop: windowHeight * 0.1,
    minHeight: windowHeight,
    position: "relative",
  },
  generatePdf: {
    backgroundColor: "#004E69",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: windowHeight * 0.17,
  },
  generatePdfX: {
    backgroundColor: "#cccccc",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: windowHeight * 0.17,
  },

  selectContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    // width: windowWidth,
    paddingHorizontal: 4,
    marginTop: 4,
  },
  selectBtn: {
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 6,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
    borderRadius: 8,
    width: "auto",
  },
  selectBtnX: {
    backgroundColor: "#004E69",
    paddingHorizontal: 12,
    paddingVertical: 6,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
    borderRadius: 8,
    width: "auto",
  },
  selectText: {
    color: "#FFFBF3",
  },
  checkBoxCover: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
    borderWidth: 5,
    borderColor: "#004e69",
    marginBottom: windowHeight * 0.01,
    marginHorizontal: "auto",
  },
  flatlistStyle: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: windowHeight * 0.03,
  },
});
