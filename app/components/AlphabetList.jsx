import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
} from "react-native";

const windowWidth = Dimensions.get("screen").width;
const windowHeight = Dimensions.get("screen").height;

const AlphabetList = ({ onAlphabetPress }) => {
  const alphabets = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ];

  const renderAlphabet = ({ item }) => (
    <TouchableOpacity
      style={styles.button}
      onPress={() => onAlphabetPress(item)}
    >
      <Text style={styles.buttonText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { width: windowWidth * 0.9 }]}>
      <FlatList
        data={alphabets}
        keyExtractor={(item) => item}
        renderItem={renderAlphabet}
        numColumns={5} // Display 3 columns in a row
        columnWrapperStyle={styles.row} // Align items in rows
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    // backgroundColor: "black",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    gap: 15,
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white", // Change the background color as needed
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 24,
  },
});
export default AlphabetList;
