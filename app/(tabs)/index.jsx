import {
  Button,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  TextInput
} from "react-native"

import EditScreenInfo from "../../components/EditScreenInfo"
import { Text } from "../../components/Themed"
import { useState, useEffect, useMemo, useCallback, useRef, useId } from "react"
import { BarCodeScanner } from "expo-barcode-scanner"
import { Dimensions, Alert, Vibration, View } from "react-native"
import * as SQLite from "expo-sqlite"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import { useRefresh, useProductStore } from "../store/mainstore"
import CurrencySignFormatter from "../components/CurrencySignFormatter"
import LottieView from "lottie-react-native"
import {
  BottomSheetModal,
  BottomSheetFlatList,
  useBottomSheetModal
} from "@gorhom/bottom-sheet"
import { useForm, Controller } from "react-hook-form"
import { AutoFocus WhiteBalance, FlashMode } from "expo-camera"
import { Link } from "expo-router"
import {useCameraDevices,Camera,useCodeScanner,CodeScanner} from "react-native-vision-camera"

const windowWidth = Dimensions.get("screen").width
const windowHeight = Dimensions.get("screen").height

const db = SQLite.openDatabase("products.db")

const buttonOperation = ({ operation, handleOperation }) => {
  return (
    <Pressable onPress={handleOperation} style={styles.btnOperation}>
      {/* {Vibration.vibrate([100, 50, 100])} */}
      <Text style={{ color: "white" }}>{operation}</Text>
    </Pressable>
  )
}

