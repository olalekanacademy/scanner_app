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
import {
  Link,
  router,
  useGlobalSearchParams,
  useLocalSearchParams,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SQLite from "expo-sqlite";
import { useForm, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import Stack from "expo-router";
import { useRefresh } from "../../store/mainstore";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";

const windowWidth = Dimensions.get("screen").width;
const windowHeight = Dimensions.get("screen").height;

const db = SQLite.openDatabase("products.db");

export default function EditProduct() {
  const [singleproducts, setSingleProducts] = useState([]);
  const [updatemsg, setUpdateMsg] = useState(false);
  const Refresh = useRefresh();
  const router = useRouter();
  const [addLoading, setAddLoading] = useState(false);
  // console.log(singleproducts, "lll");
  const fetchProduct = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM products WHERE id = ${id}`,
        [],
        (_, { rows }) => {
          setSingleProducts(rows["_array"]);
        },
        (_, error) => console.error("Error fetching products: ", error)
      );
    });
  };
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
  // console.log(Refresh.allProductsRefresh);
  useEffect(() => {
    fetchProduct();
  }, []);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm();

  const { id } = useLocalSearchParams();

  const isPresented = router.canGoBack();
  const productname = singleproducts?.map((x) => {
    return x.product_name;
  });
  const onSubmit = async (data) => {
    setAddLoading(true);
    try {
      const productAlreadyExists = await isProductAlreadyExist(
        data.productName
      );
      if (
        !productAlreadyExists ||
        data.productName === productname?.toString()
      ) {
        db.transaction(
          (tx) => {
            tx.executeSql(
              "UPDATE products SET product_name = ?, price = ?, product_count = ? WHERE id = ?;",
              [data.productName, data.productPrice, data.productCount, id],
              (_, results) => {
                console.log("Product updated successfully");
                // reset();
                Refresh.setAllProductsRefresh();

                Alert.alert("Success", "Product updated successfully", [
                  {
                    text: "Go Back",
                    onPress: () => router.back(),
                  },
                  {
                    text: "Ok",
                  },
                ]);
              },
              (error) => {
                console.error("Error updating product: ", error);
                Alert.alert("Error", "Error updating product");
              }
            );
          },
          null,
          null
        );
      } else {
        Alert.alert("Error", "Product Name Match Another Product");
      }
    } catch (error) {
      console.error("Error getting next product barcode: ", error);
      Alert.alert("Error", "Error updating product");
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
      {/* <View>{updatemsg ? <Text>Updated</Text> : null}</View> */}
      {singleproducts?.map((product, index) => (
        <View style={styles.formContainer} key={index}>
          <Text style={{ color: "white", fontSize: 10 }}>PRODUCT NAME</Text>

          <Controller
            name="productName"
            control={control}
            rules={{ required: true, minLength: 2 }}
            defaultValue={product.product_name.toString()}
            key={"productName"}
            render={({ field }) => (
              <View>
                <TextInput
                  placeholder="Product Name"
                  onChangeText={field.onChange}
                  value={field.value}
                  style={styles.textinput}
                  // defaultValue={product.product_name}
                />
                {errors.productName && (
                  <Text style={styles.errorText}>Product Name is required</Text>
                )}
              </View>
            )}
          />
          <Text style={{ color: "white", fontSize: 10 }}>
            PRODUCT PRICE(NGN)
          </Text>
          <Controller
            name="productPrice"
            control={control}
            rules={{ required: true }}
            key={"productPrice"}
            defaultValue={product.price.toString()}
            render={({ field }) => (
              <View>
                <TextInput
                  placeholder="Product Price"
                  // defaultValue={parseInt(product.price)}
                  onChangeText={(value) => {
                    if (
                      isNumericDecimal(value) ||
                      value === "" ||
                      value === "."
                    ) {
                      // Allow empty string for backspace
                      field.onChange(value);
                    }
                  }}
                  value={field.value}
                  style={styles.textinput}
                  keyboardType="numeric"
                />
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
            key={"productCount"}
            rules={{ required: true }}
            defaultValue={product.product_count.toString()}
            render={({ field }) => (
              <View>
                <TextInput
                  // defaultValue={parseInt(product.product_count)}
                  placeholder="Product Count"
                  onChangeText={(value) => {
                    if (isNumeric(value) || value === "") {
                      field.onChange(value);
                    }
                  }}
                  value={field.value}
                  style={styles.textinput}
                  keyboardType="numeric"
                />
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
            <Text style={styles.btnInput}>Update Product</Text>
          </TouchableOpacity>
        </View>
      ))}
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
});
