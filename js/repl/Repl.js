// @flow

import "regenerator-runtime/runtime";

import { cx, css } from "emotion";
import debounce from "lodash.debounce";
import React from "react";
import { prettySize } from "./Utils";
import ErrorBoundary from "./ErrorBoundary";
import CodeMirrorPanel from "./CodeMirrorPanel";
import ReplOptions from "./ReplOptions";
import StorageService from "./StorageService";
import UriUtils from "./UriUtils";
import loadBundle from "./loadBundle";
import loadPlugin from "./loadPlugin";
import PresetLoadingAnimation from "./PresetLoadingAnimation";
import TimeTravelSlider from "./TimeTravelSlider";
import {
  babelConfig,
  envPresetConfig,
  shippedProposalsConfig,
  pluginConfigs,
  runtimePolyfillConfig,
} from "./PluginConfig";
import {
  envConfigToTargetsString,
  replState,
  configArrayToStateMap,
  configToState,
  persistedStateToBabelState,
  persistedStateToEnvState,
  persistedStateToEnvConfig,
  persistedStateToPresetsOptions,
  persistedStateToShippedProposalsState,
  persistedStateToExternalPluginsState,
} from "./replUtils";
import WorkerApi from "./WorkerApi";
import scopedEval from "./scopedEval";
import { colors, media } from "./styles";

import type {
  BabelPresets,
  BabelState,
  BabelPlugin,
  EnvState,
  ShippedProposalsState,
  EnvConfig,
  PresetsOptions,
  PluginState,
  PluginStateMap,
  SourceType,
} from "./types";

type Props = {};
type State = {
  babel: BabelState,
  code: string,
  compiled: ?string,
  compileErrorMessage: ?string,
  debugEnvPreset: boolean,
  envConfig: EnvConfig,
  envPresetDebugInfo: ?string,
  envPresetState: EnvState,
  shippedProposalsState: ShippedProposalsState,
  presetsOptions: PresetsOptions,
  evalErrorMessage: ?string,
  fileSize: boolean,
  timeTravel: boolean,
  sourceType: SourceType,
  isSidebarExpanded: boolean,
  lineWrap: boolean,
  meta: Object,
  plugins: PluginStateMap,
  presets: PluginStateMap,
  runtimePolyfillState: PluginState,
  sourceMap: ?string,
  externalPlugins: Array<BabelPlugin>,
  pluginSearch: ?string,
  showOfficialExternalPlugins: boolean,
  loadingExternalPlugins: boolean,
  transitions: Array<Object>,
  currentTransition: Object,
};

const DEBOUNCE_DELAY = 500;

