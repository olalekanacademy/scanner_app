import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  FlatList,
} from "react-native";
import React from "react";
import AlphabetList from "../AlphabetList";
import * as SQLite from "expo-sqlite";
import {
  useEffect,
  useState,
  useRef,
  useId,
  useCallback,
  useMemo,
} from "react";
import {
  BottomSheetModal,
  BottomSheetFlatList,
  useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import { FontAwesome } from "@expo/vector-icons";
import CurrencySignFormatter from "../CurrencySignFormatter";

const db = SQLite.openDatabase("products.db");
const windowWidth = Dimensions.get("screen").width;
const windowHeight = Dimensions.get("screen").height;

const Productcal = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [valueClicked, setValueClicked] = useState("");
  const [sheetChange, setSheetChange] = useState("");
  const { dismiss, dismissAll } = useBottomSheetModal();
  const [cart, setCart] = useState([]);

  const bottomSheetModalRef = useRef();
  const bottomSheetModalRefSingle = useRef();
  const groupID = useId();
  const snapPoints = useMemo(() => ["25%", "50%"], []);

  const handlePresentModalPressSingle = useCallback(() => {
    bottomSheetModalRefSingle.current?.present();
  }, []);
  const handlePresentModalPressCloseSingle = useCallback(() => {
    bottomSheetModalRefSingle.current?.close();
  }, []);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);
  const handlePresentModalPressClose = useCallback(() => {
    bottomSheetModalRef.current?.close();
  }, []);
  const handleSheetChanges = useCallback((index) => {
    setSheetChange(String(index).toString());
  }, []);

  const cartCheck = (name) => {
    const names = cart.map((x) => x.name);
    const nameCondition = names.includes(name);
    return nameCondition;
  };
  console.log(cartCheck("Apple"), "boolean");
  const handleAddtionClick = ({ name, price }) => {
    const names = cart.map((x) => x.name);
    const nameCondition = names.includes(name);
    if (!nameCondition) {
      return setCart([...cart, { name, price, count: 1 }]);
    }
    const filter = cart.filter((val) => val.name !== name);
    const find = cart.find((val) => val.name === name);
    setCart([...filter, { name, price, count: find.count + 1 }]);
  };
  const handleSubtractClick = ({ name, price }) => {
    const filter = cart.filter((val) => val.name !== name);
    const find = cart.find((val) => val.name === name);
    setCart([...filter, { name, price, count: find.count - 1 }]);
  };
  console.log(cart, "cart");
  const handlePress = (data) => {
    setValueClicked(data);
    handlePresentModalPress();
  };

  const renderFooter = () => (
    <View style={{ height: windowHeight * 0.1 }}></View>
  );

  const renderListItemMain = ({ item }) => (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 4,
        marginBottom: 10,
      }}
    >
      <TouchableOpacity
        style={{
          backgroundColor: `${
            cartCheck(item.product_name) ? "#ff794d" : "#c7c7c7"
          }`,
          // padding: 20,
          height: 30,
          width: 30,
          borderRadius: 999,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <FontAwesome name="minus" color="white" size={10} />
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          backgroundColor: "#004e69",
          paddingHorizontal: 10,
          paddingVertical: 5,
          width: "auto",
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "white", fontSize: 20 }}>{item.name}</Text>
        <View style={{ flexDirection: "row" }}>
          <Text style={{ color: "white", fontSize: 20 }}>
            <CurrencySignFormatter
              price={item.price}
              white={true}
              textstyle={{ color: "white" }}
            />
          </Text>
          <Text style={{ color: "white", fontSize: 20 }}>
            <CurrencySignFormatter
              title={"subtotal"}
              price={item.price * item.count}
              white={true}
              textstyle={{ color: "white" }}
            />
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          backgroundColor: "#05fa53",
          // padding: 20,
          height: 30,
          width: 30,
          borderRadius: 999,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <FontAwesome name="plus" color="white" size={10} />
      </TouchableOpacity>
    </View>
  );
  const renderListItem = ({ item }) => (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 4,
        marginBottom: 10,
      }}
    >
      <TouchableOpacity
        style={{
          backgroundColor: `${
            cartCheck(item.product_name) ? "#ff794d" : "#c7c7c7"
          }`,
          // padding: 20,
          height: 30,
          width: 30,
          borderRadius: 999,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={() =>
          handleSubtractClick({ name: item.product_name, price: item.price })
        }
        disabled={!cartCheck(item.product_name)}
      >
        <FontAwesome name="minus" color="white" size={10} />
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          backgroundColor: "#004e69",
          paddingHorizontal: 10,
          paddingVertical: 5,
          width: "auto",
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "white", fontSize: 20 }}>
          {item.product_name}
        </Text>
        <Text style={{ color: "white", fontSize: 20 }}>
          <CurrencySignFormatter
            price={item.price}
            white={true}
            textstyle={{ color: "white" }}
          />
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          backgroundColor: "#05fa53",
          // padding: 20,
          height: 30,
          width: 30,
          borderRadius: 999,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={() =>
          handleAddtionClick({ name: item.product_name, price: item.price })
        }
      >
        <FontAwesome name="plus" color="white" size={10} />
      </TouchableOpacity>
    </View>
  );
  //   console.log(valueClicked, "value");
  //   console.log(filteredData, "filteredData");

  useEffect(() => {
    const filterData = () => {
      db.transaction((tx) => {
        tx.executeSql(
          "SELECT  product_name, price, product_count FROM products WHERE SUBSTR(product_name, 1, 1) = ?",
          [valueClicked],
          (tx, results) => {
            const len = results.rows.length;
            const data = [];
            for (let i = 0; i < len; i++) {
              data.push(results.rows.item(i));
            }
            setFilteredData(data);
          }
        );
      });
    };
    filterData();
  }, [valueClicked]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        backgroundColor: "#004e69",
      }}
    >
      <View style={{ flex: 1, minHeight: windowHeight * 0.3 }}>
        <FlatList
          data={cart}
          keyExtractor={(item, index) => groupID + index}
          renderItem={renderListItemMain}
          numColumns={1}
          // columnWrapperStyle={{
          //   flexDirection: "row",
          //   justifyContent: "center",
          //   marginBottom: 10,
          //   gap: 10,
          // }}
          ListFooterComponent={renderFooter}
        />
      </View>
      <View style={{}}>
        <AlphabetList onAlphabetPress={handlePress} />
      </View>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose={true}
      >
        {filteredData?.length > 0 ? (
          <BottomSheetFlatList
            data={filteredData}
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
          />
        ) : (
          <Text style={styles.noSalesText}>No Sales</Text>
        )}
        <View style={{ position: "absolute", right: 0, top: "50%" }}>
          <TouchableOpacity
            style={{
              backgroundColor: "black",
              padding: 10,
              borderTopLeftRadius: 30,
              borderBottomLeftRadius: 30,
              paddingRight: 20,
            }}
            onPress={handlePresentModalPressClose}
          >
            <FontAwesome name="close" size={20} color={"white"} />
          </TouchableOpacity>
        </View>
      </BottomSheetModal>
      <BottomSheetModal
        ref={bottomSheetModalRefSingle}
        index={1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
      >
        <TouchableOpacity onPress={handlePresentModalPressCloseSingle}>
          {/* <FontAwesome name="close" /> */}
          <Text>Close</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => dismissAll()}>
          {/* <FontAwesome name="close" /> */}
          <Text>Close All</Text>
        </TouchableOpacity>
        <Text>Check</Text>
      </BottomSheetModal>
    </View>
  );
};

export default Productcal;

const styles = StyleSheet.create({});
