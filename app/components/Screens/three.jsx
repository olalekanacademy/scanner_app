import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  StyleSheet,
  Dimensions,
  RefreshControl,
  TouchableOpacity,
  Pressable,
} from "react-native";
import * as SQLite from "expo-sqlite";
import PdfHtmlPart from "../PdfHtmlPart";

const windowWidth = Dimensions.get("screen").width;
const windowHeight = Dimensions.get("screen").height;
const db = SQLite.openDatabase("products.db");

const QrcodeComponent = () => {
  return <SafeAreaView style={styles.container}>{PdfHtmlPart()}</SafeAreaView>;
};

export default QrcodeComponent;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#004e69",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
    paddingTop: 12,
  },
  qrtext: {
    backgroundColor: "white",
    color: "black",
    width: windowWidth * 0.95,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  qrcontainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  qrgenerator: {
    paddingBottom: 12,
  },
  image: {
    flex: 1,
    width: "100%",
    height: 50,
    backgroundColor: "#0553",
    objectFit: "contain",
  },
});

{
  /* <View style={{ paddingTop: 12 }}>
  <FlatList
    data={products}
    keyExtractor={(item) => item.id.toString()}
    renderItem={({ item }) => (
      <View style={styles.qrcontainer} key={item.id}>
        <View style={styles.qrtext}>
          <Text>Product Name: {item.product_name}</Text>
          <Text>Product Barcode: {item.product_barcode}</Text>
          <Text>Product Count: {item.product_count}</Text>
        </View>
        <View style={styles.qrgenerator}>
          <QRCodeGenerator
            barcode={item.product_barcode}
            count={item.product_count}
          />
        </View>
      </View>
    )}
    refreshControl={
      <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
    }
  />
</View>; */
}
