import spicrConnect from '../util/spicrConnect.js'

import carouselMatrix from '../process/carouselTM.js'
import layerMatrix from '../process/layerTM.js'
import resetAllLayers from '../process/resetAllLayers.js'

spicrConnect.carousel = carouselMatrix
spicrConnect.layer = layerMatrix
spicrConnect.reset = resetAllLayers
