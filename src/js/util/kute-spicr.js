// KUTE.js custom build for Spicr, MODERN BROWSERS
// using transformFunctionsBase component
import Render from 'kute.js/src/core/render.js';
import Interpolate from 'kute.js/src/objects/interpolate.js';
import Objects from 'kute.js/src/objects/objectsBase.js';
import Util from 'kute.js/src/objects/util.js';
import Easing from 'kute.js/src/easing/easing.js';
import Internals from 'kute.js/src/core/internals.js';
import Selector from 'kute.js/src/util/selector.js';
import Animation from 'kute.js/src/animation/animationBase.js';
import Tween from 'kute.js/src/tween/tweenBase.js';
import fromTo from 'kute.js/src/interface/fromTo.js';

import baseTransform from 'kute.js/src/components/transformFunctionsBase.js';
import baseOpacity from 'kute.js/src/components/opacityPropertyBase.js';
import baseBoxModel from 'kute.js/src/components/boxModelBase.js';

import Spicr from '../spicr.js';
import spicrConnect from './spicrConnect.js';

spicrConnect.fromTo = fromTo;

const K = {
  Animation,
  Components: {
    Transform: new Animation(baseTransform),
    Opacity: new Animation(baseOpacity),
    BoxModel: new Animation(baseBoxModel),
  },
  Tween,
  fromTo,
  Objects,
  Easing,
  Util,
  Render,
  Interpolate,
  Internals,
  Selector,
};

Object.keys(K).forEach((o) => {
  Spicr[o] = K[o];
});
