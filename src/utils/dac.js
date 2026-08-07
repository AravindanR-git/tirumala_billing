// src/utils/dac.js
import { Preferences } from "@capacitor/preferences";

const DAC_KEY = "dac_dictionary";

/**
 * Get the entire DAC dictionary from storage
 */
export const getDacDictionary = async () => {
  const { value } = await Preferences.get({ key: DAC_KEY });
  return value ? JSON.parse(value) : {};
};

/**
 * Get last DAC of a specific mine
 */
export const getLastDac = async (mineName) => {
  const dict = await getDacDictionary();
  return dict[mineName] || 0; // default start 0
};

/**
 * Generate next DAC for a mine
 */
export const generateNextDac = async (mineName) => {
  const dict = await getDacDictionary();
  const lastDac = dict[mineName] || 0;
  const nextDac = lastDac + 1;

  dict[mineName] = nextDac; // update dictionary
  await Preferences.set({ key: DAC_KEY, value: JSON.stringify(dict) });
  return nextDac;
};

/**
 * For debugging: log the dictionary
 */
export const logDacDictionary = async () => {
  const dict = await getDacDictionary();
  console.log("📖 DAC Dictionary:", dict);
};
