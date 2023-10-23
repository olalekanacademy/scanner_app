import {
  View,
  StyleSheet,
  Dimensions,
  Button,
  TextInput,
  Alert,
  Text,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { Link, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SQLite from "expo-sqlite";
import { useForm, Controller } from "react-hook-form";
import { FontAwesome } from "@expo/vector-icons";
import { useVoiceRecognition } from "../../../hooks/useVoiceRecognition";
import { useEffect, useState, useRef } from "react";
import { useVoiceStore, useRefresh } from "../../store/mainstore";
import QRCode from "react-native-qrcode-svg";
import LottieView from "lottie-react-native";

const windowWidth = Dimensions.get("screen").width;
const windowHeight = Dimensions.get("screen").height;

const db = SQLite.openDatabase("products.db");
export default function CreateProductForm() {
  const [per, setPer] = useState(false);
  const [disableBtn, setDisableBtn] = useState(true);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm();
  // const { state, startRecognizing, cancelRecognizing, stopRecognizing } =
  //   useVoiceRecognition();
  // const VoiceStore = useVoiceStore();
  const isPresented = router.canGoBack();
  const Refresh = useRefresh();
  const ref = useRef();
  const [productBarcode, setProductBarcode] = useState("easy bizz");
  const [productDataUrl, setProductDataUrl] = useState("");
  const [refresh, setRefresh] = useState(1);
  const [addLoading, setAddLoading] = useState(false);

  const nameTextInputRef = useRef();

  const isProductAlreadyExist = async (productName) => {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          "SELECT * FROM products WHERE product_name = ?",
          [productName],
          (_, results) => {
            const productExists = results.rows.length > 0;
            resolve(productExists);
          },
          (error) => {
            console.error("Error checking product existence: ", error);
            // Alert.alert("Error", "Product Name Already Exist");
            reject(error);
          }
        );
      });
    });
  };

  const fetchData = async () => {
    const nextProductBarcode = await getNextProductBarcode();
    setProductBarcode(nextProductBarcode);
  };
  useEffect(() => {
    fetchData();
  }, [refresh]);

  const getNextDataUrl = () => {
    return new Promise((resolve, reject) => {
      ref.current?.toDataURL((data) => {
        resolve(data);
      });
    });
  };

  const getNextProductBarcode = () => {
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
            setProductBarcode(nextProductBarcode);

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
  const onSubmit = async (inputData) => {
    setAddLoading(true);
    try {
      // setProductBarcode(nextProductBarcode)
      const productDataUrlPromise = await getNextDataUrl();
      if (productDataUrlPromise) {
        console.log(productDataUrlPromise, "oioio");
        const data = {
          ...inputData,
          productData: productDataUrlPromise,
        };
        const productAlreadyExists = await isProductAlreadyExist(
          data.productName
        );

        if (productAlreadyExists) {
          Alert.alert("Error", "Product name already exists");
          return;
        }
        db.transaction(
          (tx) => {
            tx.executeSql(
              "INSERT INTO products (product_barcode, product_name, price, product_count, product_dataUrl) VALUES (?, ?, ?, ?,?);",
              [
                productBarcode,
                data.productName,
                data.productPrice,
                data.productCount,
                data.productData,
              ],
              (_, results) => {
                console.log("Product inserted successfully");
                Refresh.setAllProductsRefresh();
                setRefresh((prev) => prev + 1);
                reset();
                // fetchProducts();
                Alert.alert("Success", "Product inserted successfully");
              },
              (error) => {
                console.error("Error inserting product: ", error);
                Alert.alert("Error", "Error inserting product");
              }
            );
          },
          null,
          null
        );
        // reset();
        // VoiceStore.setVoiceNameInputData("");
        // VoiceStore.setVoiceCountInputData("");
        // VoiceStore.setVoicePriceInputData("");
      }
    } catch (error) {
      console.error("Error getting next product barcode: ", error);
      Alert.alert("Error", "Error getting next product barcode");
    } finally {
      setAddLoading(false);
    }
  };
  const isNumeric = (value) => {
    return /^[0-9]+$/.test(value);
  };
  const isNumericDecimal = (value) => {
    return /^\d+(\.\d*)?$/.test(value);
  };
  return (
    <View style={styles.container}>
      {!isPresented && <Link href="../">Dismiss</Link>}
      <StatusBar style="light" />
      {/* <View>
        <Text>{JSON.stringify(state, null, 2)}</Text>
      </View> */}
      <View style={styles.formContainer}>
        <Text style={{ color: "white", fontSize: 10 }}>PRODUCT NAME</Text>
        <Controller
          name="productName"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <View>
              <TextInput
                placeholder="Product Name"
                onChangeText={(text) => {
                  field.onChange(text);

                  // if (Array.from(text).length === 0) {
                  //   return VoiceStore.setVoiceNameInputDataEmpty();
                  // }
                }}
                value={field.value}
                style={styles.textinput}
              />
              {/* <TouchableOpacity
                onPressIn={() => {
                  startRecognizing();
                }}
                onPressOut={() => {
                  VoiceStore.setVoiceNameInputData(state.results[0]);

                  stopRecognizing();
                }}
              >
                <FontAwesome name="microphone" size={50} color={"#f09b24"} />
              </TouchableOpacity>
              {errors.productName && (
                <Text style={styles.errorText}>Product Name is required</Text>
              )} */}
            </View>
          )}
        />
        <Text style={{ color: "white", fontSize: 10 }}>PRODUCT PRICE(NGN)</Text>

        <Controller
          name="productPrice"
          control={control}
          rules={{
            required: true,
            pattern: {
              value: /^\d+(\.\d{1,2})?$/,
              message: "Product Price must be a number",
            },
          }}
          render={({ field }) => (
            <View>
              <TextInput
                placeholder="Product Price"
                onChangeText={field.onChange}
                value={field.value}
                style={styles.textinput}
                keyboardType="numeric"
              />
              {/* <Pressable
                  onPressIn={() => {
                    startRecognizing();
                  }}
                  onPressOut={() => {
                    stopRecognizing();
                    // cancelRecognizing();
                    VoiceStore.setVoicePriceInputData(state.results[0]);
                  }}
                >
                  <FontAwesome name="microphone" size={50} />
                </Pressable> */}
              {errors.productPrice &&
                (errors.productPrice.type === "required" ? (
                  <Text style={styles.errorText}>
                    Product Price is required
                  </Text>
                ) : (
                  <Text style={styles.errorTextNumber}>
                    Product Price must be a number
                  </Text>
                ))}
            </View>
          )}
        />
        <Text style={{ color: "white", fontSize: 10 }}>PRODUCT COUNT</Text>

        <Controller
          name="productCount"
          control={control}
          rules={{
            required: true,
            pattern: {
              value: /^\d+$/,
              message: "Product Price must be a number",
            },
          }}
          render={({ field }) => (
            <View>
              <TextInput
                placeholder="Product Count"
                onChangeText={field.onChange}
                value={field.value}
                style={styles.textinput}
                keyboardType="numeric"
              />
              {/* <Pressable
                  onPressIn={() => {
                    startRecognizing();
                  }}
                  onPressOut={() => {
                    // cancelRecognizing();
                    stopRecognizing();
                    VoiceStore.setVoiceCountInputData(state.results[0]);
                  }}
                >
                  <FontAwesome name="microphone" size={50} />
                </Pressable> */}
              {errors.productCount &&
                (errors.productCount.type === "required" ? (
                  <Text style={styles.errorText}>
                    Product Count is required
                  </Text>
                ) : (
                  <Text style={styles.errorTextNumber}>
                    Product Count must be a number
                  </Text>
                ))}
            </View>
          )}
        />
        <TouchableOpacity onPress={handleSubmit(onSubmit)}>
          <Text style={styles.btnInput}>Add New Product</Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          opacity: 0,
          height: 0,
          width: 0,
        }}
      >
        {<QRCode value={`${productBarcode}`} size={50} getRef={ref} />}
      </View>
      {addLoading && (
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
            source={require("../../../assets/loading.json")}
          />
          <Text style={{ color: "white", marginTop: 10 }}>
            Generating Qrcodes...
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#004e69",
    // paddingBottom: windowHeight * 0.1,
  },
  formContainer: {
    width: windowWidth * 0.9,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  textinput: {
    backgroundColor: "white",
    color: "black",
    // height: windowHeight * 0.1,
    padding: 12,
    fontSize: 20,
    borderRadius: 5,
    // width: windowWidth,
  },
  btnInput: {
    backgroundColor: "white",
    fontSize: 18,
    textAlign: "center",
    padding: 12,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
    borderRadius: 5,
  },
  inputWarper: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#ff4a4a",
  },
  errorTextNumber: {
    color: "#ff9933",
  },
});
