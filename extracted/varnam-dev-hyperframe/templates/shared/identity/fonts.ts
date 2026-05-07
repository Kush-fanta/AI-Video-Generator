import { loadFont as loadDisplaySans } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadEditorialSerif } from "@remotion/google-fonts/PlayfairDisplay";

const { fontFamily: displaySansFamily } = loadDisplaySans();
const { fontFamily: sansFamily } = loadSans();
const { fontFamily: serifFamily } = loadSerif();
const { fontFamily: editorialSerifFamily } = loadEditorialSerif();

export {
  displaySansFamily,
  editorialSerifFamily,
  sansFamily,
  serifFamily,
};
