import transformProperty from 'kute.js/src/util/transformProperty.js'
import transformOriginLegacy from '../util/transformOriginLegacy.js'

export default function(element) {
  Array.from(element.getElementsByClassName('spicr-layer')).map(x=>{ 
    x.style.opacity = ''
    x.style[transformProperty] = ''
    x.style[transformOriginLegacy] = ''
  })
}