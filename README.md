# Done (for now)

## A React Web App

> A React-based multi-'timer' web app with custom snooze and a one-at-a-time notification queue.

'Done (for now)' provides timer alerts (via a modal) with Snooze/Done/Disable options (and an adjustable snooze delay).
It also provides a custom notification 'queue' which accounts for overlapping/simultaneous alerts.

I added TypeScript in August 2017. Also got `localStorage` mock-up `typed` to accommodate testing.

## Application URLs

  - [GitHub Pages (Demo)](https://KDCinfo.github.io/done-for-now/)
    - [GitHub Source (Code)](https://github.com/KDCinfo/done-for-now)
    - [Travis CI (Prod Build)](https://travis-ci.org/KDCinfo/done-for-now)
  - [CodePen Version](https://codepen.io/KeithDC/pen/weXdEe)
  - [Process Flowchart](https://www.draw.io/?lightbox=1&highlight=0000ff&layers=1&nav=1&title=done-for-now.xml#Uhttps%3A%2F%2Fdrive.google.com%2Fuc%3Fid%3D1yBRNQSlwDAaUjgA4M2Th9HJPS471JyWY%26export%3Ddownload) -- This flowchart outline depicts the entire *Done (for now)* process flow. It was done at about 80% project completion, was finalized post-mortem (primarily as a future app maintenance resource), and took about 2 full days to complete. [https://www.draw.io](@drawio rocks!)

## Tech Stack

Working on this project provided me a more in-depth look into
  - React (15.5.4)
  - TypeScript (2.4.2)
  - Local component state and props
  - Client-side localStorage
  - Basic Testing (Jest and Enzyme)

My API endpoint of personal choice is still Laravel (PHP), but I did everyting with client-side local storage on this project.
(My professional choice is whatever the Back-End Engineers are comfortable and good with -- Front-End should have (little to) no dependence on a back-end tech stack.)

## Notes and Considerations

**Using Local Storage**

  - Just FYI the maximum size of local storage is 4.75 - 5 MB (depending on browser).
  - This should pose no storage issues.
  - Storage functions are stored in `./utilities/functions.ts`

## KDC-info Project Sites

As of July 2017

  - [Done For Now (React)](https://kdcinfo.com/app/done-for-now/) An online Timer with Snooze (`React/Web Storage/ES2017(ES8)`)
  - [Native Date Input Component (React)](https://kdcinfo.github.io/react-form-input-date-native/) An HTML5 native Date input field with non-native fallback support as outlined in the MDN documentation (`React/Web Storage/ES2015(ES6)`)
  - [Track Your Cash (React)](https://kdcinfo.com/app/register/) An online checking register (`React/Redux/React Router 4/Web Storage/ES2016(ES7)`)
  - [Guess Right (Vue)](https://kdcinfo.com/guessright/) A fun little word-guessing game (`Vue/Vuex/Vue-router/Laravel/MySQL/ES2015(ES6)`)
  - [Pick-a-Meal (Laravel)](https://kdcinfo.com/pickameal/) Can't decide where or what to eat? (`Laravel/Blade/MySQL/Bootstrap`)
  - [Keep Track (Laravel)](https://kdcinfo.com/keeptrack/) An online personal inventory manager (`Laravel/Blade/MySQL/Bootstrap`)

## Tags

`[react]` `[reactjs]` `[typescript]` `[timer]` `[snooze]` `[modal]` `[jest]` `[localStorage]`

## Tribute

This project was originally bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app) _(unejected)_

TypeScript was later following:
  [Migrating app from react-scripts to react-scripts-ts](https://www.bountysource.com/issues/47190513-migrating-app-from-react-scripts-to-react-scripts-ts)

> -- <cite>Answered at the bottom (by @trichards57)</cite>

  - Create a temporary project using `create-react-app my-temp-app --scripts-version=react-script-ts`


  - In your own project, **remove react-scripts** and **install react-scripts-ts**


  - Copy [`tsconfig.json`], [`tsconfig.test.json`], [`tslint.json`] from the temporary project src folder to your project's src folder.


  - In `package.json`, change all the references to `react-scripts` to `react-scripts-ts` in the `scripts` section.

    Reminder: `import * as React from ‘react’` (forgetting this will put you on a wild goose chase.)
