import { useRef, useState, useEffect, forwardRef } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import QRCode from "react-native-qrcode-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDataStore } from "../store/mainstore";

const PDFGenerator = forwardRef(function PDFGenerator(props, ref) {
  const { barcode, ...otherprops } = props;
  const setDatau = useDataStore((state) => state.setDataUrl);
  useEffect(() => {
    const getDataURL = () => {
      ref.current?.toDataURL((data) => {
        setDatau(data);
      });
    };
    getDataURL();
  }, [ref]);
  return <QRCode value={`${barcode}`} size={50} getRef={ref} />;
});

export default PDFGenerator;
