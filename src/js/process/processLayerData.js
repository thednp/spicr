export default function(elem,attributeString){ // process array from data string
  let attributesArray = attributeString.trim().split(/[,|;]/), obj = {};
  attributesArray.map(x=>{
    let prop = x.split(/[:|=]/), pName = prop[0], pValue = prop[1], 
    offsetType = /y/i.test(pName)||/v/i.test(pValue) ? 'offsetHeight' : 'offsetWidth';
    obj[pName] = /%/.test(pValue) ? parseFloat(pValue)*elem[offsetType]/100 : parseFloat(pValue);
  })
  return obj;
}