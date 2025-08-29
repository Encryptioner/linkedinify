# Instructions for Initial Setup by Claude Code

## General Rules
1. Write or update the summary of your updates in `ai-summaries/task-1-initial-setup.md` file when all the commanded tasks/instructions are done. Keep it short. You may update it in chronological way by step 1, step 2 and so on. It should reflect the continuos changes done on the codebase.



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

### Comments
1. A working version where UI is somehow ok. However, it doesn't work as expected


## Instruction List 4

### Instructions
1. It seems that, the linked in post is not showing as expected. I've checked earlier versions of code in `../early-raw-html-versions/` and seems `version_7.html` works.
2. The html preview is confusing users. So show it conditionally. Let's add tab `LinkedIn Preview` (default) & `Html Preview`. User can select any of it. For both of them, there should have option for `Copy`
3. The markdown editor should always be present. And take at least half of the page in desktop. For mobile, it should show top and the html/linkedin preview should show later
4. In large screen, the website is not taking full space. Why is that? It should take full or reasonable looking space (Ex: tailwind container size).
5. The `Light mode/dark model` on the full website could be removed. However, it should be present for linkedin preview
6. On `Save Post`, it is saving same post multiple times. If post is not changed, the save post button should be disabled.
7. No post title should be duplicate.
8. The editor seems not working. I've selected a text and pressed `B (bold)`, but it doesn't update the `write your content input to **selected text**`. Ensure the editor works ok
9. The app should work as a PWA app. I don't see any manifest.json file. Won't that be necessary.

### Comments
1. Linkedin preview is not working ok
2. Ui & UX is also odd


## Instruction List 5

### Instructions
1. Linkedin preview is not working ok. The bold letter doesn't show bold in preview. There could be other issue. You must ensure the linked preview works flawlessly. Check all the examples and ensure the preview looks good. You may check from `early-raw-html-versions/*`. For example: `version_4`. It shows preview mostly ok. However, It replaces, main text with something like `Title, 𝗞𝗲𝘆 𝗣𝗼𝗶𝗻𝘁` etc. We should not do that. Instead the line will become bold.
2. Why the The input area of `Write your content` is so squeezed. It should take all the left over space of left. But it doesn't. There are large blank space between text area and preview
3. The website is not mobile responsive. In smaller screen, the write your content part will show first and the preview will show at later. not side by side. Ensure the site to be fully responsive
4. Why LinkedIn Display Settings is at bottom. It should show at top after Linkedin preview button. And the button doesn't work as expected
5. When a text is selected and made bold or changed by `B` or other editing buttons, the input text of text area jumps to end of the text area on vertical scroll
6. In browser tab of website favicon, when run `pnpm dev`, it doesn't show the icons


### Comments
1. It couldn't solve the main issues. Linkedin preview is not ok
2. And the UX & UI still looks odd. I am going to give it screenshot
3. And in mobile view there is horizontal scroll. What the hell!


## Instruction List 6

### Instructions
1. Please check earlier comments. Fix all issue. Check the screenshots in `screenshots/task-1/after-instruction-list-5*`
2. Fix and polish everything. Make it production ready without needing for further command


### Comments
1. It couldn't fix most issue. The text area has still gap on right. I've updated it by style
2. The linked in preview is still broken
3. The buttons for in linkedin preview (light, dark, desktop, mobile) doesn't work
4. The favicon in browser tab still not updated


## Instruction List 7

## Instructions
1. Fix issues reminded earlier
2. For linkedin preview. Example input:
   # 🚀 Quick JavaScript Tips for Beginners

   ## Essential concepts every developer should know

   Learning JavaScript can be *overwhelming*, but these **fundamentals** will get you started:

   ### 1. Variables and Data Types

   ```javascript
   // Different ways to declare variables
   let name = "John";
   const age = 25;
   var isStudent = true;

   // Arrays and objects
   const fruits = ["apple", "banana", "orange"];
   const person = { name: "Jane", age: 30 };
   ```
   And it's example output for linkedin is:
   𝗧𝗜𝗧𝗟𝗘: 🚀 Quick JavaScript Tips for Beginners

   𝗞𝗲𝘆 𝗣𝗼𝗶𝗻𝘁: Essential concepts every developer should know

   Learning JavaScript can be 📍 overwhelming, but these fundamentals will get you started:

   𝗦𝘂𝗯𝗵𝗲𝗮𝗱𝗶𝗻𝗴: 1. Variables and Data Types

   ┌─── 💻 CODE (JAVASCRIPT) ───
   │ // Different ways to declare variables
   │ let name = "John";
   │ const age = 25;
   │ var isStudent = true;
   │ 
   │ // Arrays and objects
   │ const fruits = ["apple", "banana", "orange"];
   │ const person = { name: "Jane", age: 30 };
   └────────────────────
   Except the `🚀 Quick JavaScript Tips for Beginners` should be bold like title and so on
3. The new line also doesn't work. It is frustrating that, in very earlier raw versions of html, linkedin preview worked mostly ok. Make sure u fix this core feature 
