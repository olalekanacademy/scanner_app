import {
  View,
  StyleSheet,
  Dimensions,
  Button,
  TextInput,
  Alert,
  Text,
} from "react-native";
import { Link, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SQLite from "expo-sqlite";
import { useForm, Controller } from "react-hook-form";
import { useVoiceRecognition } from "../hooks/useVoiceRecognition";

const windowWidth = Dimensions.get("screen").width;
const windowHeight = Dimensions.get("screen").height;

const db = SQLite.openDatabase("products.db");
export default function CreateProductForm() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm();

  const isPresented = router.canGoBack();

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
  const onSubmit = async (data) => {
    try {
      const nextProductBarcode = await getNextProductBarcode();

      if (nextProductBarcode) {
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
              "INSERT INTO products (product_barcode, product_name, price, product_count) VALUES (?, ?, ?, ?);",
              [
                nextProductBarcode,
                data.productName,
                data.productPrice,
                data.productCount,
              ],
              (_, results) => {
                console.log("Product inserted successfully");
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
      }
    } catch (error) {
      console.error("Error getting next product barcode: ", error);
      Alert.alert("Error", "Error getting next product barcode");
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

      <View>
        <Controller
          name="productName"
          control={control}
          rules={{ required: true, minLength: 2 }}
          render={({ field }) => (
            <View>
              <TextInput
                placeholder="Product Name"
                onChangeText={field.onChange}
                value={field.value}
                style={{ backgroundColor: "white", color: "black" }}
              />
              {errors.productName && (
                <Text style={styles.errorText}>Product Name is required</Text>
              )}
            </View>
          )}
        />
        <Controller
          name="productPrice"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <View>
              <TextInput
                placeholder="Product Price"
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
                style={{ backgroundColor: "white", color: "black" }}
                keyboardType="numeric"
              />
              {errors.productPrice && (
                <Text style={styles.errorText}>Product Price is required</Text>
              )}
            </View>
          )}
        />
        <Controller
          name="productCount"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <View>
              <TextInput
                placeholder="Product Count"
                onChangeText={(value) => {
                  if (isNumeric(value) || value === "") {
                    field.onChange(value);
                  }
                }}
                value={field.value}
                style={{ backgroundColor: "white", color: "black" }}
                keyboardType="numeric"
              />
              {errors.productCount && (
                <Text style={styles.errorText}>Product Count is required</Text>
              )}
            </View>
          )}
        />
        <Button title={"Insert Product"} onPress={handleSubmit(onSubmit)} />
      </View>
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
});
