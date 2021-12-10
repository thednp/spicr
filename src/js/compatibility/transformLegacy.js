import spicrConnect from '../util/spicrConnect';

import carouselLegacy from '../process/carouselLegacy';
import layerLegacy from '../process/layerLegacy';
import resetAllLayers from '../process/resetAllLayersLegacy';

spicrConnect.carousel = carouselLegacy;
spicrConnect.layer = layerLegacy;
spicrConnect.reset = resetAllLayers;
