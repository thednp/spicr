export default function(elem) { // get all item layers except item-bg
  let result = [], 
      all = elem.getElementsByClassName('spicr-layer'), 
      background = elem.getElementsByClassName('item-bg')[0];
  Array.from(all).map(x=>x!==background && result.push(x))
  return result;
}