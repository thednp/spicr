import spicrConnect from '../util/spicrConnect.js'
import getLayerData from './getLayerData.js'

export default function(slides,idx,next) { // function to animate slider item background
  let activeItem = slides[idx] || slides[0],
      nextItem = slides[next],
      result = [],
      bg = activeItem.getElementsByClassName('item-bg')[0],
      nextBg = nextItem && nextItem.getElementsByClassName('item-bg')[0],
      nextData = nextBg && getLayerData(nextBg);

  for ( let x in nextData ) {
    if ( /translate|rotate/.test(x) ){
      for ( let y in nextData[x] ){
        nextData[x][y] = -nextData[x][y]
      }
    } else if (x==='opacity'){
      nextData[x] = 0
    }
  }

  if (idx === -1){
    bg && result.push( spicrConnect.layer(bg,1) )
  } else {
    bg && result.push( spicrConnect.layer(bg,0,nextData) )
    nextBg && result.push( spicrConnect.layer(nextBg,1) )
  }

  return result;
}