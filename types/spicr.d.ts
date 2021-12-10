declare module "spicr/src/js/options/defaultOptions" {
    export default defaultSpicrOptions;
    namespace defaultSpicrOptions {
        const delay: number;
        const duration: number;
        const easing: string;
        const interval: number;
        const touch: boolean;
        const pause: string;
    }
}
declare module "spicr/src/js/util/spicrConnect" {
    export default spicrConnect;
    /**
     * @type {object} spicrConnect
     * @property {function} carousel
     * @property {function} layer
     * @property {function} reset
     * @property {function} fromTo
     */
    const spicrConnect: object;
}
declare module "spicr/src/js/process/processLayerData" {
    /**
     * Returns proper values from string attribute values.
     * @param {Element} elem target layer
     * @param {string} attributeString attribute value
     * @param {number | boolean} isOrigin attribute is transform-origin
     * @returns {Spicr.layerData} layer data ready to tween
     */
    export default function processLayerData(elem: Element, attributeString: string, isOrigin: number | boolean): Spicr.layerData;
}
declare module "spicr/src/js/process/getLayerData" {
    /**
     * Returns layer animation settings for DATA API attributes.
     * @param {Element} layer target
     * @returns {Spicr.layerData} values to create a tween object
     */
    export default function getLayerData(layer: Element): Spicr.layerData;
}
declare module "spicr/src/js/process/getLayers" {
    /**
     * Returns an `Array` with all layers from a slide / Spicr element.
     * @param {Element} elem target
     * @returns {Element[]} an `Array` of Spicr layers
     */
    export default function getLayers(elem: Element): Element[];
}
declare module "spicr/src/js/process/animateSliderLayers" {
    /**
     * Returns an `Array` or Tween objects for all layers
     * of the current active slider item and / or the next active item.
     *
     * @param {Element[]} slides spicr items
     * @param {number} idx current active index
     * @param {number} next next active index
     * @returns {KUTE.TweenBase[]} an `Array` of tween objects
     */
    export default function animateSliderLayers(slides: Element[], idx: number, next: number): KUTE.TweenBase[];
}
declare module "spicr/src/js/util/transformOriginLegacy" {
    export default transformOriginLegacy;
    const transformOriginLegacy: string;
}
declare module "spicr/src/js/process/carouselLegacy" {
    /**
     * TweenCarousel to work with KUTE transformLegacy component which returns
     * an `Array` of Tween objects for layers of the current and next active item.
     * @param {Element} elem
     * @param {Element[]} items
     * @param {number} active
     * @param {number} next
     * @param {string} direction animation direction
     * @returns {KUTE.TweenBase[]} the `Array` of tween objects
     */
    export default function carouselLegacy(elem: Element, items: Element[], active: number, next: number, direction: string): KUTE.TweenBase[];
}
declare module "spicr/src/js/process/carouselTF" {
    /**
     * TweenCarousel to work with KUTE transformFunctions component which returns
     * an `Array` of Tween objects for layers of the current and next active item.
     * @param {Element} elem
     * @param {Element[]} items
     * @param {number} active
     * @param {number} next
     * @param {string} direction animation direction
     * @returns {KUTE.TweenBase[]} the `Array` of tween objects
     */
    export default function carouselTF(elem: Element, items: Element[], active: number, next: number, direction: string): KUTE.TweenBase[];
}
declare module "spicr/src/js/process/carouselTM" {
    /**
     * TweenCarousel to work with KUTE transformMatrix component which returns
     * an `Array` of Tween objects for layers of the current and next active item.
     * @param {Element} elem
     * @param {Element[]} items
     * @param {number} active
     * @param {number} next
     * @param {string} direction animation direction
     * @returns {KUTE.TweenBase[]} the `Array` of tween objects
     */
    export default function carouselTM(elem: Element, items: Element[], active: number, next: number, direction: string): KUTE.TweenBase[];
}
declare module "spicr/src/js/process/layerLegacy" {
    /**
     * Returns a tween object for a single layer for TransformLegacy component.
     * @param {Element} elem target layer
     * @param {number | boolean} isInAnimation parent slide is next
     * @param {Spicr.layerData} nextData some layer data used when parent is NOT next
     * @returns {KUTE.TweenBase} a new tween object
     */
    export default function layerLegacy(elem: Element, isInAnimation: number | boolean, nextData: Spicr.layerData): KUTE.TweenBase;
}
declare module "spicr/src/js/process/layerTF" {
    /**
     * Returns a tween object for a single layer for TransformFunctions component.
     * @param {Element} elem target layer
     * @param {number | boolean} isInAnimation parent slide is next
     * @param {Spicr.layerData} nextData some layer data used when parent is NOT next
     * @returns {KUTE.TweenBase} a new tween object
     */
    export default function layerTF(elem: Element, isInAnimation: number | boolean, nextData: Spicr.layerData): KUTE.TweenBase;
}
declare module "spicr/src/js/process/layerTM" {
    /**
     * Returns a tween object for a single layer for TransformMatrix component.
     * @param {Element} elem target layer
     * @param {number | boolean} isInAnimation parent slide is next
     * @param {Spicr.layerData} nextData some layer data used when parent is NOT next
     * @returns {KUTE.TweenBase} a new tween object
     */
    export default function layerTM(elem: Element, isInAnimation: number | boolean, nextData: Spicr.layerData): KUTE.TweenBase;
}
declare module "spicr/src/js/process/resetAllLayers" {
    /**
     * Reset all layers for a Spicr element or a single slide.
     * @param {Element} element target Spicr element or slide
     */
    export default function resetAllLayers(element: Element): void;
}
declare module "spicr/src/js/util/transformPropertyLegacy" {
    export default transformPropertyLegacy;
    const transformPropertyLegacy: string;
}
declare module "spicr/src/js/process/resetAllLayersLegacy" {
    /**
     * Reset all layers for a Spicr element or a single slide.
     * This function is to be used with legacy builds.
     *
     * @param {Element} element target Spicr element or slide
     */
    export default function resetAllLayersLegacy(element: Element): void;
}
declare module "spicr/src/js/spicr" {
    /**
     * Returns a new Spicr instance
     * @param {Element | string} el target element
     * @param {Spicr.spicrOptions} ops instance options
     */
    export default function Spicr(el: Element, ops: Spicr.spicrOptions): void;
    export default class Spicr {
        /**
         * Returns a new Spicr instance
         * @param {Element} el target element
         * @param {Spicr.spicrOptions} ops instance options
         */
        constructor(el: Element, ops: Spicr.spicrOptions);
        tweens: any[];
        /**
         * Returns the index of the curent active item.
         */
        getActiveIndex: () => number;
        /**
         * Cycles through items automatically in a pre-configured time interval.
         */
        cycle: () => void;
        /**
         * Slides to a certain Spicr item.
         * @param {number} nextIdx the index of the next slide.
         */
        slideTo: (nextIdx: number) => void;
        /**
         * Removes Spicr from target element
         */
        dispose: () => void;
    }
}
declare module "spicr/src/js/util/init" {
    /**
     * DATA API initialization callback
     *
     * @param {Element=} input target parent, usually the document
     */
    export default function initComponent(input?: Element | undefined): void;
}
declare module "spicr/src/js/util/version" {
    export default Version;
    /** @type {string} */
    const Version: string;
}
declare module "spicr/types/modules/spicr" {
    export { default as defaultOptions } from "spicr/src/js/options/defaultOptions";
    export { default as animateSliderLayers } from "spicr/src/js/process/animateSliderLayers";
    export { default as carouselLegacy } from "spicr/src/js/process/carouselLegacy";
    export { default as carouselTF } from "spicr/src/js/process/carouselTF";
    export { default as carouselTM } from "spicr/src/js/process/carouselTM";
    export { default as getLayerData } from "spicr/src/js/process/getLayerData";
    export { default as getLayers } from "spicr/src/js/process/getLayers";
    export { default as layerLegacy } from "spicr/src/js/process/layerLegacy";
    export { default as layerTF } from "spicr/src/js/process/layerTF";
    export { default as layerTM } from "spicr/src/js/process/layerTM";
    export { default as processLayerData } from "spicr/src/js/process/processLayerData";
    export { default as resetAllLayers } from "spicr/src/js/process/resetAllLayers";
    export { default as resetAllLayersLegacy } from "spicr/src/js/process/resetAllLayersLegacy";
    export { default as initComponent } from "spicr/src/js/util/init";
    export { default as SpicrConnect } from "spicr/src/js/util/spicrConnect";
    export { default as transformOriginLegacy } from "spicr/src/js/util/transformOriginLegacy";
    export { default as transformPropertyLegacy } from "spicr/src/js/util/transformPropertyLegacy";
    export { default as Version } from "spicr/src/js/util/version";
    export { default as Spicr } from "spicr/src/js/spicr";
}
