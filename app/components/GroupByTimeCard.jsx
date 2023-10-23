// GroupedDataComponent.js

import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

const GroupedDataComponent = ({ groupedData }) => {
  const renderCard = ({ item }) => {
    return (
      <View style={styles.card}>
        {Object.entries(item).map(([key, value]) => (
          <View key={key} style={styles.cardRow}>
            <Text style={styles.cardKey}>{key}:</Text>
            <Text style={styles.cardValue}>{JSON.stringify(value)}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderGroup = ({ item }) => {
    const groupedTimes = Object.keys(item);

    return (
      <View style={styles.groupContainer}>
        <Text style={styles.groupHeaderText}>{item}</Text>
        <FlatList
          data={groupedTimes}
          keyExtractor={(time) => time}
          renderItem={({ item: time }) => (
            <View style={styles.timeContainer}>
              <Text style={styles.timeHeaderText}>{time}</Text>
              <FlatList
                data={item[time]}
                keyExtractor={(item) => item.key.toString()}
                renderItem={renderCard}
              />
            </View>
          )}
        />
      </View>
    );
  };

  return (
    <FlatList
      data={Object.keys(groupedData)}
      keyExtractor={(item) => item}
      renderItem={renderGroup}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  cardRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  cardKey: {
    fontWeight: "bold",
    marginRight: 5,
  },
  cardValue: {
    flex: 1,
  },
  groupContainer: {
    margin: 10,
    paddingBottom: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
  },
  groupHeaderText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    marginLeft: 10,
    marginTop: 10,
  },
  timeContainer: {
    marginBottom: 10,
  },
  timeHeaderText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    marginLeft: 10,
  },
});

export default GroupedDataComponent;
