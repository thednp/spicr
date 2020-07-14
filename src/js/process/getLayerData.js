import processLayerData from './processLayerData.js'
import defaultDuration from '../options/defaultDuration.js'
import defaultEasing from '../options/defaultEasing.js'

export default function(elem) { 
  let translate = elem.getAttribute('data-translate'), 
      rotate = elem.getAttribute('data-rotate'),
      scale = parseFloat(elem.getAttribute('data-scale')),
      origin = elem.getAttribute('data-transform-origin'),
      opacity = elem.getAttribute('data-opacity'),
      duration = parseInt(elem.getAttribute('data-duration')),
      delay = parseInt(elem.getAttribute('data-delay')),
      easing = elem.getAttribute('data-easing')
  return {
    translate : translate         ? processLayerData(elem,translate) : '',
    rotate    : rotate            ? processLayerData(elem,rotate) : '', 
    origin    : origin            ? processLayerData(elem,origin,1) : '', 
    scale     : !isNaN(scale)     ? scale : '',
    opacity   : opacity!=='false' ? 1 : 0,
    duration  : !isNaN(duration)  ? duration : defaultDuration,
    delay     : !isNaN(delay)     ? delay : 0,
    easing    : easing            ? easing : defaultEasing
  }
}