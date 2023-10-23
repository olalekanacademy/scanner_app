import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import { useState } from "react";

const SalesHeader = ({ title, handleToggle }) => {
  return (
    <TouchableOpacity style={styles.listViewHeader} onPress={handleToggle}>
      <Text style={styles.listTextProductname}>{title}</Text>
    </TouchableOpacity>
  );
};

export default function SalesDetailsComp({
  groupDataMorning,
  groupDataAfternoon,
  groupDataNight,
  renderListItem,
}) {
  const [morningToggle, setMorningToggle] = useState(true);
  const [afternoonToggle, setAfternoonToggle] = useState(true);
  const [nightToggle, setNightToggle] = useState(true);
  console.log(groupDataMorning);
  return (
    <View>
      <SalesHeader
        title={"Morning Sales 🌥️"}
        handleToggle={() => setMorningToggle((prev) => !prev)}
      />
      {groupDataMorning?.length > 0 ? (
        morningToggle ? (
          <FlatList
            data={groupDataMorning}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderListItem}
          />
        ) : null
      ) : (
        <Text style={styles.noSalesText}>No Sales</Text>
      )}
      <SalesHeader
        title={"Afternoon Sales ☀️"}
        handleToggle={() => setAfternoonToggle((prev) => !prev)}
      />
      {groupDataAfternoon?.length > 0 ? (
        afternoonToggle ? (
          <FlatList
            data={groupDataAfternoon}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderListItem}
          />
        ) : null
      ) : (
        <Text style={styles.noSalesText}>No Sales</Text>
      )}
      <SalesHeader
        title={"Night Sales 🌃"}
        handleToggle={() => setNightToggle((prev) => !prev)}
      />
      {groupDataNight?.length > 0 ? (
        nightToggle ? (
          <FlatList
            data={groupDataNight}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderListItem}
          />
        ) : null
      ) : (
        <Text style={styles.noSalesText}>No Sales</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({});
