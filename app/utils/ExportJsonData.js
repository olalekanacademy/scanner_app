import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
export const exportData = async ({ data, filename }) => {
  try {
    const json = JSON.stringify(data);
    const filePath =
      FileSystem.documentDirectory +
      `/${filename}${new Date().toDateString()}_${new Date().toTimeString()}.json`;
    await FileSystem.writeAsStringAsync(filePath, json);

    await Sharing.shareAsync(filePath, {
      mimeType: "application/json",
      dialogTitle: "Share JSON Data",
      UTI: "public.json",
    });
  } catch (error) {
    console.error("Error exporting data:", error);
  }
};
