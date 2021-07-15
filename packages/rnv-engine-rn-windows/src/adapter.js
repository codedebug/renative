const path = require('path');
// eslint-disable-next-line import/no-unresolved
const exclusionList = require('metro-config/src/defaults/exclusionList');

export const withRNV = (config) => {
    const projectPath = process.env.RNV_PROJECT_ROOT || process.cwd();

    const watchFolders = [path.resolve(projectPath, 'node_modules')];

    if (process.env.RNV_IS_MONOREPO === 'true' || process.env.RNV_IS_MONOREPO === true) {
        const monoRootPath = process.env.RNV_MONO_ROOT || projectPath;
        watchFolders.push(path.resolve(monoRootPath, 'node_modules'));
        watchFolders.push(path.resolve(monoRootPath, 'packages'));
    }
    if (config?.watchFolders?.length) {
        watchFolders.push(...config.watchFolders);
    }

    const cnf = {
        ...config,
        resolver: {
            blockList: exclusionList([
                // This stops "react-native run-windows" from causing the metro server to crash if its already running
                // TODO. Project name should be dynamically injected here somehow
                new RegExp(
                    `${process.env.RNV_APP_BUILD_DIR.replace(/[/\\]/g, '/')}.*`,
                ),
                // This prevents "react-native run-windows" from hitting: EBUSY: resource busy or locked, open msbuild.ProjectImports.zip
                /.*\.ProjectImports\.zip/,
                /platformBuilds\/.*/,
                /buildHooks\/.*/,
                /projectConfig\/.*/,
                /appConfigs\/.*/,
                /renative.local.*/,
                /metro.config.local.*/,
                /platformBuilds\/.*/,
                /buildHooks\/.*/,
                /projectConfig\/.*/,
                /website\/.*/,
                /appConfigs\/.*/,
                /renative.local.*/,
                /metro.config.local.*/,
            ]),
        },
        transformer: {
            getTransformOptions: async () => ({
                transform: {
                    experimentalImportSupport: false,
                    inlineRequires: true,
                },
            }),
        },
        watchFolders,
        projectRoot: path.resolve(projectPath)
    };

    cnf.resolver.sourceExts = process.env.RNV_EXTENSIONS.split(',');

    return cnf;
};
