import React from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

const NairaLogoSvgComp = ({ width, height }) => {
  const viewBox = `0 0 ${width} ${height}`;

  return (
    <View>
      <Svg
        width={width}
        height={height}
        viewBox={viewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <Path
          d="M17.83 53.2329V8.23291L42.83 53.2329V8.23291"
          stroke="white"
          stroke-width="5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <Path
          d="M10.33 25.7329H50.33M10.33 35.7329H50.33"
          stroke="white"
          stroke-width="5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </Svg>
    </View>
  );
};

export default NairaLogoSvgComp;
