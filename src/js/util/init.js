import Spicr from '../spicr';

/**
 * DATA API initialization callback
 *
 * @param {Element=} input target parent, usually the document
 */
export default function initComponent(input) {
  const lookup = input instanceof Element ? input : document;
  const Spicrs = Array.from(lookup.querySelectorAll('[data-function="spicr"]'));
  Spicrs.forEach((x) => new Spicr(x));
}

// export to "global"
Spicr.initComponent = initComponent;

// initialize when loaded
if (document.body) {
  initComponent();
} else {
  document.addEventListener('DOMContentLoaded', initComponent, { once: true });
}
