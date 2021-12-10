export as namespace Spicr;
export default Spicr;

// dependency
export * as KUTE from 'kute.js';

// main
import { default as Spicr } from "spicr/src/js/spicr";

export { default as defaultOptions } from "spicr/src/js/options/defaultOptions";
export { default as animateSliderLayers } from "spicr/src/js/process/animateSliderLayers";
export { default as carouselLegacy } from "spicr/src/js/process/carouselLegacy";
export { default as carouselTF } from "spicr/src/js/process/carouselTF";
export { default as carouselTM } from "spicr/src/js/process/carouselTM";
export { default as getLayerData } from "spicr/src/js/process/getLayerData";
export { default as getLayers } from "spicr/src/js/process/getLayers";
export { default as layerLegacy } from "spicr/src/js/process/layerLegacy";
export { default as layerTF } from "spicr/src/js/process/layerTF";
export { default as layerTM } from "spicr/src/js/process/layerTM";
export { default as processLayerData } from "spicr/src/js/process/processLayerData";
export { default as resetAllLayers } from "spicr/src/js/process/resetAllLayers";
export { default as resetAllLayersLegacy } from "spicr/src/js/process/resetAllLayersLegacy";
export { default as initComponent } from "spicr/src/js/util/init";
export { default as SpicrConnect } from "spicr/src/js/util/spicrConnect";
export { default as transformOriginLegacy } from "spicr/src/js/util/transformOriginLegacy";
export { default as transformPropertyLegacy } from "spicr/src/js/util/transformPropertyLegacy";
export { default as Version } from "spicr/src/js/util/version";

export {
  spicrOptions,
  layerData,
} from './modules/types';