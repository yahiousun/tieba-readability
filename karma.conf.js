module.exports = function(config) {
  config.set({
    frameworks: ['jasmine', 'karma-typescript'],
    files: [
      { pattern: 'test/**/*.ts' },
      { pattern: 'src/**/*.ts' },
      { pattern: 'test/*.html', watched: true, included: false, served: true, nocache: false}
    ],
    preprocessors: {
      '**/*.ts': ['karma-typescript']
    },
    karmaTypescriptConfig: {
      compilerOptions: {
        sourceMap: true,
        moduleResolution: 'node',
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
        allowJs: true,
        lib: ['es2017', 'dom']
      }
    },
    reporters: ['dots', 'karma-typescript'],
    browsers: ['Chrome_without_security'],
    customLaunchers: {
      Chrome_without_security: {
        base: 'Chrome',
        flags: ['--disable-web-security']
      }
    }
  });
};