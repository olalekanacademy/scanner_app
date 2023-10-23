import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Button,
  StyleSheet,
  Dimensions,
  ScrollView,
  FlatList,
} from "react-native";
import React, { useMemo, useCallback } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useVoiceRecognition } from "../../hooks/useVoiceRecognition";
import { useEffect, useState, useRef } from "react";
import { useVoiceProductStore, useRefresh } from "../store/mainstore";
import * as SQLite from "expo-sqlite";
import CurrencySignFormatter from "../components/CurrencySignFormatter";
import ConvertWordToNumber from "../components/ConvertWordToNumber";
import CalculateLevenshteinDistance from "../components/CalculateLevenshte";
import LottieView from "lottie-react-native";

const db = SQLite.openDatabase("products.db");
const windowWidth = Dimensions.get("screen").width;
const windowHeight = Dimensions.get("screen").height;
const generateUniqueId = () => {
  // Generate a unique ID using timestamp and a random number
  const timestamp = new Date().getTime();
  const randomNum = Math.floor(Math.random() * 1000);
  return `${timestamp}${randomNum}`;
};
const Speech = () => {
  const { state, startRecognizing, cancelRecognizing, stopRecognizing } =
    useVoiceRecognition();
  const [voiceStartState, setVoiceStartState] = useState(1);

  const [productValue, setProductValue] = useState([]);
  const [inputValues, setInputValues] = useState([]);
  const [dbRecords, setDbRecords] = useState([]);
  const [dbRecordsValue, setDbRecordsValue] = useState([]);
  const [parsedValuesVersion, setParsedValuesVersion] = useState(0);
  const [productFIlterRefresh, setProductFIlterRefresh] = useState(0);
  const currentTimestamp = Date.now();
  const currentTimestampInSeconds = Math.floor(currentTimestamp / 1000);
  const [isTrue, setIsTrue] = useState(false);

  const setSalesRecordRefresh = useRefresh(
    (state) => state.setSalesRecordRefresh
  );

  const [speechValue, setSpeechValue] = useState([]);

  const [speechLength, setSpeechLength] = useState(null);
  const [speechtrimValue, setSpeechtrimValue] = useState([]);
  console.log(isTrue, "istrue");
  const speechValueClean = useMemo(() => {
    return speechValue.filter((item) => item !== undefined);
  }, [speechValue]);

  useEffect(() => {
    const trimSpeechValue = speechValue.slice(speechLength);
    setSpeechtrimValue(trimSpeechValue);
    setSpeechLength(speechValue.length);
  }, [speechValue]);

  // console.log(speechValue, "speechValue");
  // console.log(speechtrimValue, "errorMassageCheck");

  const speechValueConvert = useMemo(() => {
    const parsedValues = speechValueClean.map((item) => {
      const parts = item.split(" ");

      const numberPart =
        parseInt(parts[0], 10) || ConvertWordToNumber({ word: parts[0] });
      const comparePart = parts.slice(1).join(" ").toLowerCase().trim();

      return { numberPart, comparePart };
    });

    return parsedValues;
  }, [speechValueClean]);

  // console.log(speechValueConvert, "speechValueConvert");

  useEffect(() => {
    const newParsedValues = speechValueConvert.slice(parsedValuesVersion);
    newParsedValues.map(({ comparePart, numberPart }) => {
      db.transaction((tx) => {
        tx.executeSql(
          "SELECT product_name, price, product_count, product_barcode FROM products",
          [],
          (_, { rows }) => {
            const items = rows._array;
            let bestMatch = null;
            let minDistance = 3;

            items.forEach((item) => {
              const similarity = CalculateLevenshteinDistance(
                comparePart.toLowerCase(),
                item.product_name.toLowerCase()
              );

              if (similarity < minDistance) {
                minDistance = similarity;
                bestMatch = item;
              }
            });

            if (bestMatch && !isNaN(Number(numberPart))) {
              console.log(`Best mat for ${comparePart}:`, bestMatch);
              setDbRecordsValue((prev) => [
                ...prev,
                {
                  comparePart: bestMatch.product_name,
                  numberPart,
                  ...bestMatch,
                  show: false,
                },
              ]);
            } else {
              console.log(`No match found for ${comparePart}`);
              setDbRecordsValue((prev) => [
                ...prev,
                {
                  comparePart: `No Match`,
                  numberPart,
                  speechValue: comparePart,
                  show: true,
                },
              ]);
            }
          }
        );
      });
    });
    setParsedValuesVersion(speechValueConvert.length);
  }, [speechValueConvert]);

  // console.log(dbRecordsValue, "dbRecordsValue");

  const sumTotal = useMemo(() => {
    const validObjects = dbRecordsValue.filter(
      (obj) => obj.numberPart !== undefined && obj.price !== undefined
    );

    const totalSum = validObjects.reduce((acc, obj) => {
      const total = obj.numberPart * obj.price;
      return acc + total;
    }, 0);
    return totalSum;
  }, [dbRecordsValue]);

  const handleFilter = (index) => {
    const filter = speechValueClean.filter((_, i) => i !== index);
    const dbFilter = dbRecordsValue.filter((_, i) => i !== index);
    setDbRecordsValue(dbFilter);
    setSpeechValue(filter);
  };

  const handleQuantityAdditionValue = (index) => {
    const filteredArray = speechValueClean;
    if (index >= 0 && index < filteredArray.length) {
      const item = filteredArray[index];
      const [number, itemName] = item.split(" ");
      const newNumber = parseInt(number) + 1;

      filteredArray[index] = `${newNumber} ${itemName}`;
    }
    console.log(filteredArray, "add");

    setSpeechValue(filteredArray);
  };

  const handleQuantitySubtractValue = (index) => {
    const filteredArray = speechValueClean;
    if (index >= 0 && index < filteredArray.length) {
      const item = filteredArray[index];
      const [number, itemName] = item.split(" ");
      const newNumber = parseInt(number) - 1;

      if (newNumber >= 0) {
        filteredArray[index] = `${newNumber} ${itemName}`;
      } else {
        filteredArray.splice(index, 1);
        const filterRemove = dbRecordsValue.filter((_, i) => i !== index);
        setDbRecordsValue(filterRemove);
      }
    }
    setSpeechValue(filteredArray);
  };

  const handleDeleteAll = () => {
    return setSpeechValue([]), setDbRecordsValue([]);
  };

  const generateUniqueId = () => {
    // Generate a unique ID using timestamp and a random number
    const timestamp = new Date().getTime();
    const randomNum = Math.floor(Math.random() * 1000);
    return `${timestamp}${randomNum}`;
  };
  const handleSubmit = () => {
    const salesID = generateUniqueId();
    const records = dbRecordsValue.map((val, index) => {
      return [
        {
          barcode: val.product_barcode,
          code: val.product_name,
          count: Number(speechValueConvert[index].numberPart),
          key: 0,
          price: val.price,
          product_count: val.product_count,
          salestimestamp: currentTimestampInSeconds,
          timestamp: currentTimestampInSeconds,
          totalprice: sumTotal,
          value: val.product_barcode,
        },
      ];
    });
    const flattenedRecords = records.reduce((acc, val) => acc.concat(val), []);

    const filteredRecords = flattenedRecords.filter(
      (record) => record.barcode !== undefined
    );
    const salesDataJson = JSON.stringify(filteredRecords);
    // console.log(salesDataJson, "salesDataJson");
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
    setSpeechValue([]),
      setDbRecordsValue([]),
      setIsTrue(true),
      console.log("Submitted value:", filteredRecords);
  };

  const RenderInputs = () => {
    return dbRecordsValue?.map((item, index) => (
      <View
        key={index}
        style={{
          marginBottom: 10,
          flexDirection: "row",
          gap: 4,
          width: "90%",
        }}
      >
        {item.show ? (
          <View
            style={{
              backgroundColor: "rgba(184, 184, 184, 0.5)",
              width: "90%",
              borderRadius: 5,
              paddingVertical: 5,
              paddingHorizontal: 10,
              justifyContent: "flex-start",
              alignItems: "flex-start",
              flexDirection: "row",
              gap: 2,
            }}
          >
            <Text
              style={{
                color: "white",
                textAlign: "center",
                fontStyle: "italic",
              }}
            >{`No Match For`}</Text>
            <Text
              style={{
                color: "white",
                textAlign: "center",
                fontStyle: "italic",
                fontWeight: "bold",
              }}
            >
              {item.speechValue}
            </Text>
          </View>
        ) : (
          <>
            <View
              style={{
                flexDirection: "row",
                backgroundColor: "white",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 8,
                paddingHorizontal: 6,
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: "#ff794d",
                  // padding: 20,
                  height: 30,
                  width: 30,
                  borderRadius: 999,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => handleQuantitySubtractValue(index)}
              >
                <FontAwesome name="minus" color="white" size={10} />
              </TouchableOpacity>
              <View
                style={{
                  flexDirection: "column",
                  gap: 2,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {/* <Text>No of Items</Text> */}
                <Text style={{ fontWeight: "bold", paddingHorizontal: 10 }}>
                  {speechValueConvert[index].numberPart}
                </Text>
              </View>

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
                onPress={() => handleQuantityAdditionValue(index)}
              >
                <FontAwesome name="plus" color="white" size={10} />
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: "column",
                alignItems: "flex-start",
                marginLeft: 4,
                gap: 2,
                flex: 1,
              }}
            >
              <View
                style={{
                  flexDirection: "column",
                  gap: 1,
                  alignContent: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{ color: "white", fontWeight: "bold", fontSize: 18 }}
                >
                  {String(item.comparePart).toUpperCase()}
                </Text>
                <Text style={{ color: "white" }}>
                  {item.price
                    ? CurrencySignFormatter({
                        price: item.price,
                        title: "price:",
                        white: true,
                        textstyle: { color: "white" },
                      })
                    : "#"}
                </Text>
              </View>
              <Text style={{ color: "white" }}>
                {Number(speechValueConvert[index].numberPart) &&
                  CurrencySignFormatter({
                    price:
                      item.price * Number(speechValueConvert[index].numberPart),
                    title: "Total:",
                    white: true,
                    textstyle: { color: "white" },
                  })}
              </Text>
            </View>
          </>
        )}
        <TouchableOpacity onPress={() => handleFilter(index)}>
          <FontAwesome name="close" color="red" size={30} />
        </TouchableOpacity>
      </View>
    ));
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        backgroundColor: "#004e69",
      }}
    >
      {/* <FlatList
        data={dbRecords}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderInputs}
      /> */}
      <View style={{ marginTop: windowHeight * 0.08 }}>{<RenderInputs />}</View>
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
            marginTop: windowHeight * 0.05,
          }}
          source={require("../../assets/salesConfirm.json")}
        />
      )}
      <View style={styles.sumTotalStyle}>
        {CurrencySignFormatter({
          price: sumTotal,
          title: "Total Cost:",
          textstyle: {
            fontWeight: "bold",
            fontSize: 18,
            color: "#004e69",
          },
        })}
      </View>

      <View style={styles.scannerstyle}>
        <TouchableOpacity onPress={handleDeleteAll}>
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
            }}
          >
            <FontAwesome name="close" size={30} color={"white"} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPressIn={() => {
            startRecognizing();
          }}
          onPressOut={() => {
            stopRecognizing();
            setSpeechValue((prev) => [...prev, state.results[0]]);
            // setVoiceStartState((prev) => prev + 1);
            // cancelRecognizing();
          }}
        >
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
            }}
          >
            <FontAwesome name="microphone" size={50} color={"white"} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            handleSubmit();
          }}
        >
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
            }}
          >
            <FontAwesome name="save" size={30} color={"white"} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Speech;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    // backgroundColor: "#015c7a",
  },
  textinput: {
    backgroundColor: "white",
    color: "black",
    // height: windowHeight * 0.1,
    paddingHorizontal: 10,
    fontSize: 16,
    borderRadius: 10,
    // width: "30%",
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
    paddingVertical: 10,
  },
  sumTotalStyle: {
    backgroundColor: "white",
    position: "absolute",
    top: 0,
    width: "auto",
    // height: windowHeight * 0.06,
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "row",
    paddingVertical: 10,
    marginTop: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
});
