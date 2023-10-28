import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs } from "expo-router";
import {
  Pressable,
  useColorScheme,
  Text,
  TouchableOpacity,
  Platform,
  Alert,
  SafeAreaView,
  View,
} from "react-native";

import Colors from "../../constants/Colors";
import { BarCodeScanner } from "expo-barcode-scanner";
import { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import Voice from "@react-native-voice/voice";
import { Permission } from "react-native";
import { useMountStore, useRefresh } from "../store/mainstore";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import * as DocumentPicker from "expo-document-picker";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={22} style={{ marginBottom: -10 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [hasPermission, setHasPermission] = useState(null);
  const router = useRouter();
  const Refresh = useRefresh();
  // const setProductnav = useMountStore((state) => state.setProductnav);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      // ts-ignore
      setHasPermission(status === "granted");
    };

    getBarCodeScannerPermissions();
  }, []);

  // useEffect(() => {
  //   const requestPermission = async () => {
  //     if (Platform.OS !== "web") {
  //       const { status } =
  //         await DocumentPicker.requestMediaLibraryPermissionsAsync();
  //       if (status !== "granted") {
  //         Alert.alert(
  //           "Permission denied",
  //           "You need to allow access to files."
  //         );
  //         return;
  //       }
  //     }
  //   };
  //   requestPermission();
  // }, []);

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <>
      <BottomSheetModalProvider>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          }}
          initialRouteName="index"
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Easy Bizz",
              tabBarIcon: ({ color }) => (
                <TabBarIcon name="qrcode" color={color} />
              ),

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

              headerStyle: { backgroundColor: "#015c7a" },
              headerTitleStyle: { fontWeight: "normal", fontSize: 15 },
              unmountOnBlur: true,
            }}
          />
          {/* <Tabs.Screen
            name="speech"
            options={{
              title: "Speech",
              tabBarIcon: ({ color }) => (
                <TabBarIcon name="microphone" color={color} />
              ),
              // header: () => (
              //   <>
              //     <View style={{ height: 50, backgroundColor: "black" }}></View>
              //     <View style={{}}>
              //       <BannerAd
              //         size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
              //         unitId={TestIds.BANNER}
              //       />
              //     </View>
              //   </>
              // ),
            }}
          /> */}
          {/* <Tabs.Screen
            name="productcal"
            options={{
              title: "Calculation",
              tabBarIcon: ({ color }) => (
                <TabBarIcon name="calculator" color={color} />
              ),
              // header: () => (
              //   <>
              //     <View style={{ height: 50, backgroundColor: "black" }}></View>
              //     <View style={{}}>
              //       <BannerAd
              //         size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
              //         unitId={TestIds.BANNER}
              //       />
              //     </View>
              //   </>
              // ),
            }}
          /> */}
          <Tabs.Screen
            name="salesrecord"
            options={{
              title: "Sales Record",
              tabBarIcon: ({ color }) => (
                <TabBarIcon name="book" color={color} />
              ),
              // header: () => (
              //   <>
              //     <View style={{ height: 50, backgroundColor: "black" }}></View>
              //     <View style={{}}>
              //       <BannerAd
              //         size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
              //         unitId={TestIds.BANNER}
              //       />
              //     </View>
              //   </>
              // ),
            }}
          />
          <Tabs.Screen
            name="productlogic"
            options={{
              title: "Product List",
              headerShown: false,
              tabBarIcon: ({ color }) => (
                <TabBarIcon name="product-hunt" color={color} />
              ),
            }}
          />
          {/* <Tabs.Screen
            name="three"
            options={{
              title: "Prints",
              tabBarIcon: ({ color }) => (
                <TabBarIcon name="print" color={color} />
              ),
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
          /> */}
        </Tabs>
      </BottomSheetModalProvider>
    </>
  );
}
