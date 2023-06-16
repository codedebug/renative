import path from 'path';
import { Common, FileUtils, PluginManager, ProjectManager, Resolver } from 'rnv';
// import { logWarning } from 'rnv/dist/core/systemManager/logger';
import { getAppFolderName } from './common';

const {
    fsExistsSync,
    copyFileSync,
    fsWriteFileSync,
    fsReadFileSync,
    copyFolderContentsRecursiveSync,
    // cleanEmptyFoldersRecursively,
    fsMkdirSync
} = FileUtils;
const {
    getAppFolder,
    getConfigProp,
} = Common;
const { doResolvePath } = Resolver;

const {
    parseFonts
} = ProjectManager;

const {
    parsePlugins,
    // sanitizePluginPath, includesPluginPath
} = PluginManager;

export const ejectXcodeProject = async (c) => {
    const isMonorepo = getConfigProp(c, c.platform, 'isMonorepo');
    const monoRoot = getConfigProp(c, c.platform, 'monoRoot');

    const rootMonoProjectPath = isMonorepo ? path.join(c.paths.project.dir, monoRoot || '../..') : c.paths.project.dir;
    const rootProjectPath = c.paths.project.dir;

    const appFolder = getAppFolder(c);
    const appFolderName = getAppFolderName(c, c.platform);


    //= ==========
    // xcodeproj
    //= ==========
    const xcodeProjPath = path.join(
        appFolder,
        `${appFolderName}.xcodeproj/project.pbxproj`
    );

    if (fsExistsSync(xcodeProjPath)) {
        const projAsString = fsReadFileSync(xcodeProjPath).toString();

        const pathRnMatch = `${path.join(rootMonoProjectPath, 'node_modules', 'react-native')}/`;
        // eslint-disable-next-line no-template-curly-in-string
        const pathRnReplace = '${SRCROOT}/rn_static/node_modules/react-native/';

        const pathNmMatch = `${path.join(rootMonoProjectPath, 'node_modules')}/`;
        // eslint-disable-next-line no-template-curly-in-string
        const pathNmReplace = '${SRCROOT}/rn_modules/';

        const pathFontsmMatch = `${path.join(rootProjectPath, 'appConfigs/base/fonts')}/`;
        // eslint-disable-next-line no-template-curly-in-string
        const pathFontsReplace = '${SRCROOT}/fonts/';

        const projSanitised = projAsString
            .replaceAll(pathRnMatch, pathRnReplace)
            .replaceAll(pathNmMatch, pathNmReplace)
            .replaceAll(pathFontsmMatch, pathFontsReplace);

        fsWriteFileSync(xcodeProjPath, projSanitised);
    }

    //= ==========
    // Podfile
    //= ==========

    const podfilePath = path.join(
        appFolder,
        'Podfile'
    );

    if (podfilePath) {
        const podfileAsString = fsReadFileSync(podfilePath).toString();

        const pathRnMatch = `${path.join(rootMonoProjectPath, 'node_modules', 'react-native')}/`;
        const pathRnReplace = './rn_static/node_modules/react-native/';

        const pathNmMatch = `${path.join(rootMonoProjectPath, 'node_modules')}/`;
        const pathNmReplace = './rn_modules/';

        const podfileSanitised = podfileAsString
            .replaceAll(pathRnMatch, pathRnReplace)
            .replaceAll(pathNmMatch, pathNmReplace);

        fsWriteFileSync(podfilePath, podfileSanitised);
    }

    //= ==========
    // Plugins
    //= ==========

    parsePlugins(c, c.platform, (_plugin, pluginPlat, key) => {
        const podPath = doResolvePath(key);
        const extensionsFilter = ['.h', '.m', '.swift', '.c', '.podspec', '.rb', '.mm'];
        // const excludeFolders = ['node_modules', 'android'];

        const destPath = path.join(appFolder, 'rn_modules', key);
        copyFolderContentsRecursiveSync(
            podPath, destPath, false, null, false, null, null, c, extensionsFilter);
        copyFileSync(path.join(podPath, 'package.json'), path.join(destPath, 'package.json'));
    });

    // try {
    //     cleanEmptyFoldersRecursively(path.join(appFolder, 'rn_modules'));
    // } catch (e) {
    //     logWarning(e);
    // }

    //= ==========
    // Fonts
    //= ==========

    parseFonts(c, (font, dir) => {
        if (font.includes('.ttf') || font.includes('.otf')) {
            const key = font.split('.')[0];
            const includedFonts = getConfigProp(c, c.platform, 'includedFonts');
            if (
                includedFonts
                && (includedFonts.includes('*') || includedFonts.includes(key))
            ) {
                const fontSource = path.join(dir, font);
                if (fsExistsSync(fontSource)) {
                    const pathNmMatch = `${path.join(rootMonoProjectPath, 'node_modules')}`;
                    const pathNmReplace = path.join(appFolder, 'rn_modules');
                    const destDir = dir.replace(pathNmMatch, pathNmReplace);

                    if (!fsExistsSync(destDir)) {
                        fsMkdirSync(destDir);
                    }

                    const destPath = path.join(destDir, font);
                    copyFileSync(fontSource, destPath);
                }
            }
        }
    });
};
