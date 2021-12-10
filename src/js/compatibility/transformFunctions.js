import spicrConnect from '../util/spicrConnect';

import carouselTFunctions from '../process/carouselTF';
import layerTFunctions from '../process/layerTF';
import resetAllLayers from '../process/resetAllLayers';

spicrConnect.carousel = carouselTFunctions;
spicrConnect.layer = layerTFunctions;
spicrConnect.reset = resetAllLayers;
