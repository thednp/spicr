import spicrConnect from '../util/spicrConnect';
import getLayerData from './getLayerData';
import getLayers from './getLayers';

/**
 * Returns an `Array` or Tween objects for all layers
 * of the current active slider item and / or the next active item.
 *
 * @param {Element[]} slides spicr items
 * @param {number} idx current active index
 * @param {number} next next active index
 * @returns {KUTE.TweenBase[]} an `Array` of tween objects
 */
export default function animateSliderLayers(slides, idx, next) {
  const activeItem = slides[idx] || slides[0];
  const allLayers = getLayers(activeItem);
  const isIn = activeItem.classList.contains('active');
  const nextItem = slides[next];
  const nextBg = nextItem && nextItem.getElementsByClassName('item-bg')[0];
  const nextData = nextBg ? getLayerData(nextBg) : 0;

  if (nextData) {
    Object.keys(nextData).forEach((x) => {
      if (/translate|rotate/.test(x) && nextData[x] instanceof Object) {
        Object.keys(nextData[x]).forEach((y) => {
          nextData[x][y] = -nextData[x][y];
        });
      }
    });
    return allLayers.map((x) => spicrConnect.layer(x, 0, nextData));
  }
  return allLayers.map((x) => spicrConnect.layer(x, isIn ? 0 : 1));
}
