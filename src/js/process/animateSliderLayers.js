import spicrConnect from '../util/spicrConnect.js'
import getLayerData from './getLayerData.js'
import getLayers from './getLayers.js'

export default function(slides,idx,next) { // function to animate slider item background
  let activeItem = slides[idx] || slides[0],
      allLayers = getLayers(activeItem),
      isIn = activeItem.classList.contains('active'),
      nextItem = slides[next],
      nextBg = nextItem && nextItem.getElementsByClassName('item-bg')[0],
      nextData = nextBg ? getLayerData(nextBg) : 0;

  for ( let x in nextData ) {
    if ( /translate|rotate/.test(x) ){
      for ( let y in nextData[x] ){
        nextData[x][y] = -nextData[x][y]
      }
    }
  }

  if (nextData) {
    return allLayers.map(x=>spicrConnect.layer(x,0,nextData))
  } else {
    return allLayers.map(x=>spicrConnect.layer(x,isIn?0:1))
  }
}