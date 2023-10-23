import { create } from "zustand";
import ConvertWordToNumber from "../components/ConvertWordToNumber";
import * as SQLite from "expo-sqlite";
import { generateUniqueId } from "../utils/generateUniqueId";

const db = SQLite.openDatabase("products.db");

export const useDataStore = create((set) => ({
  dataurl: [],
  setDataUrl: (data) => set((state) => ({ dataurl: [...state.dataurl, data] })),
  productsData: [],
  setProductsData: (data) => set(() => ({ productsData: data })),
}));

export const useVoiceStore = create((set) => ({
  voiceNameInputData: "",
  voiceCountInputData: "",
  voicePriceInputData: "",

  setVoiceNameInputData: (data) =>
    set((state) => ({ voiceNameInputData: data })),
  setVoiceNameInputDataEmpty: () => set(() => ({ voiceNameInputData: "" })),

  setVoiceCountInputData: (data) =>
    set((state) => ({ voiceCountInputData: data })),

  setVoiceCountInputDataEmpty: () => set(() => ({ voiceCountInputData: "" })),
  setVoicePriceInputData: (data) =>
    set((state) => ({ voicePriceInputData: data })),
  setVoicePriceInputDataEmpty: () => set(() => ({ voicePriceInputData: "" })),
}));

export const useRefresh = create((set) => ({
  allProductsRefresh: 1,
  setAllProductsRefresh: () =>
    set((state) => ({
      allProductsRefresh: (state.allProductsRefresh += 1),
    })),
  salesRecordRefresh: 1,
  setSalesRecordRefresh: () =>
    set((state) => ({
      salesRecordRefresh: (state.salesRecordRefresh += 1),
    })),
}));

export const useMountStore = create((set) => ({
  productNav: false,
  setProductnav: () => set((state) => ({ productNav: !state.productNav })),
}));

export const useSalesData = create((set) => ({
  dbValue: [],
  setDbValue: (data) =>
    set((state) => ({
      dbValue: data,
    })),
  setDbValueEmpty: () =>
    set(() => ({
      dbValue: [],
    })),
}));
export const useSalesDataFilter = create((set) => ({
  dbFilter: [],
  setdbFilter: (data) =>
    set(() => ({
      dbFilter: data,
    })),
}));
export const useResultArray = create((set) => ({
  resultArray: [],
  setResultArray: (data) =>
    set(() => ({
      resultArray: data,
    })),
}));

export const useVoiceProductStore = create((set, get) => ({
  productArray: [],
  productValue: [],
  parsedValues: [],
  setProductArray: (data) =>
    set((state) => ({
      productArray: [...state.productArray, data],
    })),

  setParsedValues: () =>
    set((state) => {
      const updatedParsedValues = state.productArray
        .filter((item) => item !== undefined)
        .map((item) => {
          const parts = item.split(" ");
          const numberPart =
            parts[0] && !isNaN(parseInt(parts[0], 10))
              ? parseInt(parts[0], 10)
              : ConvertWordToNumber({ word: parts[0] }); // Assuming ConvertWordToNumber is a valid function
          const comparePartx = parts.slice(1).join(" ");
          const comparePart = String(comparePartx).toLowerCase().trim();
          return { numberPart, comparePart };
        });

      return { parsedValues: updatedParsedValues };
    }),

  setProductFilter: (index) =>
    set((state) => {
      console.log(index, "index");
      const filteredArray = state.productArray.filter(
        (item) => item !== undefined
      );
      const productArrayFilter = filteredArray.filter((_, i) => i !== index);
      console.log(productArrayFilter, "productArrayFilter");
      return { productArray: productArrayFilter };
    }),

  handleQuantitySubtract: (index) =>
    set((state) => {
      const filteredArray = state.productArray.filter(
        (item) => item !== undefined
      );
      console.log(filteredArray, "opo");
      if (index >= 0 && index < filteredArray.length) {
        const item = filteredArray[index];
        const [number, itemName] = item.split(" ");
        const newNumber = parseInt(number) - 1;

        if (newNumber >= 0) {
          filteredArray[index] = `${newNumber} ${itemName}`;
        } else {
          // Remove the item from the array if the new number is less than 0
          filteredArray.splice(index, 1);
        }
      }
      console.log(filteredArray, "xxx");
      return { productArray: filteredArray };
    }),

  handleQuantityAddition: (index) =>
    set((state) => {
      const filteredArray = state.productArray.filter(
        (item) => item !== undefined
      );
      console.log(filteredArray, "add");
      if (index >= 0 && index < filteredArray.length) {
        const item = filteredArray[index];
        const [number, itemName] = item.split(" ");
        const newNumber = parseInt(number) + 1;

        filteredArray[index] = `${newNumber} ${itemName}`;
      }
      console.log(filteredArray, "addXX");

      return { productArray: filteredArray };
    }),

  setProductArrayEmpty: () =>
    set({
      productArray: [],
      productValue: [],
      parsedValues: [],
    }),
}));
