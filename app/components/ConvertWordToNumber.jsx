import { StyleSheet, Text, View } from "react-native";
import React, { useMemo } from "react";

const generateWordToNumberMapping = (maxNumber) => {
  const wordToNumber = {};
  const numberWords = [
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];

  // Handle numbers up to 19
  for (let i = 0; i < numberWords.length; i++) {
    wordToNumber[numberWords[i]] = i + 1;
  }

  const tensWords = [
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];

  // Handle multiples of 10 up to 90
  for (let i = 0; i < tensWords.length; i++) {
    wordToNumber[tensWords[i]] = (i + 2) * 10;
  }

  // Handle numbers up to the specified maxNumber
  for (let i = 100; i <= maxNumber; i++) {
    const hundreds = Math.floor(i / 100);
    const remainder = i % 100;
    const tens = Math.floor(remainder / 10);
    const ones = remainder % 10;

    if (tens === 0) {
      wordToNumber[
        `${numberWords[hundreds - 1]} hundred ${numberWords[ones - 1]}`
      ] = i;
    } else {
      wordToNumber[
        `${numberWords[hundreds - 1]} hundred ${tensWords[tens - 2]} ${
          numberWords[ones - 1]
        }`
      ] = i;
    }
  }

  wordToNumber["to"] = 2;
  wordToNumber["too"] = 2;

  return wordToNumber;
};
const wordToNumberMapping = generateWordToNumberMapping(1000);

const ConvertWordToNumber = ({ word }) => {
  const lowerCaseWord = word.toLowerCase();
  return wordToNumberMapping[lowerCaseWord] || NaN;
};

export default ConvertWordToNumber;

const styles = StyleSheet.create({});
