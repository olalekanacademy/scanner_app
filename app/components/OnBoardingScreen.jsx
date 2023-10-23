import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  Animated,
  Dimensions,
} from "react-native";
import React from "react";
import { useRef, useState } from "react";

const data = [
  {
    id: 1,
    title: "Make your business more efficient and flexible.",
    description:
      "Harness the power of your smart phone to make your business smarter.",
    image: require("../../assets/onboarding/Business-growth-bro.png"),
  },
  {
    id: 2,
    title: "Record-keeping is now easier.",
    description: "It is now very easy to keep records for every sale you make.",
    image: require("../../assets/onboarding/Receipt-pana.png"),
  },
];

const Item = ({ data }) => {
  return (
    <View style={{ width: windowWidth }}>
      <Text>{data?.title}</Text>
      {data ? <Image source={data.image} resizeMode="contain" /> : null}
    </View>
  );
};

const windowWidth = Dimensions.get("screen").width;
const windowHeight = Dimensions.get("screen").height;

export default function OnBoardingScreen() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const viewableItemsChanged = useRef(({ viewableItems }) => {
    setCurrentIndex(viewableItems[0].index);
  }).current;
  const slideRef = useRef(null);
  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;
  return (
    <View
      style={{
        position: "absolute",
        zIndex: 60,
        top: 0,
        flex: 3,
        backgroundColor: "white",
        height: windowHeight,
      }}
    >
      <View style={{}}>
        <FlatList
          data={data}
          renderItem={(item) => <Item data={item.item} />}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            {
              useNativeDriver: false,
            }
          )}
          scrollEventThrottle={32}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slideRef}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({});
