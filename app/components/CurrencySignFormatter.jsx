import { StyleSheet, Text, View } from "react-native";
import React from "react";
import NairaIcon from "../../assets/nairaiconblack.svg";
import NairaIconWhite from "../../assets/nairaicon.svg";

export default function CurrencySignFormatter({
  price,
  title,
  textstyle,
  size = 15,
  white = false,
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={textstyle}> {title}</Text>
      <View>
        {white ? (
          <NairaIconWhite width={size} height={size} />
        ) : (
          <NairaIcon width={size} height={size} />
        )}
      </View>
      <Text style={textstyle}>
        {Intl.NumberFormat("en").format(parseInt(price))}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({});
