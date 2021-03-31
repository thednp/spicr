export default function resetAllLayers(element) {
  Array.from(element.getElementsByClassName('spicr-layer')).forEach((x) => {
    x.style.opacity = '';
    x.style.transform = '';
    x.style.transformOrigin = '';
  });
}
