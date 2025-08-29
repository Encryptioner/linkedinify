# Initial Setup

## Instruction List 1

### Instructions
1. Ensure the project runs. I am creating a project that supports markdown to linekdin post. Ensure the project is scalable and maintainable

### Comments
1. Had to check


## Instruction List 2

### Instructions
1. I've added initial idea @ai-instructions/task-0-initial-idea-by-claude-ai.md and ai assitant response. I want a full production level maintainable scalable code with latest coding standard and practice. And that should be able to deploy using github pages

### Comments
1. Had to check


## Instruction List 3

## Instructions
1. Use `pnpm` for the project. Add that in readme
2. Getting below error when running the `pnpm dev` command
```bash
1:25:30 PM [vite] Internal server error: Failed to resolve import "./modules/preview-manager.js" from "src/js/app.js". Does the file exist?
  Plugin: vite:import-analysis
  File: /Users/ankur/Projects/side-projects/linkedinify/src/js/app.js:10:33
  8  |  import { Config } from './config/app-config.js';
  9  |  import { ThemeManager } from './modules/theme-manager.js';
  10 |  import { PreviewManager } from './modules/preview-manager.js';
     |                                  ^
  11 |  import { HistoryManager } from './modules/history-manager.js';
  12 |  import { ContentConverter } from './modules/content-converter.js';
      at formatError (file:///Users/ankur/Projects/side-projects/linkedinify/node_modules/.pnpm/vite@4.5.14_@types+node@24.3.0_terser@5.43.1/node_modules/vite/dist/node/chunks/dep-827b23df.js:44066:46)
      at TransformContext.error (file:///Users/a
```
1. Ensure the project runs ok
2. There is multiple `index` file. There should be one.
3. Update the codebase wherever necessary. Remove unnecessary files
4. Keep one readme file. If more information need to be kept for documentation purpose, create `docs` directory in root directory and add necessary documentation there.
5. Add guideline on how to build the project for deployment in github pages