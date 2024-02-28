import path from 'path';
import { getAppFolder, getConfigProp, logTask, writeCleanFile, RnvPlatform } from '@rnv/core';
import { getAppFolderName } from './common';
import { Context } from './types';
import { addSystemInjects, getAppTemplateFolder } from '@rnv/sdk-utils';

// const xml2js = require('xml2js');
// const parser = new xml2js.Parser();

export const parseXcscheme = async (c: Context, platform: RnvPlatform) => {
    logTask('parseXcscheme');
    // XCSCHEME
    // const allowProvisioningUpdates = getConfigProp(
    //     c,
    //     platform,
    //     'allowProvisioningUpdates',
    //     true
    // );
    // const provisioningStyle = getConfigProp(
    //     c,
    //     platform,
    //     'provisioningStyle',
    //     'Automatic'
    // );
    // const poisxSpawn = runScheme === 'Release' && !allowProvisioningUpdates && provisioningStyle === 'Manual';
    // Since RN 61+ this must be set to true otherwise debug apps install but not launch
    const poisxSpawn = true;
    const appFolder = getAppFolder(c);
    const appFolderName = getAppFolderName(c, platform);
    const appTemplateFolder = getAppTemplateFolder(c, platform);

    const debuggerId = poisxSpawn ? '' : 'Xcode.DebuggerFoundation.Debugger.LLDB';
    const launcherId = poisxSpawn
        ? 'Xcode.IDEFoundation.Launcher.PosixSpawn'
        : 'Xcode.DebuggerFoundation.Launcher.LLDB';
    const schemePath = `${appFolderName}.xcodeproj/xcshareddata/xcschemes/${appFolderName}.xcscheme`;

    let _commandLineArguments = '';
    const commandLineArguments = getConfigProp(c, c.platform, 'commandLineArguments');
    if (commandLineArguments?.length) {
        commandLineArguments.forEach((arg) => {
            _commandLineArguments += `
        <CommandLineArgument
           argument = "${arg}"
           isEnabled = "YES">
        </CommandLineArgument>
`;
        });
    }

    const injects = [
        { pattern: '{{PLUGIN_DEBUGGER_ID}}', override: debuggerId },
        { pattern: '{{PLUGIN_LAUNCHER_ID}}', override: launcherId },
        { pattern: '{{INJECT_COMMAND_LINE_ARGUMENTS}}', override: _commandLineArguments },
    ];

    addSystemInjects(c, injects);

    writeCleanFile(path.join(appTemplateFolder!, schemePath), path.join(appFolder, schemePath), injects, undefined, c);

    // const parseObj = await parser.parseStringPromise(path.join(appFolder, schemePath));
};
