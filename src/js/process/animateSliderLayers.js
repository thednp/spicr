import spicrConnect from '../util/spicrConnect.js'
import getLayers from './getLayers.js'

export default function(elem) { // function to animate slider item layers
  let allLayers = getLayers(elem), result = [],
      isIn = !elem.classList.contains('active');
  allLayers.map(x=>{
    result.push(spicrConnect.layer(x,isIn))
  })
  return result
}