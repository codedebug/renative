export const RnvPlatformName = {
    web: 'web',
    ios: 'ios',
    android: 'android',
    androidtv: 'androidtv',
    firetv: 'firetv',
    tvos: 'tvos',
    macos: 'macos',
    linux: 'linux',
    windows: 'windows',
    tizen: 'tizen',
    webos: 'webos',
    chromecast: 'chromecast',
    kaios: 'kaios',
    webtv: 'webtv',
    androidwear: 'androidwear',
    tizenwatch: 'tizenwatch',
    tizenmobile: 'tizenmobile',
    xbox: 'xbox',
    // androidauto: 'androidauto',
    // alexa: 'alexa',
    // appleauto: 'appleauto',
    // astian: 'astian',
    // blackberry: 'blackberry',
    // chromeos: 'chromeos',
    // fireos: 'fireos',
    // hbbtv: 'hbbtv',
    // meego: 'meego',
    // netcast: 'netcast',
    // occulus: 'occulus',
    // orsay: 'orsay',
    // ps4: 'ps4',
    // roku: 'roku',
    // sailfish: 'sailfish',
    // tivo: 'tivo',
    // ubuntu: 'ubuntu',
    // ubuntutouch: 'ubuntutouch',
    // unity: 'unity',
    // vewd: 'vewd',
    // vidaa: 'vidaa',
    // vieraconnect: 'vieraconnect',
    // vizio: 'vizio',
    // watchos: 'watchos',
    // webian: 'webian',
    // wii: 'wii',
    // wp10: 'wp10',
    // wp8: 'wp8',
    // xbox360: 'xbox360',
    // kodi: 'kodi',
    // boxee: 'boxee',
    // horizontv: 'horizontv',
    // mediaroom: 'mediaroom',
    // yahoosmarttv: 'yahoosmarttv',
    // slingbox: 'slingbox',
    // hololens: 'hololens',
    // webvr: 'webvr',
    // saphi: 'saphi',
} as const;

// IMPORTANT: this must match RnvPlatformName size and key order
export const RnvPlatforms = [
    RnvPlatformName.web,
    RnvPlatformName.ios,
    RnvPlatformName.android,
    RnvPlatformName.androidtv,
    RnvPlatformName.firetv,
    RnvPlatformName.tvos,
    RnvPlatformName.macos,
    RnvPlatformName.linux,
    RnvPlatformName.windows,
    RnvPlatformName.tizen,
    RnvPlatformName.webos,
    RnvPlatformName.chromecast,
    RnvPlatformName.kaios,
    RnvPlatformName.webtv,
    RnvPlatformName.androidwear,
    RnvPlatformName.tizenwatch,
    RnvPlatformName.tizenmobile,
    RnvPlatformName.xbox,
] as const;

type RnvPlatformName = typeof RnvPlatformName;
export type RnvPlatformNameKey = keyof RnvPlatformName;
export type PlatformKey = RnvPlatformNameKey;
