import spicrConnect from '../util/spicrConnect.js';

import carouselTFunctions from '../process/carouselTF.js';
import layerTFunctions from '../process/layerTF.js';
import resetAllLayers from '../process/resetAllLayers.js';

spicrConnect.carousel = carouselTFunctions;
spicrConnect.layer = layerTFunctions;
spicrConnect.reset = resetAllLayers;
