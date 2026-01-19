---
project_name: 'Lincoln'
user_name: 'Erik'
date: '2026-01-19'
sections_completed: ['technology_stack']
existing_patterns_found: 5
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

**Core Technologies:**
- TypeScript 5.9.3 (strict mode enabled)
- ink 6.6.0 (React 19.2.3)
- chokidar 5.0.0
- Node.js ES2020
- Jest 30.2.0 + ts-jest 29.4.6

**Required Dependencies:**
- js-yaml (YAML config parsing)
- date-fns (timestamp formatting)

**Version Constraints:**
- ink 6.6.0 requires React 19.2.3+
- chokidar 5.0.0 has no breaking changes from 4.x
- TypeScript strict mode MUST remain enabled (no `any`, no implicit any)
- ESNext modules (.js extension for imports)
- ES2020 target for maximum compatibility

## Critical Implementation Rules

_Documented after discovery phase_
