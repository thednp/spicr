import Spicr from '../spicr.js'

// DATA API
export default function initComponent(lookup) {
  lookup = lookup ? lookup : document;
  let Spicrs = Array.from(lookup.querySelectorAll('[data-function="spicr"]'));
  Spicrs.map(x=>new Spicr(x))
}

// export to "global"
Spicr.initComponent = initComponent

// initialize when loaded
document.body ? initComponent() : document.addEventListener('DOMContentLoaded', function initScrollWrapper(){
  initComponent()
  document.removeEventListener('DOMContentLoaded', initScrollWrapper)
});
