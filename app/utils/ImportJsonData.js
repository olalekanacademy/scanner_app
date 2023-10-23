import * as DocumentPicker from "expo-document-picker";

const handleJsonImport = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/json",
    });
    // console.log(result.assets, "lolo");
    const uri = result.assets.map((value) => value.uri).toString();
    // console.log(uri, "kkk");
    const response = await fetch(uri);
    const jsonData = await response.json();
    // console.log("JSON Data:", jsonData);

    return jsonData;
  } catch (error) {
    console.error("Error picking document:", error);
    throw error; // Re-throw the error for the caller to handle
  }
};

export default handleJsonImport;
