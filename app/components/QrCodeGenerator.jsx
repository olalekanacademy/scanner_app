import React, { useEffect, useState, useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import QRCode from "react-native-qrcode-svg";
import NairaIcon from "../../assets/nairaicon.svg";
import { FileSystem } from "expo";
import { captureRef } from "react-native-view-shot";
import AsyncStorage from "@react-native-async-storage/async-storage";

const QRCodeGenerator = ({ barcode, count }) => {
  const [data, setData] = useState("");
  const svgRef = useRef();

  const getDataURL = () => {
    svgRef.current?.toDataURL(callback);
  };

  const callback = (dataURL) => {
    setData(dataURL);
  };

  // const storeData = async (value) => {
  //   try {
  //     await AsyncStorage.setItem("my-key", data);
  //   } catch (e) {
  //     console.log(e);
  //   }
  // };

  useEffect(() => {
    getDataURL();
  }, []);
  const qrCodes = [];
  // console.log(data);
  for (let i = 0; i < count; i++) {
    qrCodes.push(
      <View key={i}>
        <QRCode
          value={`Product Barcode: ${barcode}, Count: ${i + 1}`}
          size={50}
          getRef={svgRef}
        />
      </View>
    );
  }

  return (
    <View
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "flex-start",

        gap: 6,
      }}
    >
      {qrCodes.map((qrCode, index) => (
        <View
          style={{ borderWidth: 10, borderColor: "white", borderRadius: 5 }}
          key={index}
        >
          {qrCode}
        </View>
      ))}
    </View>
  );
};

// const QRCodeGenerator = async ({ barcode, count }) => {
//   const qrCodeImages = [];

//   for (let i = 0; i < count; i++) {
//     const qrCodeValue = `Product Barcode: ${barcode}, Count: ${i + 1}`;

//     const svg = (
//       <View key={i}>
//         <QRCode value={qrCodeValue} size={50} />
//       </View>
//     );

//     const svgData = await captureRef(svg, {
//       format: "svg",
//       quality: 1.0,
//     });

//     qrCodeImages.push(svgData);
//   }

//   return qrCodeImages;
// };

export default QRCodeGenerator;
