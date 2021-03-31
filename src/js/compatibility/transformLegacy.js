import spicrConnect from '../util/spicrConnect.js';

import carouselLegacy from '../process/carouselLegacy.js';
import layerLegacy from '../process/layerLegacy.js';
import resetAllLayers from '../process/resetAllLayersLegacy.js';

spicrConnect.carousel = carouselLegacy;
spicrConnect.layer = layerLegacy;
spicrConnect.reset = resetAllLayers;
