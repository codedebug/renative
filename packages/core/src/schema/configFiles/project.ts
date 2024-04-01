import { AnyZodObject, z } from 'zod';
import { type RnvCommonSchema, zodCommonSchema } from '../common';
import {
    type RnvTemplateConfigFragment,
    zodExt,
    zodPlatformsKeys,
    zodRuntime,
    zodSupportedPlatforms,
    zodTemplateConfigFragment,
} from '../shared';
import { type RnvPlatformsSchema, zodPlatformsSchema } from '../platforms';
import { type RnvPluginsSchema, zodPluginsSchema } from '../plugins';

const zodRootProjectBaseFragment = z
    .object({
        workspaceID: z
            .string() //TODO: no spaces
            .describe(
                'Workspace ID your project belongs to. This will mach same folder name in the root of your user directory. ie `~/` on macOS'
            ),
        projectVersion: z.string().describe('Version of project'), // TODO: if undefined it should infer from package.json
        projectName: z
            .string()
            .describe(
                'Name of the project which will be used in workspace as folder name. this will also be used as part of the KEY in crypto env var generator'
            ),
        isTemplate: z
            .boolean()
            .describe('Marks project as template. This disables certain user checks like version mismatch etc'),
        defaults: z
            .object({
                ports: z
                    .record(zodPlatformsKeys, z.number()) //TODO maxValue(65535)
                    .describe(
                        'Allows you to assign custom port per each supported platform specific to this project. this is useful if you foten switch between multiple projects and do not want to experience constant port conflicts'
                    ),
                supportedPlatforms: zodSupportedPlatforms,
                portOffset: z.number().describe('Offset each port default value by increment'),
                defaultCommandSchemes: z
                    .record(z.enum(['run', 'export', 'build']), z.string())
                    .describe(
                        'List of default schemes for each rnv command. This is useful if you want to avoid specifying `-s ...` every time your run rnv command. bu default rnv uses `-s debug`. NOTE: you can only use schemes you defined in `buildSchemes`'
                    ),
                targets: z
                    .record(zodPlatformsKeys, z.string())
                    .describe('Override of default targets specific to this project'),
            })
            .partial()
            .describe('Default system config for this project'),
        pipes: z
            .array(z.string())
            .describe(
                'To avoid rnv building `buildHooks/src` every time you can specify which specific pipes should trigger recompile of buildHooks'
            ),
        crypto: z
            .object({
                path: z
                    .string()
                    .describe(
                        'Relative path to encrypted file in your renative project. Example: "./secrets/mySecrets.enc"'
                    ),
                isOptional: z.boolean().describe('Mark if crypto object should not checked every run').optional(),
            })
            .describe(
                'This prop enables automatic encrypt and decrypt of sensitive information in your project. \nRNV will generate new env variable with can be used to encrypt and decrypt. this env var is generated by combining (and sanitizing) 2 properties from your renative.json: \nworkspaceID + projectName.\nThese 2 properties are also used to generate path on your local machine where encrypted files will be decrypted into.'
            ),
        paths: z
            .object({
                appConfigsDir: z.string().describe('Custom path to appConfigs. defaults to `./appConfigs`'),
                platformTemplatesDirs: z
                    .record(zodPlatformsKeys, z.string())
                    .describe(
                        'Custom location of ejected platform templates. this is populated after you run `rnv platform eject`'
                    ),
                appConfigsDirs: z.array(z.string()).describe('Array of custom location app configs directories`'),
                platformAssetsDir: z
                    .string()
                    .describe('Custom path to platformAssets folder. defaults to `./platformAssets`'),
                platformBuildsDir: z
                    .string()
                    .describe('Custom path to platformBuilds folder. defaults to `./platformBuilds`'),
                pluginTemplates: z.record(
                    z.string(),
                    z.object({
                        npm: z.string(),
                        path: z.string(),
                    })
                ).describe(`
        Allows you to define custom plugin template scopes. default scope for all plugins is \`rnv\`.`),
            })
            .partial()
            .describe('Define custom paths for RNV to look into'),
        permissions: z
            .object({
                android: z
                    .record(
                        z.string(),
                        z.object({
                            key: z.string(), //TODO: type this
                            security: z.string(), //TODO: type this
                        })
                    )
                    .describe('Android SDK specific permissions'),
                ios: z
                    .record(
                        z.string(), //TODO: type this
                        z.object({
                            desc: z.string(),
                        })
                    )
                    .describe('iOS SDK specific permissions'),
            })
            .describe(
                'Permission definititions which can be used by app configs via `includedPermissions` and `excludedPermissions` to customize permissions for each app'
            ),
        engines: z.record(z.string(), z.literal('source:rnv')).describe('List of engines available in this project'), // TODO: rename to mods (mods with type engine in the future) ?
        enableHookRebuild: z
            .boolean()
            .describe(
                'If set to true in `./renative.json` build hooks will be compiled at each rnv command run. If set to `false` (default) rebuild will be triggered only if `dist` folder is missing, `-r` has been passed or you run `rnv hooks run` directly making your rnv commands faster'
            ),
        extendsTemplate: z
            .string()
            .describe(
                'You can extend another renative.json file of currently applied template by providing relative or full package name path. Exampe: `@rnv/template-starter/renative.json`'
            ), // TODO: rename to "extendsConfig"
        tasks: z
            .object({
                install: z.object({
                    script: z.string(),
                    platform: z.record(
                        zodPlatformsKeys,
                        z.object({
                            ignore: z.boolean(),
                            ignoreTasks: z.array(z.string()),
                        })
                    ),
                }),
            })
            .describe(
                'Allows to override specific task within renative toolchain. (currently only `install` supported). this is useful if you want to change specific behaviour of built-in task. ie install task triggers yarn/npm install by default. but that might not be desirable installation trigger'
            ),
        integrations: z
            .record(z.string(), z.object({}))
            .describe('Object containing integration configurations where key represents package name'), // TODO: rename to mods
        env: z.record(z.string(), z.any()).describe('Object containing injected env variables'),
        runtime: zodRuntime,
        // DEPRECATED

        isMonorepo: z.boolean().describe('Mark if your project is part of monorepo'), // TODO: remove and use auto detection
        monoRoot: z.string().describe('Define custom path to monorepo root where starting point is project directory'), // TODO: remove and use auto detection
        custom: zodExt, // TODO: find better way to handle
        skipAutoUpdate: z
            .boolean()

            .describe(
                "Enables the equivalent to passing --skipDependencyCheck parameter on every rnv run so you don't have to use it"
            ),

        // REMOVED
        // useTemplate: z.optional(UseTemplate),
        // isNew: z
        // templates: Templates,
        // currentTemplate: CurrentTemplate,
    })
    .partial();
