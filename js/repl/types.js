// @flow

export type BabelPresets = Array<string | Array<string | Object>>;
export type BabelPlugins = Array<string>;
export type BabelPlugin = {
  name: string,
  version: string,
};

export type PresetsOptions = {
  decoratorsLegacy: boolean,
  decoratorsBeforeExport: boolean,
  pipelineProposal: "smart" | "minimal" | "fsharp",
  reactRuntime: "classic" | "automatic",
};

export type EnvConfig = {
  browsers: string,
  electron: ?string,
  isBugfixesEnabled: boolean,
  isEnvPresetEnabled: boolean,
  isElectronEnabled: boolean,
  isBuiltInsEnabled: boolean,
  isNodeEnabled: boolean,
  isSpecEnabled: boolean,
  isLooseEnabled: boolean,
  builtIns: string | false,
  corejs: string,
  forceAllTransforms: boolean,
  shippedProposals: boolean,
  version?: any,
  node: ?string,
  assumptions: Object,
};

export type EnvFeatures = {
  [feature: string]: Array<number>,
};

export type LoadScriptCallback = (success: boolean) => void;

export type PluginConfig = {
  baseUrl?: string,
  isPreLoaded?: boolean,
  label: string,
  package: string,
  version?: any,
  instanceName?: string,
  files?: Array<string>,
};

export type MultiPackagesConfig = PluginConfig & {
  packages: Array<PluginConfig>,
};

export type PluginConfigs = Array<PluginConfig>;

export type LazyLoadedState = {
  didError: boolean,
  isLoaded: boolean,
  isLoading: boolean,
  config: Object,
};

export type BabelState = LazyLoadedState & {
  availablePresets: Array<any>,
  build: any,
  errorMessage?: string,
  circleciRepo: string,
  config: PluginConfig,
  version: any,
};

export type EnvState = LazyLoadedState & {
  availablePresets: Array<any>,
  build: number,
  errorMessage?: string,
  circleciRepo: string,
  config: PluginConfig,
  version: any,
  isEnabled: boolean,
};

export type ShippedProposalsState = LazyLoadedState & {
  errorMessage?: string,
  config: MultiPackagesConfig,
  isEnabled: boolean,
};

export type PluginState = LazyLoadedState & {
  config: PluginConfig,
  isEnabled: boolean,
};

export type PluginStateMap = { [name: string]: PluginState };

export type SourceType = "script" | "module" | "unambiguous";

export type CompileConfig = {
  debugEnvPreset: boolean,
  envConfig: ?EnvConfig,
  presetsOptions: PresetsOptions,
  evaluate: boolean,
  presets: BabelPresets,
  plugins: BabelPlugins,
  prettify: boolean,
  sourceMap: boolean,
  sourceType: SourceType,
  getTransitions: boolean,
};

export type ReplState = {
  browsers: string,
  bugfixes: boolean,
  build: string,
  builtIns: string | boolean,
  corejs: ?string,
  spec: boolean,
  loose: boolean,
  circleciRepo: string,
  code: string,
  debug: boolean,
  evaluate: boolean,
  fileSize: boolean,
  timeTravel: boolean,
  sourceType: SourceType,
  forceAllTransforms: boolean,
  shippedProposals: boolean,
  lineWrap: boolean,
  presets: ?string,
  prettier: boolean,
  showSidebar: boolean,
  targets: string,
  version: any,
  decoratorsLegacy: boolean,
  decoratorsBeforeExport: boolean,
  pipelineProposal: "minimal" | "smart" | "fsharp",
  reactRuntime: "classic" | "automatic",
  externalPlugins: ?string,
  assumptions: ?Object,
};

export type SidebarTabSection =
  | "env"
  | "plugins"
  | "presets"
  | "settings"
  | "assumptions";

export type Transition = {
  code: string,
  pluginAlias: string,
  visitorType: string,
  currentNode?: string,
};

export type SupportedFileExtension = ".js" | ".jsx" | ".ts" | ".tsx";
