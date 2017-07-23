// @TODO: This file currently contains just rough draft notes --- It is not meant for consumption in its present state.

import React from 'react'

class History extends React.Component {
    render() {
        return (
            <div>
                <pre>
/&frasl; "Done (for now)"<br/>
<br/>
/&frasl; A React-based Web App Timer with custom snooze and a one-at-a-time notification queue.<br/>
<br/>
/&frasl; 'Done (for now)' provides timer alerts (via a modal) with Snooze/Done/Disable options (and an adjustable snooze delay).<br/>
/&frasl; It also provides a custom notification 'queue' which accounts for overlapping/simultaneous alerts.<br/>
<br/>
/&frasl; @TODO: [done] items are at the bottom of this file<br/>
<br/>
/&frasl; @TODO: CodePen --> GitHub                [In Progress: 2017-07-21 (Fri); Target: 2017-07-23 (Sun)]<br/>
    /&frasl; @TODO: Convert this Pen to a local file structure<br/>
    /&frasl; @TODO: Commit to GitHub (create full readme)<br/>
    /&frasl; @TODO: Deploy to GitHub Pages via Travis<br/>
<br/>
/&frasl; @TODO: Testing                           []<br/>
    /&frasl; Definitely need more scientific testing covering a range of scenarios.<br/>
    /&frasl; Need to move code to local dev environment to allow for Testing<br/>
<br/>
/&frasl; @TODO: Convert to React Native (learn React Native)<br/>
<br/>
&frasl;*<br/>
    Storage (local; client-side [window])<br/>
    https:/&frasl;developer.mozilla.org/en-US/docs/Web/API/Storage<br/>
*&frasl;<br/>
<br/>
/&frasl; HTML<br/>
    /&frasl; <h1>Done (for now) <small><small>(WIP)</small></small></h1><br/>
    /&frasl; <p><br/>
    /&frasl;     "Done (for now)" is a 'timer' app, providing options to snooze, reset, disable, and delete timers.<br/>
    /&frasl;     This is my second React app, which I'm hoping will become my first React Native (mobile) app.<br/>
    /&frasl; </p><br/>
    /&frasl; <div id="root"></div><br/>
<br/>
/&frasl; @TODO: Calculate countdown time          [DONE: 2017-07-12: 12:29am (~12 hrs 07-11 + ~8 hrs 07-12)]<br/>
    /&frasl; For both the 'initial timeout creation (createTimeout)',<br/>
    /&frasl; and when setTimeout is up and 'Done (for now)' button is selected (updateTimer (repeat timer)).<br/>
<br/>
/&frasl; @TODO: Alarm Pop-Over Panel:             [DONE: 2017-07-11/12 (scratched option to allow 'snooze')]<br/>
<br/>
    /&frasl; ,--------------------------.<br/>
    /&frasl; |    | Done (for now) |    |<br/>
    /&frasl; |    `----------------'    |<br/>
    /&frasl; |        TimerTitle        |<br/>
    /&frasl; |    ,----------------.    |<br/>
    /&frasl; |    |     Disable    |    |<br/>
    /&frasl; '--------------------------'<br/>
<br/>
/&frasl; @TODO: Add Repeat (after OK)             [DONE: 2017-07-12/13; @TODO: Need more testing]<br/>
<br/>
/&frasl; @TODO: Add a setTimeout completion queue [DONE: 2017-07-14/15; (@TODO added 2017-07-13)]<br/>
    /&frasl; (for multiple timers completing on the same minute)<br/>
    /&frasl; 1. Add to queue[] (array) when setTimeout time is up;<br/>
    /&frasl; 2. Remove from queue[] when closing modal;<br/>
    /&frasl; 3. Run queueCheck() to see if any others have entered since modal was up.<br/>
<br/>
    /&frasl; In implementing this feature,<br/>
        /&frasl; Had to redo (fix) the timeout creation and update logic ('getTimeDiff' and 'getTimeDiffUpdate')<br/>
        /&frasl; Created a flowchart of the process flow (75% complete; but enough to show pertinent conditions)<br/>
        /&frasl; Made the form's Title input entry 'character count' (in the label) dynamic:<br/>
            /&frasl; It will yield the difference between the 'config setting' (passed down as a prop) and the field's current length.<br/>
        /&frasl; Reset DOM element focus after timer is added, so 'Add Your Timer' button doesn't stay selected (sets focus to Title).<br/>
<br/>
/&frasl; @TODO: Add Snooze option:                [DONE: 2017-07-17]<br/>
    /&frasl; Added snooze 'config' setting: Minutes to snooze [1-10]<br/>
<br/>
    /&frasl; ,------------------------.<br/>
    /&frasl; |   | Snooze (3 min) |   |<br/>
    /&frasl; |   `----------------'   |<br/>
    /&frasl; |       TimerTitle       |<br/>
    /&frasl; |   ,----------------.   |<br/>
    /&frasl; |   | Done (for now) |   |<br/>
    /&frasl; |   `----------------'   |<br/>
    /&frasl; | [00:00] [every minute] |<br/>
    /&frasl; |   ,----------------.   |<br/>
    /&frasl; |   |     Disable    |   |<br/>
    /&frasl; '------------------------'<br/>
<br/>
/&frasl; @TODO:                                   [DONE: 2017-07-16]<br/>
    /&frasl; Set stepCountMinutes back to : 5<br/>
    /&frasl; Change modal verbiage: Modal Title [00:00]<br/>
    /&frasl; Clean up code<br/>
        /&frasl; (especially the redundant if/then/else with the same values in the 'update' method)<br/>
<br/>
/&frasl; @TODO: Save to localStorage              [DONE: 2017-07-18]<br/>
    /&frasl; { /* [timerList], snoozeTime */ }<br/>
<br/>
    /&frasl; Load on page load (root component 'componentWillMount()')<br/>
        /&frasl; Will send all 'active' timers through 'addRemoveTimeout()' to create new setTimeouts<br/>
        /&frasl; Any timer in 'snooze' state will be reset to its next default time<br/>
<br/>
    /&frasl; Update storage when:<br/>
        /&frasl; Figured out pretty quick I only needed to 'setStorageItem' after all relevant 'setState's<br/>
            /&frasl; setTimer, updateTimer, and removeTimer<br/>
            /&frasl; addRemoveTimeout, and updateTimeout<br/>
    /&frasl; Provide option to remove local storage for provided username<br/>
        /&frasl; Why? Just delete your timers; the timerList array (the only stored list) will be empty.<br/>
<br/>
/&frasl; @TODO: Visual Timeout Countdowns         [DONE: 2017-07-19]<br/>
    /&frasl; To show a countdown of active counters: Will need to set up something generic.<br/>
    /&frasl; This is primarily done. Just need to fix the 'timerDisplayList' for 'snooze' and 'done' action buttons when alerts are up.<br/>
    /&frasl; Fixed. Just missed initializing a variable (forgot to `let` it be)<br/>
<br/>
/&frasl; @TODO: Functional Flowchart              [DONE: 2017-07-20]<br/>
    /&frasl; Finish flowchart (https:/&frasl;www.draw.io/)<br/>
    /&frasl; Ensure all paths are being covered | cross-check with 'streamlined' file<br/>
    /&frasl; Done: I also cross-checked with a super-streamlined file (which isolated a function being declared twice in the same component - whoops.)<br/>
    /&frasl; Exported in a variety of formats, but delivery will be the same as Guess Right - on the README.md on the open-sourced GitHub page.<br/>
<br/>
/&frasl; &lt;div&gt;<br/>
/&frasl;   &lt;h3 style="padding-left: 1rem; color: #dd0000;"&gt;Temporarily Under Construction &lt;b&gt;until: 2017-07-20 (Thursday)&lt;/b&gt;&lt;/h3&gt;<br/>
/&frasl;   &lt;h5 style="padding-left: 1.25rem; color: #dd0000;"&gt;Visual countdowns are near complete. Will fix the 'snooze'/'done' button actions later tonight (Wed)&lt;/h5&gt;<br/>
/&frasl; &lt;/div&gt;<br/>
                </pre>
            </div>
        )
    }
}

export default History