// KUTE custom build for Spicr, MODERN BROWSERS
// using transformFunctionsBase component
import Render from 'kute.js/src/core/render';
import Interpolate from 'kute.js/src/objects/interpolate';
import Objects from 'kute.js/src/objects/objectsBase';
import Util from 'kute.js/src/objects/util';
import Easing from 'kute.js/src/easing/easing';
import Internals from 'kute.js/src/core/internals';
import Selector from 'kute.js/src/util/selector';
import Animation from 'kute.js/src/animation/animationBase';
import Tween from 'kute.js/src/tween/tweenBase';
import fromTo from 'kute.js/src/interface/fromTo';

import baseTransform from 'kute.js/src/components/transformFunctionsBase';
import baseOpacity from 'kute.js/src/components/opacityPropertyBase';
import baseBoxModel from 'kute.js/src/components/boxModelBase';

import Spicr from '../spicr';
import spicrConnect from './spicrConnect';

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

Object.assign(Spicr, K);

export default Spicr;
