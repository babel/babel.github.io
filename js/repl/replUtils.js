// @flow

import { envPresetDefaults, replDefaults } from "./PluginConfig";
import StorageService from "./StorageService";
import UriUtils from "./UriUtils";

import type {
  BabelState,
  BabelPlugin,
  EnvState,
  EnvConfig,
  PresetsOptions,
  ReplState,
  MultiPackagesConfig,
  PluginConfig,
  PluginConfigs,
  PluginState,
  PluginStateMap,
  ShippedProposalsState,
} from "./types";

export const envConfigToTargetsString = (envConfig: EnvConfig): string => {
  const components = [];

  if (envConfig.isElectronEnabled && envConfig.electron) {
    components.push(`Electron-${envConfig.electron}`);
  }

  if (envConfig.isNodeEnabled && envConfig.node) {
    components.push(`Node-${envConfig.node}`);
  }

  return encodeURIComponent(components.join(","));
};

//  Repl state stored in Local storage
const loadPersistedState = (): ReplState => {
  const storageState = StorageService.get("replState");
  return {
    ...replDefaults,
    ...storageState,
    // HACK: We don't want to load the Babel version from the
    // localStorage, otherwise users will use an old version
    // unless they manually "update" it explicitly loading a
    // new one via https://babeljs.io/repl/version/7.3.0
    version: "",
  };
};

//  Repl state in query string
const urlState = (): ReplState => {
  const queryState = UriUtils.parseQuery();
  return { ...replDefaults, ...queryState };
};

export const replState = (): ReplState => {
  const hasQueryString = window.location.hash;
  return hasQueryString ? urlState() : loadPersistedState();
};

type DefaultPlugins = { [name: string]: boolean };

export const persistedStateToBabelState = (
  persistedState: ReplState,
  config: PluginConfig
): BabelState => ({
  availablePresets: [],
  build: persistedState.build,
  circleciRepo: persistedState.circleciRepo,
  didError: false,
  isLoaded: false,
  isLoading: true,
  version: persistedState.version,
  config,
});

export const persistedStateToEnvState = (
  persistedState: ReplState,
  config: PluginConfig,
  isEnabled: boolean
): EnvState => {
  return {
    ...persistedStateToBabelState(persistedState, config),
    isLoading: isEnabled,
    isEnabled,
  };
};

export const persistedStateToShippedProposalsState = (
  persistedState: ReplState,
  config: MultiPackagesConfig,
  isEnabled: boolean
): ShippedProposalsState => ({
  config,
  isLoading: false,
  isLoaded: false,
  didError: false,
  isEnabled,
});

export const configArrayToStateMap = (
  pluginConfigs: PluginConfigs,
  defaults: DefaultPlugins = {}
): PluginStateMap =>
  pluginConfigs.reduce((reduced, config) => {
    reduced[config.package || config.label] = configToState(
      config,
      defaults[config.package || config.label] === true
    );
    return reduced;
  }, {});

export const configToState = (
  config: PluginConfig,
  isEnabled: boolean = false
): PluginState => ({
  config,
  didError: false,
  isEnabled,
  isLoaded: config.isPreLoaded === true,
  isLoading: false,
  plugin: null,
});

export const persistedStateToPresetsOptions = (
  persistedState: ReplState
): PresetsOptions => {
  return {
    decoratorsLegacy: !!persistedState.decoratorsLegacy,
    decoratorsBeforeExport:
      !persistedState.decoratorsLegacy &&
      !!persistedState.decoratorsBeforeExport,
    pipelineProposal: persistedState.pipelineProposal || "minimal",
    reactRuntime: persistedState.reactRuntime || "classic",
  };
};

export const persistedStateToEnvConfig = (
  persistedState: ReplState
): EnvConfig => {
  const isEnvPresetEnabled =
    !!persistedState.presets &&
    persistedState.presets.split(",").indexOf("env") >= 0;

  const envConfig: EnvConfig = {
    browsers: persistedState.browsers,
    electron: persistedState.electron ?? envPresetDefaults.electron.default,
    isEnvPresetEnabled,
    isElectronEnabled: false,
    isNodeEnabled: false,
    forceAllTransforms: !!persistedState.forceAllTransforms,
    shippedProposals: !!persistedState.shippedProposals,
    isBuiltInsEnabled: !!persistedState.builtIns,
    isSpecEnabled: !!persistedState.spec,
    isLooseEnabled: !!persistedState.loose,
    isBugfixesEnabled: !!persistedState.bugfixes,
    node: envPresetDefaults.node.default,
    version: persistedState.version,
    builtIns: persistedState.builtIns ?? envPresetDefaults.builtIns.default,
    corejs: persistedState.corejs ?? envPresetDefaults.corejs.default,
  };
  let parsedAssumptions = {};
  try {
    parsedAssumptions = persistedState.assumptions
      ? JSON.parse(decodeURIComponent(persistedState.assumptions))
      : {};
  } catch (err) {
    console.error("Error parsing assumptions", err);
  }
  envConfig.assumptions = parsedAssumptions;
  decodeURIComponent(persistedState.targets)
    .split(",")
    .forEach(component => {
      try {
        const pieces = component.split("-");

        const name = pieces[0].toLowerCase();
        const value = pieces[1];

        if (name) {
          switch (name) {
            case "electron":
              envConfig.electron = value;
              envConfig.isElectronEnabled = true;
              break;
            case "node":
              envConfig.node = value;
              envConfig.isNodeEnabled = true;
              break;
            default:
              console.warn(`Unknown env target "${name}" specified`);
              break;
          }
        }
      } catch (error) {
        console.error("Error parsing env preset configuration", error);
      }
    });

  return envConfig;
};

export const persistedStateToExternalPluginsState = (
  persistedState: ReplState
): Array<BabelPlugin> => {
  const { externalPlugins } = persistedState;
  if (!externalPlugins) {
    return [];
  }
  return externalPlugins.split(",").map(plugin => {
    const separator = plugin.lastIndexOf("@");
    const name = plugin.slice(0, separator);
    const version = plugin.slice(separator + 1);
    return { name, version };
  });
};
