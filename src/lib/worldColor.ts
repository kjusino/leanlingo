// One accent hue per world. 20 distinct, well-spaced HSL hues; the
// saturation/lightness wrapped around the hue is theme-aware and lives
// in CSS — see the `--world-hue` formulas in leanlingo.css.
const HUES: number[] = [
    200, // w1  blue
    260, // w2  indigo
    140, // w3  green
    320, // w4  magenta
    35,  // w5  amber
    175, // w6  teal
    10,  // w7  red
    285, // w8  violet
    90,  // w9  lime
    220, // w10 royal
    300, // w11 pink
    160, // w12 mint
    50,  // w13 yellow
    240, // w14 periwinkle
    120, // w15 grass
    340, // w16 rose
    20,  // w17 orange
    195, // w18 cyan
    270, // w19 purple
    100, // w20 olive
];

export type WorldColor = { hue: number };

export function worldColor(worldId: string): WorldColor {
    const m = worldId.match(/^w(\d+)/);
    const n = m ? Number(m[1]) : 1;
    return { hue: HUES[(n - 1) % HUES.length] };
}
