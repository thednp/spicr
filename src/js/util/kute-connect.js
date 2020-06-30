// KUTE.js base build for Spicr, MODERN BROWSERS
// built for transformMatrixBase component
import K from 'kute.js/src/index-base.js'
import Spicr from '../spicr.js'
import spicrConnect from './spicrConnect.js'

spicrConnect.fromTo = K.fromTo
for (let o in K) { Spicr[o] = K[o] }