export default function TabOneScreen() {

  const device = useCameraDevice('back')
  const codeScanner = useCodeScanner({
  codeTypes: ['qr', 'ean-13','code-128','ean-8','code-39','code-93','data-matrix'],
  onCodeScanned: (codes) => {
    console.log(`Scanned ${codes} codes!`)
  }
})

  const [scanned, setScanned] = useState(false)
  const [scanBarcodeValue, setBarcodeValue] = useState([])
  const [camValue, setCamValue] = useState("")
  const currentTimestamp = Date.now() // Returns milliseconds since epoch
  const currentTimestampInSeconds = Math.floor(currentTimestamp / 1000)
  const setSalesRecordRefresh = useRefresh(
    (state) => state.setSalesRecordRefresh
  )
  const allProductsRefresh = useRefresh((state) => state.allProductsRefresh)
  const [products, setProducts] = useState([])
  const [flashCheck, useFlashCheck] = useState(false)

  const [isTrue, setIsTrue] = useState(false)
  const [sheetChange, setSheetChange] = useState("")
  const [sheetChangeAddProduct, setSheetChangeAddProduct] = useState("")

  const cameraRef = useRef()
  const bottomSheetModalRef = useRef()
  const bottomSheetModalRefAddProduct = useRef()
  const groupID = useId()
  const snapPoints = useMemo(() => ["25%", "90%"], [])

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present()
  }, [])
  const handlePresentModalPressClose = useCallback(() => {
    bottomSheetModalRef.current?.close()
  }, [])
  const handleSheetChanges = useCallback((index) => {
    setSheetChange(String(index).toString())
  }, [])
  const handlePresentModalPressAddProduct = useCallback(() => {
    bottomSheetModalRefAddProduct.current?.present()
  }, [])
  const handlePresentModalPressCloseAddProduct = useCallback(() => {
    bottomSheetModalRefAddProduct.current?.close()
  }, [])
  const handleSheetChangesAddProduct = useCallback((index) => {
    setSheetChangeAddProduct(String(index).toString())
  }, [])

  const setProductStore = useProductStore((state) => state.setProductStore)
  const setProductStoreEmpty = useProductStore(
    (state) => state.setProductStoreEmpty
  )
  const setUniqueDataEmpty = useProductStore(
    (state) => state.setUniqueDataEmpty
  )
  const uniqueData = useProductStore((state) => state.uniqueData)
  const setUniqueData = useProductStore((state) => state.setUniqueData)
  const increaseCartCount = useProductStore((state) => state.increaseCartCount)
  const decreaseCartCount = useProductStore((state) => state.decreaseCartCount)

  // console.log(uniqueData, "uniqueData");

  const totalPrice = useMemo(() => {
    const data = uniqueData?.reduce((total, item) => {
      return total + item.price * item.cart_count
    }, 0)
    return data
  }, [uniqueData])

  const totalCount = useMemo(() => {
    const data = uniqueData?.reduce((total, item) => {
      return total + item.cart_count
    }, 0)
    return data
  }, [uniqueData])

  const cartCountMap = useMemo(() => {
    const cartCountMap = {}
    uniqueData.forEach((item) => {
      cartCountMap[item.barcode] = item.cart_count
    })
    return cartCountMap
  }, [uniqueData])

  const filteredProducts = useMemo(() => {
    const data = products.filter((val) => val.branded === 0)
    return data
  }, [products])

  const updatedProducts = filteredProducts.map((product) => {
    const cartCount = cartCountMap[product.product_barcode] || 0
    return { ...product, cart_count: cartCount }
  })

  console.log(filteredProducts, "filteredProducts")
  console.log(updatedProducts, "updatedProducts")

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful }
  } = useForm()

  const onSubmit = async (inputData) => {
    const data = {
      ...inputData,
      product_barcode: scanBarcodeValue,
      branded: true
    }
    db.transaction(
      (tx) => {
        tx.executeSql(
          "INSERT INTO products (product_barcode, product_name, price, product_count, product_dataUrl,branded) VALUES (?, ?, ?, ?,?,?);",
          [
            data.product_barcode,
            data.productName,
            data.productPrice,
            data.productCount,
            data.productData,
            data.branded
          ],
          (_, results) => {
            console.log("Product inserted successfully")
            //  Refresh.setAllProductsRefresh();
            //  setRefresh((prev) => prev + 1);
            //  reset();
            // fetchProducts();
            Alert.alert("Success", "Product added successfully")
          },
          (error) => {
            console.error("Error inserting product: ", error)
            Alert.alert("Error", "Error inserting product")
          }
        )
      },
      null,
      null
    )
    handlePresentModalPressClose()
    console.log(data, "data")
  }

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_barcode STRING UNIQUE,
        product_name TEXT,
        price INTEGER,
        product_count INTEGER,
        product_dataUrl TEXT,
        branded BOOLEAN
      );
      `,
        [],
        () => console.log("Table created successfully"),
        (error) => console.error("Error creating table: ", error)
      )
    })
    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS sales
       (id INTEGER PRIMARY KEY,
       sales_data TEXT,
       timestamp INTEGER);`,
        [],
        () => console.log("Sales Record Table created successfully"),
        (error) => console.error("Error creating table: ", error)
      )
    })
  }, [])

  const generateUniqueId = () => {
    // Generate a unique ID using timestamp and a random number
    const timestamp = new Date().getTime()
    const randomNum = Math.floor(Math.random() * 1000)
    return `${timestamp}${randomNum}`
  }

  const saveSalesData = () => {
    const records = uniqueData.map((val) => {
      return {
        barcode: val.barcode,
        code: val.code,
        count: val.cart_count,
        key: 0,
        price: val.price,
        product_count: 0,
        salestimestamp: currentTimestampInSeconds,
        timestamp: currentTimestampInSeconds,
        totalprice: totalPrice,
        value: val.barcode
      }
    })
    console.log(records, "records")

    const salesDataJson = JSON.stringify(records)
    const salesID = generateUniqueId()

    if (salesDataJson) {
      db.transaction((tx) => {
        tx.executeSql(
          `INSERT INTO sales (id,sales_data,timestamp)
       VALUES (?, ?, ?);`,
          [salesID, salesDataJson, currentTimestampInSeconds],
          (_, results) => {
            console.log("Sales data saved successfully.")
          },
          (error) => {
            console.error("Error saving sales data:", error)
          }
        )
      })
    }

    setIsTrue(true)
    setUniqueDataEmpty()
    setProductStoreEmpty()
    setSalesRecordRefresh()
  }

  const Item = ({ item }) => {
    return (
      <Pressable
        style={({ pressed }) => [
          {
            backgroundColor: pressed ? "rgba(0, 0, 0, 0.1)" : "white"
          },
          styles.item
        ]}
        // onPress={() => console.log("pre")}
      >
        {item.cart_count === 0 ? (
          <TouchableOpacity
            disabled={item.cart_count === 0}
            style={styles.btnOperationX}
          >
            <Text style={{ color: "white" }}>-</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            disabled={item.cart_count === 0}
            onPress={() => decreaseCartCount(item.barcode)}
            style={styles.btnOperation}
          >
            <Text style={{ color: "white" }}>-</Text>
          </TouchableOpacity>
        )}

        <View
          style={{
            backgroundColor: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <Text style={styles.titlex}>{item.code}</Text>
          {item.cart_count > 1 ? (
            <View style={{ flexDirection: "row" }}>
              <CurrencySignFormatter price={item.price} />
              <Text style={{ color: "black" }}> X </Text>
              <Text style={{ color: "black" }}>{item.cart_count} </Text>
              <Text style={{ color: "black" }}>= </Text>
              <CurrencySignFormatter price={item.price * item.cart_count} />
            </View>
          ) : (
            <CurrencySignFormatter price={item.price} />
          )}
        </View>
        <TouchableOpacity
          disabled={item.cart_count === 0}
          onPress={() => increaseCartCount(item.barcode)}
          style={styles.btnOperation}
        >
          {/* {Vibration.vibrate([100, 50, 100])} */}
          <Text style={{ color: "white" }}>+</Text>
        </TouchableOpacity>
        <View style={styles.count}>
          <Text style={styles.countText}>{item.cart_count}</Text>
        </View>
        <Link href={`/(tabs)/productlogic/${item.barcode}`} asChild>
          <TouchableOpacity style={styles.remaining}>
            <Text style={{ paddingHorizontal: 10, fontSize: 10 }}>Edit</Text>
          </TouchableOpacity>
        </Link>
      </Pressable>
    )
  }

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true)
    setBarcodeValue(data)
    Vibration.vibrate([100, 50, 100])
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM products WHERE product_barcode = ?",
        [data],
        (_, { rows }) => {
          if (rows.length > 0) {
            const data = {
              barcode: rows.item(0).product_barcode,
              code: rows.item(0).product_name,
              price: rows.item(0).price,
              product_count: rows.item(0).product_count,
              timestamp: currentTimestampInSeconds,
              branded: rows.item(0).branded
            }
            setProductStore(data)
            setUniqueData()
            cameraRef.current && cameraRef.current.autoFocusAsync()
          } else {
            handlePresentModalPress()
            reset()
            // Alert.alert("Error", data);
          }
        }
      )
    })

    return () => {
      Vibration.cancel()
    }
  }

  const handleDataInput = (data) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM products WHERE product_barcode = ?",
        [data],
        (_, { rows }) => {
          if (rows.length > 0) {
            const data = {
              barcode: rows.item(0).product_barcode,
              code: rows.item(0).product_name,
              price: rows.item(0).price,
              product_count: rows.item(0).product_count,
              timestamp: currentTimestampInSeconds,
              branded: rows.item(0).branded
            }
            setProductStore(data)
            setUniqueData()
          }
        }
      )
    })
  }

  const handleCancel = () => {
    setUniqueDataEmpty()
    setProductStoreEmpty()
  }

  const renderListItem = ({ item }) => (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 4,
        marginBottom: 10,
        paddingHorizontal: 10,
        position: "relative"
      }}
    >
      <TouchableOpacity
        style={{
          backgroundColor: item.cart_count > 0 ? "#004e69" : "#9fa0a1",
          paddingHorizontal: 10,
          paddingVertical: 5,
          width: "auto",
          borderRadius: 8,
          flex: 1
        }}
        onPress={() => handleDataInput(item.product_barcode)}
      >
        <Text style={{ color: "white", fontSize: 20, marginBottom: 2 }}>
          {item.product_name}
        </Text>
        {item.cart_count > 0 ? (
          <View style={{ flexDirection: "row" }}>
            <CurrencySignFormatter
              price={item.price}
              textstyle={{ color: "white" }}
              white={true}
            />
            <Text style={{ color: "white" }}> X </Text>
            <Text style={{ color: "white" }}>{item.cart_count} </Text>
            <Text style={{ color: "white" }}>= </Text>
            <CurrencySignFormatter
              price={item.price * item.cart_count}
              textstyle={{ color: "white" }}
              white={true}
            />
          </View>
        ) : (
          <View
            style={{
              width: "100%",
              justifyContent: "flex-start",
              flexDirection: "row"
            }}
          >
            <CurrencySignFormatter
              price={item.price}
              textstyle={{ color: "white" }}
              white={true}
            />
          </View>
        )}
      </TouchableOpacity>
      {item.cart_count === 0 ? (
        <TouchableOpacity
          disabled={item.cart_count === 0}
          style={styles.btnOperationX}
        >
          {/* <Text style={{ color: "white" }}>-</Text> */}
          <FontAwesome name="minus" color="#9fa0a1" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          disabled={item.cart_count === 0}
          onPress={() => decreaseCartCount(item.product_barcode)}
          style={styles.btnOperationXX}
        >
          <FontAwesome name="minus" color="white" />
        </TouchableOpacity>
      )}
      {item.cart_count === 0 && (
        <View
          style={{
            position: "absolute",
            top: 0,
            backgroundColor: "#c7c7c7",
            borderBottomLeftRadius: 6,
            borderBottomRightRadius: 6
          }}
        >
          <Text
            style={{
              color: "#2b2b2b",
              fontSize: 10,
              paddingHorizontal: 5,
              paddingVertical: 2
            }}
          >
            Click to add
          </Text>
        </View>
      )}
    </View>
  )

  const renderFooter = () => (
    <View style={{ height: windowHeight * 0.1 }}></View>
  )
  const renderHeader = () => (
    <View
      style={{
        // height: windowHeight * 0.1,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 20,
        paddingTop: 10
      }}
    >
      <Link
        href={"/(tabs)/productlogic/addproduct"}
        asChild
        style={{ justifyContent: "center", alignItems: "center", width: "50%" }}
      >
        <TouchableOpacity
          style={{
            paddingHorizontal: 10,
            paddingVertical: 10,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#004e69",
            justifyContent: "center",
            borderRadius: 6
          }}
        >
          <Text style={{ color: "white" }}>ADD PRODUCT</Text>
        </TouchableOpacity>
      </Link>
      <Text
        style={{
          color: "#004e69",
          width: "80%",
          textAlign: "center",
          opacity: 0.8,
          fontSize: 12,
          fontStyle: "italic"
        }}
      >
        Click this button to add product that do not have barcode
      </Text>
    </View>
  )

  const fetchProducts = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM products",
        [],
        (_, { rows }) => {
          setProducts(rows["_array"])
        },
        (_, error) => console.error("Error fetching products: ", error)
      )
    })
  }

  useEffect(() => {
    fetchProducts()
  }, [allProductsRefresh])

  return (
    <>
      {/* <OnBoardingScreen /> */}
      <SafeAreaView style={styles.container}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            width: windowWidth,
            zIndex: 10,
            position: "relative"
          }}
        >
          <LottieView
            autoPlay
            style={{
              width: windowWidth * 0.7,
              height: windowHeight * 0.2,
              // marginTop: windowHeight * 0.02,
              opacity: 0.7
            }}
            loop
            source={require("../../assets/QrcodeScan.json")}
          />

          <View
            style={{
              position: "absolute",
              width: "100%",
              bottom: 0,
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 10,
              paddingBottom: 10
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: "white",
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 5
              }}
              onPress={() => useFlashCheck(!flashCheck)}
            >
              <FontAwesome name="flash" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: "white",
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 5
              }}
              onPress={handlePresentModalPressAddProduct}
            >
              <FontAwesome name="plus" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.details}>
          <View style={styles.cost}>
            <Text style={{ fontSize: 10, color: "white" }}>Total Cost:</Text>
            <CurrencySignFormatter
              textstyle={{ fontSize: 20, fontWeight: "bold", color: "white" }}
              size={20}
              white={true}
              price={totalPrice}
            />
          </View>
          <View style={styles.cost}>
            <Text style={{ fontSize: 10, color: "white" }}>Total Count:</Text>
            <Text style={{ color: "white" }}>{totalCount}</Text>
          </View>
        </View>
        <View style={styles.overlay}>
          {isTrue && (
            <LottieView
              autoPlay
              onAnimationFinish={() => {
                setIsTrue(false)
              }}
              loop={false}
              style={{
                height: "auto",
                width: windowWidth * 0.9,
                // marginTop: windowHeight * 0.06,
                zIndex: 55
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
              paddingBottom: windowHeight * 0.1
              // backgroundColor: "#004e69",
            }}
          >
            <FlatList
              data={uniqueData}
              renderItem={({ item }) => <Item item={item} />}
              keyExtractor={(item) => item.barcode?.toString()}
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
                  marginBottom: 12
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
                      marginBottom: 12
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
                  marginBottom: 12
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
                  marginBottom: 12
                }}
              >
                <FontAwesome name="save" size={30} color={"white"} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        {/* <BarCodeScanner
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
          ref={refCamera}
          type={"back"}

          // barCodeTypes={[BarCodeScanner.Constants.BarCodeType.code128]}
        /> */}
        {/* <Camera
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          autoFocus={AutoFocus.on}
          style={{
            flex: 1,
            height: "100%",
            width: "100%",
            position: "absolute"
            // bottom: windowHeight * 0.1,
            // display: "flex",
            // justifyContent: "flex-start",
            // alignItems: "flex-start",
            // zIndex: 1,
          }}
          ratio="16:9"
          ref={cameraRef}
          flashMode={flashCheck ? FlashMode.torch : FlashMode.off}
        /> */}
        {device === null ? "No Camera":<Camera device={useCameraDevices('back')} style={StyleSheet.absoluteFill} isActive={true} codeScanner={codeScanner} />
}
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={1}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
        >
          <View style={styles.containerXX}>
            <View style={{ width: "80%", marginBottom: 10 }}>
              <Text
                style={{ color: "#004e69", fontSize: 12, fontWeight: "bold" }}
              >
                Product Barcode - {scanBarcodeValue}
              </Text>
            </View>
            <View style={styles.formContainer}>
              <Text style={{ color: "#004e69", fontSize: 10 }}>
                PRODUCT NAME
              </Text>
              <Controller
                name="productName"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <View>
                    <TextInput
                      placeholder="Product Name"
                      onChangeText={(text) => {
                        field.onChange(text)
                      }}
                      value={field.value}
                      style={styles.textinput}
                    />
                  </View>
                )}
              />
              <Text style={{ color: "#004e69", fontSize: 10 }}>
                PRODUCT PRICE(NGN)
              </Text>

              <Controller
                name="productPrice"
                control={control}
                rules={{
                  required: true,
                  pattern: {
                    value: /^\d+(\.\d{1,2})?$/,
                    message: "Product Price must be a number"
                  }
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
              {/* <Text style={{ color: "#004e69", fontSize: 10 }}>
                PRODUCT COUNT(optional)
              </Text>

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
              /> */}
              <TouchableOpacity onPress={handleSubmit(onSubmit)}>
                <Text style={styles.btnInput}>Add New Product</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BottomSheetModal>
        <BottomSheetModal
          ref={bottomSheetModalRefAddProduct}
          index={1}
          snapPoints={snapPoints}
          onChange={handleSheetChangesAddProduct}
        >
          {/* <TouchableOpacity onPress={handlePresentModalPressCloseAddProduct}>
            <FontAwesome name="close" size={24} />
          </TouchableOpacity> */}

          <BottomSheetFlatList
            data={updatedProducts}
            keyExtractor={(item, index) => groupID + index}
            renderItem={renderListItem}
            numColumns={1}
            // columnWrapperStyle={{
            //   flexDirection: "row",
            //   justifyContent: "center",
            //   marginBottom: 10,
            //   gap: 10,
            // }}
            ListFooterComponent={renderFooter}
            ListHeaderComponent={renderHeader}
          />
        </BottomSheetModal>
      </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "flex-end",
    position: "relative"
    // backgroundColor: "#015c7a",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold"
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%"
  },
  overlay: {
    backgroundColor: "#004e69",
    position: "relative",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    zIndex: 50,
    width: windowWidth,
    height: windowHeight * 0.5
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
    height: windowHeight * 0.08
    // backgroundColor: "#57ff84",
  },
  titlex: {
    fontSize: 18,
    color: "black"
  },
  price: {
    fontSize: 12,
    color: "black"
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
    padding: 10
  },
  cost: {
    backgroundColor: "#015c7a",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 2
  },
  btnOperation: {
    backgroundColor: "#2b2b2b",
    width: 30,
    height: 30,
    borderRadius: 60,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  btnOperationXX: {
    backgroundColor: "#ff404c",
    width: 30,
    height: 30,
    borderRadius: 60,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  btnOperationX: {
    backgroundColor: "#c7c7c7",
    width: 30,
    height: 30,
    borderRadius: 60,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
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
    backgroundColor: "black"
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
    backgroundColor: "black"
  },
  countText: {
    color: "white"

    // fontSize: 18,
    // padding: 6,
  },
  remainingText: {
    color: "white",
    fontSize: 9
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
    flexDirection: "row"
  },
  containerXX: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
    // backgroundColor: "#004e69",
    // paddingBottom: windowHeight * 0.1,
  },
  formContainer: {
    width: windowWidth * 0.8,
    display: "flex",
    flexDirection: "column",
    // justifyContent: "center",
    // alignItems: "center",
    gap: 10
  },
  textinput: {
    backgroundColor: "white",
    color: "black",
    // height: windowHeight * 0.1,
    padding: 12,
    fontSize: 20,
    borderRadius: 5,
    borderColor: "#004e69",
    borderWidth: 1
    // width: windowWidth,
  },
  btnInput: {
    backgroundColor: "#004e69",
    fontSize: 18,
    textAlign: "center",
    padding: 12,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
    borderRadius: 5,
    borderColor: "#004e69"
  },
  inputWarper: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  errorText: {
    color: "#ff4a4a"
  },
  errorTextNumber: {
    color: "#ff9933"
  }
})
