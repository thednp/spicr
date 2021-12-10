/**
 * Returns proper values from string attribute values.
 * @param {Element} elem target layer
 * @param {string} attributeString attribute value
 * @param {number | boolean} isOrigin attribute is transform-origin
 * @returns {Spicr.layerData} layer data ready to tween
 */
export default function processLayerData(elem, attributeString, isOrigin) {
  const attributesArray = attributeString.trim().split(/[,|;]/);
  const obj = {};

  attributesArray.forEach((x) => {
    const prop = x.split(/[:|=]/);
    const pName = prop[0];
    const pValue = prop[1];
    const offsetType = /y/i.test(pName) || /v/i.test(pValue) ? 'offsetHeight' : 'offsetWidth';

    if (isOrigin && /%/.test(pValue) && !/z/i.test(pName)) {
      obj[pName] = pValue;
    } else {
      obj[pName] = /%/.test(pValue)
        ? (parseFloat(pValue) * elem[offsetType]) / 100
        : parseFloat(pValue);
    }
  });

  return obj;
}
