import spicrConnect from '../util/spicrConnect';

import carouselMatrix from '../process/carouselTM';
import layerMatrix from '../process/layerTM';
import resetAllLayers from '../process/resetAllLayers';

spicrConnect.carousel = carouselMatrix;
spicrConnect.layer = layerMatrix;
spicrConnect.reset = resetAllLayers;
