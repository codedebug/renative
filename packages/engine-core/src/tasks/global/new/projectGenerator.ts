import {
    // ConfigFileProject,
    ConfigName,
    // PlatformKey,
    applyTemplate,
    chalk,
    configureTemplateFiles,
    generateLocalJsonSchemas,
    getApi,
    getContext,
    getWorkspaceOptions,
    logDebug,
    logTask,
    updateRenativeConfigs,
    writeFileSync,
} from '@rnv/core';
import path from 'path';
import { NewProjectData } from './types';
import { configureGit } from './questions/confirmGit';

export const saveProgressIntoProjectConfig = async (data: NewProjectData) => {
    const c = getContext();
    writeFileSync(c.paths.project.config, data.files.project.renativeConfig);
    writeFileSync(c.paths.project.package, data.files.project.packageJson);
};

export const initNewProject = async () => {
    const c = getContext();

    c.paths.project.package = path.join(c.paths.project.dir, 'package.json');
    c.paths.project.config = path.join(c.paths.project.dir, ConfigName.renative);

    const data: NewProjectData = {
        defaultVersion: '0.1.0',
        defaultTemplate: '@rnv/template-starter',
        defaultProjectName: 'helloRenative',
        defaultAppTitle: 'Hello Renative',
        defaultWorkspace: 'rnv',
        teamID: '',
        optionPlatforms: {},
        optionTemplates: {},
        optionWorkspaces: getWorkspaceOptions(),
        files: {
            project: {
                renativeConfig: {},
                packageJson: {},
            },
            template: {
                renativeTemplateConfig: {},
                renativeConfig: {},
            },
        },
    };
    // TODO: This enforces to generate initial runtime configs. find more reliable way to do this
    await updateRenativeConfigs();
    return data;
};

export const generateNewProject = async (data: NewProjectData) => {
    logTask(
        `generateNewProject:${data.optionTemplates.selectedOption}:${data.optionTemplates.selectedVersion}`,
        chalk().grey
    );

    if (!data.optionTemplates.selectedVersion) {
        return Promise.reject('No template version selected');
    }
    if (!data.files.template.renativeTemplateConfig) {
        return Promise.reject('No renativeTemplateConfig found');
    }
    if (!data.optionTemplates.selectedOption) {
        return Promise.reject('Current template not selected!');
    }

    const c = getContext();
    // const templates: Record<string, { version: string }> = {};

    // if (data.optionTemplates.selectedOption) {
    //     templates[data.optionTemplates.selectedOption] = {
    //         version: data.optionTemplates.selectedVersion,
    //     };
    // }

    // delete data.files.template.renativeTemplateConfig.templateConfig;
    // delete data.files.template.renativeTemplateConfig.bootstrapConfig;

    // const config: ConfigFileProject = {
    //     platforms: {},
    //     ...data.files.template.renativeTemplateConfig,
    //     ...data.renativeTemplateConfigExt,
    //     projectName: data.projectName || 'my-project',
    //     projectVersion: data.inputVersion || '0.1.0',
    //     //TODO: TEMPORARY WORKAROUND this neds to use bootstrap_metadata to work properly
    //     common: {
    //         id: data.inputAppID || 'com.mycompany.myapp',
    //         title: data.inputAppTitle || 'My App',
    //     },
    //     workspaceID: data.optionWorkspaces.selectedOption || 'project description',
    //     // paths: {
    //     //     appConfigsDir: './appConfigs',
    //     //     entryDir: './',
    //     //     platformAssetsDir: './platformAssets',
    //     //     platformBuildsDir: './platformBuilds',
    //     // },
    //     defaults: {
    //         supportedPlatforms: data.optionPlatforms.selectedOptions,
    //     },
    //     engines: {},
    //     templates,
    //     currentTemplate: data.optionTemplates.selectedOption,
    //     isNew: true,
    //     isMonorepo: false,
    // };

    // const platforms: ConfigFileProject['platforms'] = config.platforms || {};
    // // const engines: ConfigFileProject['engines'] = config.engines || {};
    // // const defaults: ConfigFileProject['defaults'] = config.defaults || {};

    // const supPlats = defaults.supportedPlatforms || [];

    // // Remove unused platforms
    // Object.keys(platforms).forEach((k) => {
    //     const key = k as PlatformKey;
    //     if (!supPlats.includes(key)) {
    //         delete platforms[key];
    //     }
    // });

    const supPlats = data.optionPlatforms.selectedOptions || [];

    console.log('SSSSS', supPlats);

    // This is project config override only
    const cnf = data.files.project.renativeConfig;
    cnf.defaults = cnf.defaults || {};
    cnf.defaults.supportedPlatforms = supPlats;
    cnf.engines = cnf.engines || {};

    // This is merged config result
    const loadedConf = c.files.project.config;

    const engines = loadedConf?.engines;
    if (engines) {
        // Remove unused engines based on selected platforms
        supPlats.forEach((k) => {
            const selectedEngineId =
                loadedConf?.platforms?.[k]?.engine ||
                c.files.rnv.projectTemplates.config?.platformTemplates?.[k]?.engine;
            console.log('SSSSS2', k, selectedEngineId);

            if (selectedEngineId) {
                const selectedEngine = findEngineKeyById(selectedEngineId);
                console.log('SSSSS3', k, selectedEngine);
                if (selectedEngine?.key && cnf.engines) {
                    cnf.engines[selectedEngine.key] = engines[selectedEngine.key];
                }
            }
        });
    }

    await saveProgressIntoProjectConfig(data);

    await applyTemplate();
    await configureTemplateFiles();
    await generateLocalJsonSchemas();

    // config.platforms = platforms;
    // config.engines = engines;
    // config.defaults = defaults;

    // writeFileSync(c.paths.project.config, config);

    if (data.gitEnabled) {
        await configureGit();
    }
};

export const telemetryNewProject = async (data: NewProjectData) => {
    try {
        await getApi().analytics.captureEvent({
            type: 'newProject',
            template: data.selectedInputTemplate,
            platforms: data.inputSupportedPlatforms,
        });
    } catch (e) {
        logDebug(e);
    }
};

const findEngineKeyById = (id: string) => {
    const c = getContext();
    const engineTemplates = c.files.rnv.projectTemplates.config?.engineTemplates;
    if (engineTemplates) {
        const etk = Object.keys(engineTemplates);
        for (let i = 0; i < etk.length; i++) {
            const engine = engineTemplates[etk[i]];
            if (engine) {
                if (engine.id === id) {
                    engine.key = etk[i];
                    return engine;
                }
            }
        }
    }
};
