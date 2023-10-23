import { View, Text, Image, Dimensions, TounchableOpacity } from "react-native";
import React from "react";
import Onboarding from "react-native-onboarding-swiper";
import { useRouter, useNavigation } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import { useNavigation } from "@react-navigation/native";
import { setItem } from "./utils/asyncStorage";

const windowWidth = Dimensions.get("screen").width;
const windowHeight = Dimensions.get("screen").height;

const doneButton = ({ ...props }) => {
  return (
    <TouchableOpacity
      {...props}
      style={{
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 8,
        marginRight: 10,
        marginBottom: 5,
      }}
    >
      <FontAwesome name="check-square" color={"#004E69"} size={50} />
    </TouchableOpacity>
  );
};

const onboarding = () => {
  const router = useRouter();

  const navigation = useNavigation();

  const handleDone = () => {
    // router.replace("(tabs)");
    navigation.navigate("(tabs)");
    // navigation.navigate("(tabs)");
    setItem("onboarded", "1");
  };
  return (
    <View
      style={{
        backgroundColor: "#FFFBF3",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: windowWidth,
        flex: 1,
      }}
    >
      <View style={{ width: windowWidth, height: windowHeight }}>
        <Onboarding
          onSkip={handleDone}
          onDone={handleDone}
          DoneButtonComponent={doneButton}
          containerStyles={{ justifyContent: "center" }}
          bottomBarHighlight={false}
          pages={[
            {
              backgroundColor: "#FFFBF3",
              image: (
                <Image
                  source={require("../assets/onboarding/Business_vision-pana.png")}
                  resizeMode="contain"
                  style={{
                    width: windowWidth * 0.8,
                    height: windowHeight * 0.4,
                  }}
                />
              ),
              title: (
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 20,
                    marginBottom: 4,
                    color: "#004E69",
                  }}
                >
                  MODERNISE YOUR BUSINESS.
                </Text>
              ),
              subtitle:
                "Harness the power of your smart phone to make your business smarter, more efficient, and more flexible.",
            },
            {
              backgroundColor: "#FFFBF3",
              image: (
                <Image
                  source={require("../assets/onboarding/sales.png")}
                  resizeMode="contain"
                  style={{
                    width: windowWidth * 0.8,
                    height: windowHeight * 0.4,
                  }}
                />
              ),
              title: (
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 20,
                    marginBottom: 4,
                    color: "#004E69",
                  }}
                >
                  RECORD KEEPING IS NOW EASIER.
                </Text>
              ),
              subtitle:
                "Keeping records can be stressful, but now, with a click, you have your record saved.",
            },
            {
              backgroundColor: "#FFFBF3",
              image: (
                <Image
                  source={require("../assets/onboarding/automate.png")}
                  resizeMode="contain"
                  style={{
                    width: windowWidth * 0.8,
                    height: windowHeight * 0.4,
                  }}
                />
              ),
              title: (
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 20,
                    marginBottom: 4,
                    color: "#004E69",
                    textAlign: "center",
                  }}
                >
                  AUTOMATE THE BORING SIDE OF SELLING.
                </Text>
              ),
              subtitle:
                "speed up your selling process, reduce silly mistakes, sell faster, and sell smarter.",
            },
          ]}
        />
      </View>
    </View>
  );
};

export default onboarding;
