export interface layerData {
  /** @default [0,0,0] */
  translate?: number[],
  /** @default [0,0,0] */
  rotate?: number[],
  /** @default '50% 50%' */
  origin?: number[] | string,
  /** @default 1 */
  scale?: number,
  /** @default 1 */
  opacity?: boolean | number,
  /** @default 500 */
  duration: number,
  /** @default 0 */
  delay: number,
  /** @default 'linear' */
  easing: string,
}

export interface spicrOptions {
  /** @default 250 */
  delay: number,
  /** @default 500 */
  duration: 500,
  /** @default 'easingCubicOut' */
  easing: 'easingCubicOut',
  /** @default 5000 */
  interval: number | false,
  /** @default true */
  touch: true,
  /** @default 'hover' */
  pause: boolean | 'hover',
}
