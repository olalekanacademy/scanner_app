import { StyleSheet, Text, View } from "react-native";
import React from "react";

const CalculateLevenshteinDistance = (a, b) => {
  const matrix = Array(a.length + 1)
    .fill(null)
    .map(() => Array(b.length + 1).fill(null));

  for (let i = 0; i <= b.length; i++) {
    matrix[0][i] = i;
  }

  for (let i = 0; i <= a.length; i++) {
    matrix[i][0] = i;
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[a.length][b.length];
};

export default CalculateLevenshteinDistance;

const styles = StyleSheet.create({});
