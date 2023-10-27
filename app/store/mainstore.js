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

export const useProductStore = create((set, get) => ({
  productStore: [],
  uniqueData: [],
  setProductStore: (data) =>
    set((state) => ({ productStore: [data, ...state.productStore] })),

  setUniqueData: () => {
    const { productStore } = get(); // Get the current productStore from the state

    // Encapsulate the logic of the useEffect within setUniqueData
    const barcodeCounts = {};

    productStore.forEach((item) => {
      const barcode = item.barcode;

      if (barcodeCounts[barcode]) {
        barcodeCounts[barcode] += 1;
      } else {
        barcodeCounts[barcode] = 1;
      }
    });

    const newData = productStore.reduce((accumulator, item) => {
      if (barcodeCounts[item.barcode] === 1) {
        accumulator.push({ ...item, cart_count: 1 });
      } else if (!accumulator.find((x) => x.barcode === item.barcode)) {
        accumulator.push({ ...item, cart_count: barcodeCounts[item.barcode] });
      }
      return accumulator;
    }, []);

    set({ uniqueData: newData });
  },

  setProductStoreEmpty: () =>
    set(() => ({
      productStore: [],
    })),
  setUniqueDataEmpty: () =>
    set(() => ({
      uniqueData: [],
    })),
  increaseCartCount: (barcode) => {
    set((state) => ({
      uniqueData: state.uniqueData.map((item) => {
        if (item.barcode === barcode) {
          return { ...item, cart_count: item.cart_count + 1 };
        }
        return item;
      }),
    }));
  },

  decreaseCartCount: (barcode) => {
    set((state) => {
      // Create a new uniqueData array with cart_count decremented and filter out items where cart_count becomes 0
      const updatedUniqueData = state.uniqueData
        .map((item) => {
          if (item.barcode === barcode && item.cart_count > 0) {
            return { ...item, cart_count: item.cart_count - 1 };
          }
          return item;
        })
        .filter((item) => item.cart_count > 0);

      // Create a new productStore array without the item with cart_count equal to 0
      const updatedProductStore = state.productStore.filter((item) => {
        if (item.barcode === barcode) {
          return item.cart_count > 0;
        }
        return true;
      });

      return {
        uniqueData: updatedUniqueData,
        productStore: updatedProductStore,
      };
    });
  },
}));