function toCamelCase(str) {
  return str
    .replace(/-/g, " ")
    .replace(/\//g, "_")
    .replace(/@/g, "_")
    .replace(/\s(.)/g, function($1) {
      return $1.toUpperCase();
    })
    .replace(/\s/g, "")
    .replace(/^(.)/, function($1) {
      return $1.toLowerCase();
    });
}

class Repl extends React.Component<Props, State> {
  _numLoadingPlugins = 0;
  _workerApi = new WorkerApi();

  constructor(props: Props, context: any) {
    super(props, context);

    const persistedState = replState();
    const defaultPlugins = {
      "babili-standalone": persistedState.babili,
      prettier: persistedState.prettier,
    };

    const presets = persistedState.presets
      ? persistedState.presets.split(",")
      : [];

    const defaultPresets = presets.reduce((reduced, key) => {
      if (key) reduced[key] = true;
      return reduced;
    }, {});

    const presetsOptions = persistedStateToPresetsOptions(persistedState);
    const envConfig = persistedStateToEnvConfig(persistedState);
    // const isPresetsTabExpanded = !!presets.filter(preset => preset !== "env")
    //   .length;

    // A partial State is defined first b'c this._compile needs it.
    // The compile helper will then populate the missing State values.
    this.state = {
      babel: persistedStateToBabelState(persistedState, babelConfig),
      code: persistedState.code,
      compiled: null,
      pluginSearch: "",
      compileErrorMessage: null,
      debugEnvPreset: persistedState.debug,
      presetsOptions,
      envConfig,
      envPresetDebugInfo: null,
      envPresetState: persistedStateToEnvState(
        persistedState,
        envPresetConfig,
        envConfig.isEnvPresetEnabled
      ),
      shippedProposalsState: persistedStateToShippedProposalsState(
        persistedState,
        shippedProposalsConfig,
        envConfig.isEnvPresetEnabled && envConfig.shippedProposals
      ),
      evalErrorMessage: null,
      fileSize: persistedState.fileSize,
      timeTravel: persistedState.timeTravel,
      sourceType: persistedState.sourceType,
      isSidebarExpanded: persistedState.showSidebar,
      lineWrap: persistedState.lineWrap,
      meta: {
        compiledSize: 0,
        rawSize: 0,
      },
      plugins: configArrayToStateMap(pluginConfigs, defaultPlugins),
      // Filled in after Babel is loaded
      presets: {},
      runtimePolyfillState: configToState(
        runtimePolyfillConfig,
        persistedState.evaluate
      ),
      sourceMap: null,
      showOfficialExternalPlugins: false,
      externalPlugins: persistedStateToExternalPluginsState(persistedState),
      loadingExternalPlugins: false,
      transitions: [],
      currentTransition: {},
    };
    this._setupBabel(defaultPresets);
  }

  render() {
    const state = this.state;

    if (!state.babel.isLoaded) {
      let message = "Loading Babel...";

      if (state.babel.didError) {
        message =
          state.babel.errorMessage ||
          "An error occurred while loading Babel :(";
      }

      return (
        <div className={styles.loader}>
          <div className={styles.loaderContent}>
            {message}
            {state.babel.isLoading && (
              <PresetLoadingAnimation className={styles.loadingAnimation} />
            )}
          </div>
        </div>
      );
    }

    const options = {
      fileSize: state.fileSize,
      lineWrapping: state.lineWrap,
    };
    return (
      <div className={styles.repl}>
        <ReplOptions
          babelVersion={state.babel.version}
          className={styles.optionsColumn}
          debugEnvPreset={state.debugEnvPreset}
          envConfig={state.envConfig}
          envPresetState={state.envPresetState}
          shippedProposalsState={state.shippedProposalsState}
          presetsOptions={state.presetsOptions}
          fileSize={state.fileSize}
          timeTravel={state.timeTravel}
          sourceType={state.sourceType}
          isExpanded={state.isSidebarExpanded}
          lineWrap={state.lineWrap}
          onPresetOptionChange={this._onOptionChange("presetsOptions")}
          onEnvPresetSettingChange={this._onOptionChange("envConfig")}
          onExternalPluginRemove={this.handleRemoveExternalPlugin}
          onIsExpandedChange={this._onIsSidebarExpandedChange}
          onSettingChange={this._onSettingChange}
          pluginState={state.plugins}
          presetState={state.presets}
          runtimePolyfillConfig={runtimePolyfillConfig}
          runtimePolyfillState={state.runtimePolyfillState}
          externalPlugins={state.externalPlugins}
          pluginsLoading={true}
          pluginChange={this._pluginChange}
          pluginSearch={this._pluginSearch}
          pluginValue={state.pluginSearch}
          showOfficialExternalPluginsChanged={
            this._showOfficialExternalPluginsChanged
          }
          showOfficialExternalPlugins={state.showOfficialExternalPlugins}
          loadingExternalPlugins={state.loadingExternalPlugins}
        />
        <div className={styles.wrapperPanels}>
          <div
            className={cx(styles.panels, !state.timeTravel && styles.panelsMax)}
          >
            <CodeMirrorPanel
              className={styles.codeMirrorPanel}
              code={state.code}
              errorMessage={state.compileErrorMessage}
              fileSize={state.meta.rawSize}
              onChange={this._updateCode}
              options={options}
              placeholder="Write code here"
            />
            <CodeMirrorPanel
              className={styles.codeMirrorPanel}
              code={state.compiled}
              errorMessage={state.evalErrorMessage}
              fileSize={state.meta.compiledSize}
              info={state.debugEnvPreset ? state.envPresetDebugInfo : null}
              options={options}
              placeholder="Compiled output will be shown here"
            />
          </div>
          {state.timeTravel && (
            <TimeTravelSlider
              className={styles.sliders}
              currentTransition={state.currentTransition}
              transitions={state.transitions}
              selectTransition={this.selectTransition}
            />
          )}
        </div>
      </div>
    );
  }

  async _setupBabel(defaultPresets) {
    const babelState = await loadBundle(this.state.babel, this._workerApi);
    await this._loadInitialExternalPlugins();
    const { envPresetState } = this.state;

    this.setState({
      babel: babelState,
      presets: configArrayToStateMap(
        babelState.availablePresets,
        defaultPresets
      ),
    });
    if (babelState.isLoaded) {
      if (!envPresetState.isLoading) {
        return this._compile(this.state.code, this._checkForUnloadedPlugins);
      }
      this._checkForUnloadedPlugins();
    }
  }

  async _checkForUnloadedPlugins() {
    const {
      envConfig,
      envPresetState,
      shippedProposalsState,
      plugins,
      runtimePolyfillState,
    } = this.state;
    // Assume all default presets are baked into @babel/standalone.
    // We really only need to worry about plugins.
    for (const key in plugins) {
      const plugin = plugins[key];

      if (plugin.isEnabled && !plugin.isLoaded && !plugin.isLoading) {
        this._numLoadingPlugins++;
        this._workerApi.loadPlugin(plugin).then(success => {
          this._numLoadingPlugins--;

          // If a plugin has failed to load, re-render to show a loading error.
          if (!success) {
            this.setState({ plugins });
          }

          // Once all plugins have been loaded, re-compile code.
          if (this._numLoadingPlugins === 0) {
            this._updateCode(this.state.code);
          }
        });
      }
    }

    // Babel (runtime) polyfill is large;
    // It's only needed if we're actually executing the compiled code.
    // Defer loading it unless "evaluate" is enabled.
    if (runtimePolyfillState.isEnabled && !runtimePolyfillState.isLoaded) {
      // Compilation is done in a web worker for performance reasons,
      // But eval requires the UI thread so code can access globals like window.
      // Because of this, the runtime polyfill must be loaded on the UI thread.
      // We also eval in an iframe so the polyfills need to be accessible there.
      // We could copy them from window to frame.contentWindow,
      // But it's less error-prone to just load the polyfills into the iframe.
      loadPlugin(
        runtimePolyfillState,
        () => {
          let evalErrorMessage: ?string = null;

          if (!this.state.compiled) {
            return;
          }

          // No need to recompile at this point;
          // Just evaluate the most recently compiled code.
          try {
            // eslint-disable-next-line
            scopedEval.execute(this.state.compiled, this.state.sourceMap);
          } catch (error) {
            evalErrorMessage = error.message;
          }

          // Re-render (even if no error) to update the label loading-state.
          this.setState({ evalErrorMessage });
        },
        scopedEval.getIframe()
      );
    }

    // Babel 'env' preset is large;
    // Only load it if it's been requested.
    if (envConfig.isEnvPresetEnabled && !envPresetState.isLoaded) {
      envPresetState.isLoading = true;
      loadBundle(envPresetState, this._workerApi).then(() => {
        // This preset is not built into Babel standalone due to its size.
        // Before we can use it we need to explicitly register it.
        // Because it's loaded in a worker, we need to configure it there as well.
        this._workerApi
          .registerEnvPreset()
          .then(() => this._updateCode(this.state.code));
      });
    }
    if (
      envConfig.isEnvPresetEnabled &&
      envConfig.shippedProposals &&
      !shippedProposalsState.isLoaded
    ) {
      const availablePlugins = await this._workerApi.getAvailablePlugins();
      const availablePluginsNames = availablePlugins.map(({ label }) => label);
      const notRegisteredPackages = shippedProposalsState.config.packages
        .filter(
          packageState => !availablePluginsNames.includes(packageState.label)
        )
        .map(config =>
          configToState({ ...config, version: this.state.babel.version }, true)
        );

      if (notRegisteredPackages.length) {
        shippedProposalsState.isLoading = true;
        const plugins = await Promise.all(
          notRegisteredPackages.map(state => loadBundle(state, this._workerApi))
        );
        const allPluginsAreLoaded = plugins.every(({ isLoaded }) => isLoaded);
        if (allPluginsAreLoaded) {
          await this._workerApi.registerPlugins(
            plugins.map(({ config }) => ({
              instanceName: config.instanceName,
              pluginName: config.label,
            }))
          );
          shippedProposalsState.isLoaded = true;
          this._updateCode(this.state.code);
        } else {
          shippedProposalsState.didError = true;
        }
        shippedProposalsState.isLoading = false;
      }
    }
  }

  _loadInitialExternalPlugins = () => {
    return Promise.all(
      this.state.externalPlugins.map(plugin =>
        this._loadExternalPlugin(plugin).catch()
      )
    );
  };

  _loadExternalPlugin = (plugin: BabelPlugin) => {
    const bundledUrl = `https://bundle.run/${plugin.name}@${plugin.version}`;
    return this._workerApi.loadExternalPlugin(bundledUrl).then(loaded => {
      if (loaded === false) {
        this.setState({
          compileErrorMessage: `Plugin ${plugin.name} could not be loaded`,
        });
        return Promise.reject();
      }
      return this._workerApi.registerPlugins([
        {
          instanceName: toCamelCase(plugin.name),
          pluginName: plugin.name,
        },
      ]);
    });
  };

  _pluginSearch = value =>
    this.setState({
      pluginSearch: value,
    });

  _pluginChange = plugin => {
    const pluginExists =
      this.state.externalPlugins.findIndex(
        externalPlugin => externalPlugin.name === plugin.name
      ) > -1;

    if (!pluginExists) {
      this.setState({ loadingExternalPlugins: true });

      this._loadExternalPlugin(plugin)
        .then(() => {
          this.setState(
            state => ({
              externalPlugins: [...state.externalPlugins, plugin],
            }),
            this._pluginsUpdatedSetStateCallback
          );
        })
        .finally(() => {
          this.setState({
            loadingExternalPlugins: false,
          });
        });
    } else {
      this.handleRemoveExternalPlugin(plugin.name);
    }
  };

  _showOfficialExternalPluginsChanged = () =>
    this.setState(state => ({
      showOfficialExternalPlugins: !state.showOfficialExternalPlugins,
    }));

  _compile = (code: string, setStateCallback: () => mixed) => {
    const { state } = this;
    const { runtimePolyfillState } = state;

    const presetsArray = this._presetsToArray(state);

    const babili = state.plugins["babili-standalone"];
    if (babili.isEnabled && babili.isLoaded) {
      presetsArray.push("babili");
    }
    this._workerApi
      .compile(code, {
        plugins: state.externalPlugins.map(plugin => plugin.name),
        debugEnvPreset: state.debugEnvPreset,
        envConfig: state.envPresetState.isLoaded ? state.envConfig : null,
        presetsOptions: state.presetsOptions,
        evaluate:
          runtimePolyfillState.isEnabled && runtimePolyfillState.isLoaded,
        presets: presetsArray,
        prettify: state.plugins.prettier.isEnabled,
        sourceMap: runtimePolyfillState.isEnabled,
        sourceType: state.sourceType,
        getTransitions: state.timeTravel,
      })
      .then(result => {
        result.meta.compiledSize = prettySize(result.meta.compiledSize);
        result.meta.rawSize = prettySize(result.meta.rawSize);
        this.setState(result, setStateCallback);
      });
  };

  // Debounce compilation since it's expensive.
  // This also avoids prematurely warning the user about invalid syntax,
  // eg when in the middle of typing a variable name.
  _compileToState = debounce(
    (code: string) => this._compile(code, this._persistState),
    DEBOUNCE_DELAY
  );

  _onOptionChange = (kind: "envConfig" | "presetsOptions") => (
    name: string,
    value: any
  ) => {
    this.setState(
      state => ({
        [kind]: {
          ...state[kind],
          [name]: value,
        },
      }),
      this._pluginsUpdatedSetStateCallback
    );
  };

  _onIsSidebarExpandedChange = (isExpanded: boolean) => {
    this.setState(
      {
        isSidebarExpanded: isExpanded,
      },
      this._persistState
    );
  };

  _onSettingChange = (name: string, value: boolean | string) => {
    this.setState(state => {
      const { plugins, presets, runtimePolyfillState } = state;

      if (name === "@babel/polyfill") {
        runtimePolyfillState.isEnabled = !!value;

        return {
          runtimePolyfillState,
        };
      } else if (/^stage-[0-3]$/.test(name)) {
        const changedStage = Number(name.slice(-1));
        const stage = value ? changedStage : changedStage + 1;
        for (let i = 0; i <= 3; i++) {
          presets[`stage-${i}`].isEnabled = stage <= i;
        }
        return { presets };
      } else if (state.hasOwnProperty(name)) {
        return {
          [name]: value,
        };
      } else if (plugins.hasOwnProperty(name)) {
        plugins[name].isEnabled = !!value;

        return {
          plugins,
        };
      } else if (presets.hasOwnProperty(name)) {
        presets[name].isEnabled = !!value;

        return {
          presets,
        };
      }
    }, this._pluginsUpdatedSetStateCallback);
  };

  _persistState = () => {
    const { state } = this;
    const { envConfig, plugins } = state;

    const presetsArray = this._presetsToArray();

    const babili = state.plugins["babili-standalone"];
    if (babili.isEnabled) {
      presetsArray.push("babili");
    }

    if (envConfig.isEnvPresetEnabled) {
      presetsArray.push("env");
    }

    const builtIns = envConfig.isBuiltInsEnabled && envConfig.builtIns;

    const payload = {
      babili: plugins["babili-standalone"].isEnabled,
      browsers: envConfig.browsers,
      build: state.babel.build,
      builtIns: builtIns,
      spec: envConfig.isSpecEnabled,
      loose: envConfig.isLooseEnabled,
      circleciRepo: state.babel.circleciRepo,
      code: state.code,
      debug: state.debugEnvPreset,
      forceAllTransforms: envConfig.forceAllTransforms,
      shippedProposals: envConfig.shippedProposals,
      evaluate: state.runtimePolyfillState.isEnabled,
      fileSize: state.fileSize,
      timeTravel: state.timeTravel,
      sourceType: state.sourceType,
      lineWrap: state.lineWrap,
      presets: presetsArray.join(","),
      prettier: plugins.prettier.isEnabled,
      showSidebar: state.isSidebarExpanded,
      targets: envConfigToTargetsString(envConfig),
      version: state.babel.version,
      decoratorsLegacy: state.presetsOptions.decoratorsLegacy,
      decoratorsBeforeExport: state.presetsOptions.decoratorsBeforeExport,
      pipelineProposal: state.presetsOptions.pipelineProposal,
      externalPlugins: state.externalPlugins
        .map(plugin => `${plugin.name}@${plugin.version}`)
        .join(","),
    };
    StorageService.set("replState", payload);
    UriUtils.updateQuery(payload);
  };

  _pluginsUpdatedSetStateCallback = () => {
    this._checkForUnloadedPlugins();
    this._updateCode(this.state.code);
  };

  _presetsToArray(state: State = this.state): BabelPresets {
    const { presets } = state;

    return Object.keys(presets)
      .filter(key => presets[key].isEnabled && presets[key].isLoaded)
      .map(key => presets[key].config.label);
  }

  _updateCode = (code: string) => {
    this.setState({ code });
    // Update state with compiled code, errors, etc after a small delay.
    // This prevents frequent updates while a user is typing.
    this._compileToState(code);
  };

  selectTransition = (transition: Object) => () => {
    const transitionSize = prettySize(transition.size);
    this.setState(prevState => ({
      ...prevState,
      currentTransition: transition,
      compiled: transition.code,
      meta: {
        compiledSize: transitionSize,
        rawSize: this.state.meta.rawSize,
      },
    }));
  };

  handleRemoveExternalPlugin = (pluginName: string) => {
    this.setState(
      state => ({
        externalPlugins: state.externalPlugins.filter(
          p => p.name !== pluginName
        ),
      }),
      this._pluginsUpdatedSetStateCallback
    );
  };
}

export default function ReplWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <Repl />
    </ErrorBoundary>
  );
}

const styles = {
  loader: css({
    alignItems: "center",
    background: colors.inverseBackgroundDark,
    color: colors.inverseForegroundLight,
    display: "flex",
    height: "100vh",
    justifyContent: "center",
  }),
  loadingAnimation: css({
    justifyContent: "center",
    margin: "2rem 0 0 0",
  }),
  loaderContent: css({
    margin: "auto",
    textAlign: "center",
  }),
  codeMirrorPanel: css({
    flex: "0 0 50%",
  }),
  optionsColumn: css({
    flex: "0 0 auto",
  }),
  repl: css`
    height: 100%;
    height: calc(100vh - 50px); /* 50px is the header's height */
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: stretch;
    overflow: auto;
    font-size: 0.875rem;
    ${media.mediumAndDown} {
      flex-direction: column;
    }
  `,
  wrapperPanels: css({
    height: "100%",
    width: "100%",
    justifyContent: "stretch",
    overflow: "hidden",
  }),
  panels: css({
    height: "85%",
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "stretch",
    overflow: "auto",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  }),
  panelsMax: css({
    height: "100% !important",
  }),
  sliders: css({
    height: "20%",
    margin: 0,
  }),
};
