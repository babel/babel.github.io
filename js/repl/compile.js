// @flow

// Globals pre-loaded by Worker
declare var Babel: any;
declare var prettier: any;
declare var prettierPlugins: any;

import Transitions from "./Transitions";
import type { CompileConfig, Transition } from "./types";

type Return = {
  compiled: ?string,
  compileErrorMessage: ?string,
  envPresetDebugInfo: ?string,
  meta: {
    compiledSize: number,
    rawSize: number,
  },
  sourceMap: ?string,
  transitions: Array<Transition>,
};

const DEFAULT_PRETTIER_CONFIG = {
  bracketSpacing: true,
  jsxBracketSameLine: false,
  parser: "babylon",
  printWidth: 80,
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "none",
  useTabs: false,
};

const isStagePreset = n => typeof n === "string" && /^stage-[0-3]$/.test(n);

export default function compile(code: string, config: CompileConfig): Return {
  const { envConfig, presetsOptions } = config;

  let compiled = null;
  let compileErrorMessage = null;
  let envPresetDebugInfo = null;
  let sourceMap = null;
  let useBuiltIns = false;
  let spec = false;
  let loose = false;
  const transitions = new Transitions();
  const meta = {
    compiledSize: 0,
    rawSize: new Blob([code], { type: "text/plain" }).size,
  };

  if (envConfig && envConfig.isEnvPresetEnabled) {
    const targets = {};
    const { forceAllTransforms, shippedProposals } = envConfig;

    if (envConfig.browsers) {
      targets.browsers = envConfig.browsers
        .split(",")
        .map(value => value.trim())
        .filter(value => value);
    }
    if (envConfig.isElectronEnabled) {
      targets.electron = envConfig.electron;
    }
    if (envConfig.isBuiltInsEnabled) {
      useBuiltIns = !config.evaluate && envConfig.builtIns;
    }
    if (envConfig.isNodeEnabled) {
      targets.node = envConfig.node;
    }
    if (envConfig.isSpecEnabled) {
      spec = envConfig.isSpecEnabled;
    }
    if (envConfig.isLooseEnabled) {
      loose = envConfig.isLooseEnabled;
    }

    const options: { [string]: any } = {
      targets,
      forceAllTransforms,
      shippedProposals,
      useBuiltIns,
      spec,
      loose,
    };

    config.presets.push(["env", options]);
  }

  const actualPresets = config.presets.filter(n => !isStagePreset(n));
  const stages = config.presets
    .filter(isStagePreset)
    .map(name => Number(name.slice(-1)))
    .sort();

  if (stages.length) {
    const stage = stages[0];
    const options = {};
    const useOption = name => (options[name] = presetsOptions[name]);

    switch (stage) {
      case 0:
      case 1:
        useOption("pipelineProposal");
      case 2:
        useOption("decoratorsLegacy");
        if (!options.decoratorsLegacy) useOption("decoratorsBeforeExport");
      case 3:
    }

    actualPresets.push([`stage-${stage}`, options]);
  }

  console.log("PRESETS", actualPresets);

  try {
    const babelConfig = {
      babelrc: false,
      filename: "repl",
      sourceMap: config.sourceMap,

      presets: actualPresets,
      plugins: config.plugins,
      sourceType: config.sourceType,
      wrapPluginVisitorMethod: config.getTransitions
        ? transitions.wrapPluginVisitorMethod
        : undefined,
    };

    const transformed = Babel.transform(code, babelConfig);
    compiled = transformed.code;

    if (config.getTransitions) {
      transitions.addExitTransition(compiled);
    }

    if (config.sourceMap) {
      try {
        sourceMap = JSON.stringify(transformed.map);
      } catch (error) {
        console.error(`Source Map generation failed: ${error}`);
      }
    }

    if (
      config.prettify &&
      typeof prettier !== "undefined" &&
      typeof prettierPlugins !== "undefined"
    ) {
      // TODO Don't re-parse; just pass Prettier the AST we already have.
      // This will have to wait until we've updated to Babel 7 since Prettier uses it.
      // Prettier doesn't handle ASTs from Babel 6.
      // if (
      //   prettier.__debug !== undefined &&
      //   typeof prettier.__debug.formatAST === 'function'
      // ) {
      //   compiled = prettier.__debug.formatAST(transformed.ast, DEFAULT_PRETTIER_CONFIG);
      // } else {
      compiled = prettier.format(compiled, {
        ...DEFAULT_PRETTIER_CONFIG,
        plugins: prettierPlugins,
      });
      // }
    }
    meta.compiledSize = new Blob([compiled], { type: "text/plain" }).size;
  } catch (error) {
    compiled = null;
    compileErrorMessage = error.message;
    envPresetDebugInfo = null;
    sourceMap = null;
  }

  return {
    compiled,
    compileErrorMessage,
    envPresetDebugInfo,
    meta,
    sourceMap,
    transitions: transitions.getValue(),
  };
}
