import { View, Text, Button, Pressable } from "react-native";
import React from "react";
import { Link, Stack, useRouter } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";

export default function ProductLogicLayout() {
  const router = useRouter();
  return (
    <Stack initialRouteName="index">
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "Products List",
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/(tabs)/productlogic/addproduct")}
            >
              <FontAwesome name="plus" size={20} style={{ color: "white" }} />
            </Pressable>
          ),
          animation: "slide_from_right",
          header: () => (
            <>
              <View style={{ height: 50, backgroundColor: "black" }}></View>
              <View style={{}}>
                <BannerAd
                  size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                  unitId={TestIds.BANNER}
                />
              </View>
            </>
          ),
        }}
      />

      <Stack.Screen
        name="addproduct"
        options={{
          headerTitle: "Add Product",
          animation: "slide_from_right",
          animationDuration: 1,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerTitle: "Edit Product",
          animation: "slide_from_bottom",
          // headerBackVisible: false,
          // headerLeft: () => (
          //   <Link href={"/(tabs)/productlogic/"} asChild>
          //     <FontAwesome name="arrow-left" color="white" size={20} />
          //   </Link>
          // ),
        }}
      />
    </Stack>
  );
}
