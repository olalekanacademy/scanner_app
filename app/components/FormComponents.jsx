import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";

const ProductForm = () => {
  const [product_name, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [product_count, setProductCount] = useState("");
  const [errors, setErrors] = useState({});

  const handleSave = () => {
    const newErrors = {};

    if (!product_name.trim()) {
      newErrors.product_name = "Product name is required";
    }

    if (isNaN(Number(price))) {
      newErrors.price = "Price must be a number";
    }

    if (product_count && isNaN(Number(product_count))) {
      newErrors.product_count = "Product count must be a number";
    }

    if (Object.keys(newErrors).length === 0) {
      // You can handle the form submission here
      // For now, just log the values
      console.log({ product_name, price, product_count });
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Product Name</Text>
      <TextInput
        style={styles.input}
        value={product_name}
        onChangeText={(text) => {
          setProductName(text);
          setErrors({});
        }}
      />
      {errors.product_name && (
        <Text style={styles.error}>{errors.product_name}</Text>
      )}

      <Text>Price</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={(text) => {
          setPrice(text);
          setErrors({});
        }}
      />
      {errors.price && <Text style={styles.error}>{errors.price}</Text>}

      <Text>Product Count (optional)</Text>
      <TextInput
        style={styles.input}
        value={product_count}
        onChangeText={(text) => {
          setProductCount(text);
          setErrors({});
        }}
      />
      {errors.product_count && (
        <Text style={styles.error}>{errors.product_count}</Text>
      )}

      <Button title="Save" onPress={handleSave} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    borderColor: "gray",
    borderWidth: 1,
    padding: 8,
    marginBottom: 10,
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
});

export default ProductForm;
