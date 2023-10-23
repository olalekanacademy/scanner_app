import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Dimensions,
  FlatList,
  Pressable,
  Alert,
  TouchableOpacity,
  Button,
  ScrollView,
  SectionList,
} from "react-native";
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import * as SQLite from "expo-sqlite";
import CalendarPicker from "react-native-calendar-picker";
import NairaIcon from "../../assets/nairaiconblack.svg";
import { FontAwesome } from "@expo/vector-icons";
import { BottomSheetModal, BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { convertTo12HourFormat } from "../utils/ConvertTime12Hourly";
import CurrencySignFormatter from "../components/CurrencySignFormatter";
import { useRefresh } from "../store/mainstore";
import { useId } from "react";
import { exportData } from "../utils/ExportJsonData";
import handleJsonImport from "../utils/ImportJsonData";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";
import { removeItem } from "../utils/asyncStorage";
import { useNavigation } from "expo-router";

const db = SQLite.openDatabase("products.db");
const windowWidth = Dimensions.get("screen").width;
const windowHeight = Dimensions.get("screen").height;

const SalesHeader = ({
  title,
  handleToggle,
  state,
  selectedDate,
  modelCheck,
}) => {
  return (
    <>
      <TouchableOpacity style={styles.listViewHeader} onPress={handleToggle}>
        <Text style={styles.listTextProductname}>{title}</Text>
        {parseInt(modelCheck) === -1 ? (
          <Text style={{ fontSize: 10, fontStyle: "italic" }}>
            Click for full view
          </Text>
        ) : (
          <Text style={{ fontSize: 10, fontStyle: "italic" }}>
            {selectedDate}
          </Text>
        )}
      </TouchableOpacity>
    </>
  );
};

export default function SalesRecord() {
  const [salesrecords, setSalesRecord] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [morningToggle, setMorningToggle] = useState(true);
  const [afternoonToggle, setAfternoonToggle] = useState(true);
  const [nightToggle, setNightToggle] = useState(true);
  const [groupData, setGroupData] = useState([]);
  const [sheetChange, setSheetChange] = useState("");
  const [title, setTitle] = useState("");
  const bottomSheetModalRef = useRef();
  const salesRecordRefresh = useRefresh((state) => state.salesRecordRefresh);
  const groupID = useId();
  const [importedJson, setImportedJson] = useState([]);

  // variables
  const snapPoints = useMemo(() => ["25%", "90%"], []);
  // console.log(salesrecords, "uiu");
  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);
  const handlePresentModalPressClose = useCallback(() => {
    bottomSheetModalRef.current?.close();
  }, []);
  const handleSheetChanges = useCallback((index) => {
    setSheetChange(String(index).toString());
  }, []);

  const generateUniqueId = () => {
    // Generate a unique ID using timestamp and a random number
    const timestamp = new Date().getTime();
    const randomNum = Math.floor(Math.random() * 1000);
    return `${timestamp}${randomNum}`;
  };

  // console.log(salesrecords, "iioioi");

  const fetchJsonDataPopulateDb = async () => {
    try {
      const jsonData = await handleJsonImport();
      if (jsonData) {
        let successMessage = ""; // Message to display in the success alert

        db.transaction(
          (tx) => {
            jsonData.forEach((item) => {
              const { id, sales_data } = item;

              // Check if the product ID already exists in the database
              tx.executeSql(
                "SELECT * FROM sales WHERE id = ?",
                [id],
                (_, { rows }) => {
                  const existingProduct = rows._array[0];

                  if (!existingProduct) {
                    // Product with the same ID does not exist, insert the data
                    tx.executeSql(
                      "INSERT INTO sales (id, sales_data) VALUES (?, ?)",
                      [id, sales_data]
                    );
                  } else {
                    console.log(
                      `Data with ID ${id} already exists, skipping insertion.`
                    );
                  }
                },
                (error) =>
                  console.error("Error checking product existence: ", error)
              );
            });
          },
          (error) => console.error("Transaction error: ", error),
          () => {
            successMessage = "Data inserted successfully";
            Alert.alert("Success", successMessage);
          }
        );
      }
    } catch (error) {
      // console.error("Error handling file selection:", error);
      Alert.alert("Error", "No File Selected");
    }
  };

  const fetchProducts = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM sales",
        [],
        (_, { rows }) => {
          setSalesRecord(rows["_array"]);
        },
        (_, error) => console.error("Error fetching sales: ", error)
      );
    });
  };

  useEffect(() => {
    fetchProducts();
  }, [salesRecordRefresh]);
  let refinedData = [];
  if (salesrecords) {
    salesrecords.forEach((x, index) => {
      const sales = JSON.parse(x.sales_data, x.timestamp);
      refinedData = [...refinedData, ...sales];
      // refinedData["id"] = x.id;
    });
  }
  console.log(refinedData, "lolo");

  const refindedDataFilter = refinedData?.filter((value) => {
    const filter =
      new Date(value.salestimestamp * 1000).toDateString() ===
      (selectedDate || new Date().toDateString());
    return filter;
  });

  const salesDate = refindedDataFilter?.map((values) =>
    new Date(values?.salestimestamp * 1000).toTimeString()
  );

  const combineMap = refindedDataFilter.map((values, index) => {
    const timesold = salesDate[index];
    return { ...values, timesold };
  });
  // console.log(convertTo12HourFormat(salesDate[3]));
  // console.log(combineMap, "lolo");
  const TotalSales = useMemo(() => {
    let totalSales = 0;

    // Iterate through each object and calculate count * price
    combineMap.forEach((item) => {
      const itemTotalPrice = item.count * item.price;
      totalSales += itemTotalPrice;
    });

    return totalSales;
  }, [combineMap]);

  const groupedByTimeMemo = useMemo(() => {
    const groupedByTime = {
      Morning: {},
      Afternoon: {},
      Night: {},
    };

    combineMap.forEach((item) => {
      const { timesold } = item;
      const timeParts = timesold.split(" ")[0].split(":");
      const hour = parseInt(timeParts[0], 10);
      const minute = parseInt(timeParts[1], 10);
      const second = parseInt(timeParts[2], 10);
      const timeCategory =
        hour >= 6 && hour < 12
          ? "Morning"
          : hour >= 12 && hour < 18
          ? "Afternoon"
          : "Night";

      // Create a unique timestamp for grouping
      const uniqueTimestamp = `${hour}:${minute}:${second}`;

      if (!groupedByTime[timeCategory][uniqueTimestamp]) {
        groupedByTime[timeCategory][uniqueTimestamp] = [];
      }

      groupedByTime[timeCategory][uniqueTimestamp].push(item);
    });
    return groupedByTime;
  }, [combineMap]);

  const groupedByTimeAfternoonKey = Object.keys(groupedByTimeMemo.Afternoon);
  const groupedByTimeAfternoonValue = Object.values(
    groupedByTimeMemo.Afternoon
  );
  const groupedByTimeMorningKey = Object.keys(groupedByTimeMemo.Morning);
  const groupedByTimeMorningValue = Object.values(groupedByTimeMemo.Morning);

  const groupedByTimeNightKey = Object.keys(groupedByTimeMemo.Night);
  const groupedByTimeNightValue = Object.values(groupedByTimeMemo.Night);

  const groupDataMorning = useMemo(() => {
    const value = groupedByTimeMorningValue?.map((value, index) => ({
      timeSold: convertTo12HourFormat(groupedByTimeMorningKey[index]),
      totalPrice: value.map((x) => {
        return x.totalprice;
      })[0],
      groupID: groupID + "morning",

      codes: value.map((val) => ({
        code: val.code,
        count: val.count,
        price: val.price,
      })),
    }));
    return value;
  }, [groupedByTimeMorningValue]);

  const groupDataAfternoon = useMemo(() => {
    const value = groupedByTimeAfternoonValue?.map((value, index) => ({
      timeSold: convertTo12HourFormat(groupedByTimeAfternoonKey[index]),
      totalPrice: value.map((x) => {
        return x.totalprice;
      })[0],

      groupID: groupID + "afternoon",
      codes: value.map((val) => ({
        code: val.code,
        count: val.count,
        price: val.price,
      })),
    }));
    return value;
  }, [groupedByTimeAfternoonValue]);
  // console.log(convertTo12HourFormat(groupedByTimeAfternoonKey[0]));
  const groupDataNight = useMemo(() => {
    const value = groupedByTimeNightValue?.map((value, index) => ({
      timeSold: convertTo12HourFormat(groupedByTimeNightKey[index]),
      totalPrice: value.map((x) => {
        return x.totalprice;
      })[0],

      groupID: groupID + "night",

      codes: value.map((val) => ({
        code: val.code,
        count: val.count,
        price: val.price,
      })),
    }));
    return value;
  }, [groupedByTimeNightValue]);

  // console.log(groupedByTimeAfternoonValue);

  // const sectionListData = [
  //   {
  //     title: "Morning Sales",
  //     data: groupDataMorning,
  //   },
  //   {
  //     title: "Afternoon Sales",
  //     data: groupDataAfternoon,
  //   },
  //   {
  //     title: "Night Sales",
  //     data: groupDataNight,
  //   },
  // ];

  // console.log(groupDataNight, "ooo");
  // console.log(groupedByTimeNightValue, "xxx");

  const renderListItem = ({ item }) => (
    <View style={styles.listContainer}>
      <View style={styles.listView}>
        <View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              paddingVertical: 8,
              // backgroundColor: "#2b2b2b",
            }}
          >
            <Text>
              Time Sold 🕛:{" "}
              <Text style={{ fontWeight: "bold" }}>{item.timeSold}</Text>
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              <Text>Total:</Text>
              <CurrencySignFormatter
                price={String(item.totalPrice).toString()}
                size={15}
                textstyle={{ fontWeight: "bold" }}
              />
            </View>
          </View>
          {item.codes.map((codeItem) => (
            <View key={codeItem.code} style={{ marginBottom: 5 }}>
              <Text>
                Item:{" "}
                <Text style={styles.listTextProductname}>{codeItem.code}</Text>
              </Text>
              <Text>
                Item Count:
                <Text style={styles.listTextProductname}>{codeItem.count}</Text>
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
              >
                <Text>Item Price:</Text>
                <CurrencySignFormatter
                  price={codeItem.price}
                  textstyle={{ fontWeight: "bold" }}
                />
                <CurrencySignFormatter
                  price={codeItem.price * codeItem.count}
                  size={10}
                  title="subtotal:"
                  textstyle={{ fontSize: 10, fontStyle: "italic" }}
                />
                {/* <Text style={{ fontStyle: "italic" }} /> */}
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const handleDeleteAll = () => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          "DELETE FROM sales;",
          [],
          (_, results) => {
            console.log("Records deleted successfully");
            fetchProducts();
            Alert.alert("Success", "Records deleted successfully");
          },
          (error) => {
            console.error("Error deleting product: ", error);
            Alert.alert("Error", "Error deleting Records");
          }
        );
      },
      null,
      null
    );
  };

  const handleExportNDel = () => {
    const exportRecords = exportData({
      data: salesrecords,
      filename: "sales_record_data_",
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

  const handleDateChange = (date) => {
    const convertDate = new Date(date).toDateString();
    setSelectedDate(convertDate);
    setMorningToggle(true);
    setAfternoonToggle(true);
    setNightToggle(true);
  };
  return (
    <View style={{ flex: 1, overflow: "scroll" }}>
      <View style={styles.container}>
        <View style={{}}>
          <CalendarPicker
            textStyle={{ color: "white" }}
            onDateChange={handleDateChange}
            maxDate={new Date()}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            width: windowWidth * 0.8,
            justifyContent: "center",
            alignItems: "center",
            marginVertical: 6,

            gap: 4,
          }}
        >
          <View style={styles.listViewDate}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={styles.listTextProductname}>
                {selectedDate || new Date().toDateString()} | Total Sales:
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <NairaIcon width={15} height={15} />
                <Text>
                  {Intl.NumberFormat("en").format(parseInt(TotalSales))}
                </Text>
              </View>
            </View>
          </View>
          {/* <TouchableOpacity style={styles.listViewExpand}>
            <Text>
              Full View <FontAwesome name="expand" size={15} />
            </Text>
          </TouchableOpacity> */}
        </View>
        <View style={{ flexDirection: "row", gap: 6 }}>
          <TouchableOpacity
            onPress={() =>
              exportData({ data: salesrecords, filename: "sales_record_data_" })
            }
          >
            <Text style={styles.sortButton}>Export Records</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => fetchJsonDataPopulateDb()}>
            <Text style={styles.sortButton}>Import Records</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleMenuPress()}>
            <Text style={styles.sortButtonDel}>
              <FontAwesome name="trash" size={15} />
            </Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            alignContent: "center",
            justifyContent: "center",
            gap: 6,
            marginTop: 2,
          }}
        >
          <SalesHeader
            title={"Morning Sales 🌥️"}
            handleToggle={() => {
              setGroupData(groupDataMorning), setTitle("Morning Sales 🌥️");
              handlePresentModalPress();
            }}
            state={morningToggle}
            selectedDate={selectedDate || new Date().toDateString()}
            modelCheck={sheetChange}
          />

          <SalesHeader
            title={"Afternoon Sales ☀️"}
            handleToggle={() => {
              setGroupData(groupDataAfternoon), setTitle("Afternoon Sales ☀️");
              handlePresentModalPress();
            }}
            state={afternoonToggle}
            selectedDate={selectedDate || new Date().toDateString()}
            modelCheck={sheetChange}
          />

          <SalesHeader
            title={"Night Sales 🌃"}
            handleToggle={() => {
              setGroupData(groupDataNight), setTitle("Night Sales 🌃");
              handlePresentModalPress();
            }}
            state={nightToggle}
            selectedDate={selectedDate || new Date().toDateString()}
            modelCheck={sheetChange}
          />
        </View>

        <View
          style={{
            backgroundColor: "black",
            marginTop: "auto",
            marginBottom: 5,
          }}
        >
          <BannerAd
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            unitId={TestIds.BANNER}
          />
        </View>

        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={1}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
        >
          <SalesHeader
            title={title}
            handleToggle={() => handlePresentModalPress()}
            state={morningToggle}
            selectedDate={selectedDate || new Date().toDateString()}
            modelCheck={sheetChange}
          />

          {groupData?.length > 0 ? (
            <BottomSheetFlatList
              data={groupData}
              keyExtractor={(item, index) => item.groupID + index}
              renderItem={renderListItem}
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
              {/* <Text style={{ color: "white" }}> CLOSE</Text> */}
            </TouchableOpacity>
          </View>
        </BottomSheetModal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "column",
    backgroundColor: "#004e69",
    // minHeight: windowHeight,
    // overflow: "scroll",
  },
  dateItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  saleItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  recordContainer: {
    display: "flex",
    flexDirection: "column",
    width: windowWidth * 0.9,
    gap: 4,
  },
  recordContainerText: {
    backgroundColor: "white",
    display: "flex",
    gap: 4,
    color: "black",
    flexDirection: "row",
  },
  listContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: "auto",
    marginTop: 5,
    // flex: 1,
  },
  listView: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 10,
    gap: 4,
    backgroundColor: "#fffaeb",
    // marginVertical: 6,
    width: windowWidth * 0.95,
    borderRadius: 6,

    // color: "black",
  },
  listViewHeader: {
    flexDirection: "column",

    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 10,
    backgroundColor: "white",
    // marginVertical: 6,
    // width: windowWidth * 0.95,
    borderRadius: 6,

    // color: "black",
  },
  listViewDate: {
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    padding: 10,
    backgroundColor: "white",
    // marginVertical: 6,
    // width: windowWidth * 0.95,
    borderRadius: 6,

    // color: "black",
  },
  listViewExpand: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
    padding: 10,
    backgroundColor: "white",
    // marginVertical: 6,
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
    fontSize: 14,
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
    // backgroundColor: "black",
    // paddingHorizontal: 10,
    paddingVertical: 4,
    // borderRadius: 6,
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
  noSalesText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
    paddingVertical: 5,
    opacity: 50,
  },
  sortButton: {
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
    // gap: 6,
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
});
{
  /* <SectionList
        sections={sectionListData}
        keyExtractor={(item, index) => item + index}
        renderItem={renderListItem}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.listViewHeader}>
            <Text style={styles.listTextProductname}>{title}</Text>
          </View>
        )}
      /> */
}

{
  /* {groupDataMorning?.length > 0 ? (
          morningToggle ? (
            <FlatList
              data={groupDataMorning}
              keyExtractor={(item, index) => item.groupID + index}
              renderItem={renderListItem}
            />
          ) : null
        ) : (
          <Text style={styles.noSalesText}>No Sales</Text>
        )} */
}
{
  /* {groupDataNight.length > 0 ? (
          nightToggle ? (
            <FlatList
              data={groupDataNight}
              keyExtractor={(item, index) => item.groupID + index}
              renderItem={renderListItem}
            />
          ) : null
        ) : (
          <Text style={styles.noSalesText}>No Sales</Text>
        )} */
}
{
  /* {groupDataAfternoon.length > 0 ? (
          afternoonToggle ? (
            <FlatList
              data={groupDataAfternoon}
              keyExtractor={(item, index) => item.groupID + index}
              renderItem={renderListItem}
            />
          ) : null
        ) : (
          <Text style={styles.noSalesText}>No Sales</Text>
        )} */
}
