// @APP:
    // "Done (for now)"

    // A React-based Web App Multi-Timer with custom snooze and a one-at-a-time notification queue.

    // https://kdcinfo.com/app/done-for-now/
    // Author: Keith D Commiskey

    // 'Done (for now)' provides timer alerts (via a modal) with Snooze/Done/Disable options, and an adjustable
    // snooze delay. It also provides a custom notification 'queue' which accounts for overlapping/simultaneous alerts.

import * as React from 'react';

class History extends React.Component {
    render() {
        return (
            <div>
                <h3>Left; @TODO</h3>

                <h4>Add 2-minute highlight to the "Time Until" field. (added 2017-08-14)</h4>

                <h4>Convert to React Native (<b>learn React Native</b>)</h4>
                <ul>
                    <li>This will be done via another GitHub Repository</li>
                    <li>I mean I guess: Maybe this project will suffice?</li>
                    <li>Don't know yet 'cause I don't know Native yet :)</li>
                </ul>

                <h3>Completed; @DONE</h3>

                <h4>Calculate countdown time [DONE: 2017-07-12: 12:29am (~12 hrs 07-11 + ~8 hrs 07-12)]</h4>
                <ul>
                    <li>For both the 'initial timeout creation (createTimeout)',</li>
                    <li>and when setTimeout is up and 'Done (for now)' button is selected (updateTimer (repeat timer)).</li>
                </ul>

                <h4>Alarm Pop-Over Panel: [DONE: 2017-07-11/12 (scratched option to allow 'snooze')]</h4>
                <ul>
                    <li>
                        <pre><code>
                            /&frasl; ,--------------------------.<br/>
                            /&frasl; |    | Done (for now) |    |<br/>
                            /&frasl; |    `----------------'    |<br/>
                            /&frasl; |        TimerTitle        |<br/>
                            /&frasl; |    ,----------------.    |<br/>
                            /&frasl; |    |     Disable    |    |<br/>
                            /&frasl; '--------------------------'<br/>
                        </code></pre>
                    </li>
                </ul>

                <h4>Add Repeat (after OK) [DONE: 2017-07-12/13; @TODO: Need more testing]</h4>

                <h4>Add a setTimeout completion queue [DONE: 2017-07-14/15; (@TODO added 2017-07-13)]</h4>
                <ul>
                    <li>(for multiple timers completing on the same minute)</li>
                    <li>1. Add to queue[] (array) when setTimeout time is up;</li>
                    <li>2. Remove from queue[] when closing modal;</li>
                    <li>3. Run queueCheck() to see if any others have entered since modal was up.
                        <ul>
                            <li>In implementing this feature,</li>
                            <li>
                                <ul>
                                    <li>Had to redo (fix) the timeout creation and update logic ('getTimeDiff' and 'getTimeDiffUpdate')</li>
                                    <li>Created a flowchart of the process flow (75% complete; but enough to show pertinent conditions)</li>
                                    <li>Made the form's Title input entry 'character count' (in the label) dynamic:</li>
                                    <li>
                                        <ul>
                                            <li>It will yield the difference between the 'config setting' (passed down as a prop) and the field's current length.</li>
                                        </ul>
                                    </li>
                                    <li>Reset DOM element focus after timer is added, so 'Add Your Timer' button doesn't stay selected (sets focus to Title).</li>
                                </ul>
                            </li>
                        </ul>
                    </li>
                </ul>

                <h4>Add Snooze option: [DONE: 2017-07-17]</h4>
                <ul>
                    <li>Added snooze 'config' setting: Minutes to snooze [1-10]
                        <ul>
                            <li><pre><code>
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
                            </code></pre></li>
                        </ul>
                    </li>
                </ul>

                <h4>Miscellaneous [DONE: 2017-07-16]</h4>
                <ul>
                    <li>Set stepCountMinutes back to : 5</li>
                    <li>Change modal verbiage: Modal Title [00:00]</li>
                    <li>Clean up code
                        <ul>
                            <li>(especially the redundant if/then/else with the same values in the 'update' method)</li>
                        </ul>
                    </li>
                </ul>

                <h4>Save to localStorage [DONE: 2017-07-18]</h4>
                <ul>
                    <li><code>&frasl;* [timerList], snoozeTime *&frasl;</code>
                        <ul>
                            <li>Load on page load (root component 'componentWillMount()')
                                <ul>
                                    <li>Will send all 'active' timers through 'addRemoveTimeout()' to create new setTimeouts</li>
                                    <li>Any timer in 'snooze' state will be reset to its next default time</li>
                                </ul>
                            </li>
                        </ul>
                        <ul>
                            <li>Update storage when:
                                <ul>
                                    <li>Figured out pretty quick I only needed to 'setStorageItem' after all relevant 'setState's
                                        <ul>
                                            <li>setTimer, updateTimer, and removeTimer</li>
                                            <li>addRemoveTimeout, and updateTimeout</li>
                                        </ul>
                                    </li>
                                </ul>
                                <ul>
                                    <li>Provide option to remove local storage for provided username
                                        <ul>
                                            <li>Why? Just delete your timers; the timerList array (the only stored list) will be empty.</li>
                                        </ul>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </li>
                </ul>

                <ul>
                    <li><pre><code>
                        &lt;div style="color: #dd0000;"&gt;<br/>
                          &lt;h3&gt;Temporarily Under Construction &lt;b&gt;until: 2017-07-20 (Thursday)&lt;/b&gt;&lt;/h3&gt;<br/>
                          &lt;h5&gt;Visual countdowns are near complete. Will fix the 'snooze'/'done' button actions later tonight (Wed)&lt;/h5&gt;<br/>
                        &lt;/div&gt;<br/>
                    </code></pre></li>
                </ul>

                <h4>Visual Timeout Countdowns [DONE: 2017-07-19]</h4>
                <ul>
                    <li>To show a countdown of active counters: Will need to set up something generic.</li>
                    <li>This is primarily done. Just need to fix the 'timerDisplayList' for 'snooze' and 'done' action buttons when alerts are up.</li>
                    <li>Fixed. Just missed initializing a variable (forgot to `let` it be)</li>
                </ul>

                <h4>Functional Flowchart [DONE: 2017-07-20]</h4>
                <ul>
                    <li>Finish flowchart (https:/&frasl;www.draw.io/)</li>
                    <li>Ensure all paths are being covered | cross-check with 'streamlined' file</li>
                    <li>Done: I also cross-checked with a super-streamlined file (which isolated a function being declared twice in the same component - whoops.)</li>
                    <li>Exported in a variety of formats, but delivery will be the same as Guess Right - on the README.md on the open-sourced GitHub page.</li>
                </ul>

                <h4>CodePen --> GitHub [DONE: 2017-07-22 (Sat)]</h4>
                <ul>
                    <li>Convert this Pen to a local file structure</li>
                    <li>Commit to GitHub (create full readme)</li>
                    <li>Deploy to GitHub Pages via Travis</li>
                </ul>

                <h4>Testing [DONE: 2017-07-22 (Sat)]</h4>
                <ul>
                    <li>Definitely need more scientific testing covering a range of scenarios.</li>
                    <li>Need to move code to local dev environment to allow for Testing</li>
                    <li>Added base test (i.e., just making sure it loads)</li>
                </ul>

                <h4>TypeScript Added [DONE: 2017-08-16 (Wed)]</h4>
                <ul>
                    <li>Added `typing` using TypeScript.</li>
                    <li>Also got localStorage mock-up `typed` to accommodate testing.</li>
                </ul>
            </div>
        );
    }
}

export default History;