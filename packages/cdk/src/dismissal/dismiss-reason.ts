/**
 * Why a layer asks to close.
 *
 * @cckValue escape - The user pressed Escape, or the browser asked a native dialog to close.
 * @cckValue outside-press - The user pressed outside the layer.
 * @cckValue focus-out - Focus moved outside the layer.
 */
export type DismissReason = 'escape' | 'outside-press' | 'focus-out';