export type RnvRootProjectBaseFragment = z.infer<typeof zodRootProjectBaseFragment> & {
    templateConfig?: RnvTemplateConfigFragment;
};

// NOTE: Need to explictly type this to generic zod object to avoid TS error:
// The inferred type of this node exceeds the maximum length the compiler will serialize...
// This is ok we only use this full schema for runtime validations. actual types
export const zodRootProjectCommonSchema: AnyZodObject = z.object({ common: z.optional(zodCommonSchema) });
export const zodRootProjectPlatformsSchema: AnyZodObject = z.object({ platforms: z.optional(zodPlatformsSchema) });
export const zodRootProjectPluginsSchema: AnyZodObject = z.object({ plugins: z.optional(zodPluginsSchema) });
export const zodRootProjectSchema: AnyZodObject = zodRootProjectBaseFragment
    .merge(zodRootProjectCommonSchema)
    .merge(zodRootProjectPlatformsSchema)
    .merge(zodRootProjectPluginsSchema)
    .extend({ templateConfig: zodTemplateConfigFragment })
    .partial();

export type RnvRootProjectSchema = RnvRootProjectBaseFragment & {
    common?: RnvCommonSchema;
    platforms?: RnvPlatformsSchema;
    plugins?: RnvPluginsSchema;
};
// renative.json
export type ConfigFileProject = RnvRootProjectSchema;

export type ConfigProjectPaths = Required<RnvRootProjectBaseFragment>['paths'];
