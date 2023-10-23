import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState, useRef } from "react";

const DataUrlGenerator = (ref) => {
  const [data, setData] = useState("");

  useEffect(() => {
    const getDataURL = () => {
      ref.current?.toDataURL((data) => {
        setData(data);
      });
    };
    getDataURL();
  }, []);
  return data;
};

export default DataUrlGenerator;

const styles = StyleSheet.create({});
