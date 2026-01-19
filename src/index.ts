#!/usr/bin/env node

import React from 'react';
import { render } from 'ink';
import { App } from './App.js';

// Check if stdin supports raw mode (needed for keyboard input)
const isRawModeSupported = process.stdin.isTTY && typeof process.stdin.setRawMode === 'function';

if (!isRawModeSupported) {
  console.log('\n⚠️  Warning: Interactive mode not available in this environment.');
  console.log('   The monitor will display activity but keyboard controls will not work.');
  console.log('   To use interactive features, run this in a proper terminal (not redirected).\n');
}

// Start the application
render(React.createElement(App));
