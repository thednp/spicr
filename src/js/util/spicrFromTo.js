import spicrConnect from './spicrConnect.js';

if (typeof window.KUTE !== 'undefined') {
  spicrConnect.fromTo = window.KUTE.fromTo;
// } else if (typeof K !== 'undefined') {
//   spicrConnect.fromTo = K.fromTo
// } else if (typeof fromTo !== 'undefined') {
//   spicrConnect.fromTo = fromTo
} else {
  throw Error('Spicr requires KUTE.js ^2.0.10');
}
