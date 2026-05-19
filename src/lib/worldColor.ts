// One accent hue per world. 20 distinct, well-spaced HSL values that read
// clearly on the dark background. Index follows world number (1-based).
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

export type WorldColor = {
    base: string;   // bright accent — for borders, completed fill, focused rings
    soft: string;   // dim background tint — for available-state fill
    text: string;   // on-base readable label
};

export function worldColor(worldId: string): WorldColor {
    const m = worldId.match(/^w(\d+)/);
    const n = m ? Number(m[1]) : 1;
    const hue = HUES[(n - 1) % HUES.length];
    return {
        base: `hsl(${hue} 75% 60%)`,
        soft: `hsl(${hue} 55% 22%)`,
        text: `hsl(${hue} 90% 92%)`,
    };
}
