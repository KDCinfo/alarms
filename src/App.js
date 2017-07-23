// @TODO:

    // This code is being brought over from CodePen.
    // IN PROGRESS: The components will be separated out into their own files.

// @APP:
    // "Done (for now)"

    // A React-based Web App Multi-Timer with custom snooze and a one-at-a-time notification queue.

    // 'Done (for now)' provides timer alerts (via a modal) with Snooze/Done/Disable options, and an adjustable
    // snooze delay. It also provides a custom notification 'queue' which accounts for overlapping/simultaneous alerts.

import React from 'react'

import { PanelGroup, Panel, Row, Col, Table, Form, FormGroup, ControlLabel, Modal, Button, Glyphicon } from 'react-bootstrap'

import History from './components/History'

// // // // // // // // // //
// [index.css]
//
import './index.css'

// // // // // // // // // //
// [FormDateContainer.js]
//
// import FormDateContainer from './components/FormDateContainer'

/*
    Storage (local; client-side [window])
    https://developer.mozilla.org/en-US/docs/Web/API/Storage
*/
// export const setStorageItem = () => {}
const setStorageItem = (storage, key, value) => {
    try {
        storage.setItem(key, value)
    } catch(e) {
        console.error(e)
    }
}
// export const getStorageItem = () => {}
const getStorageItem = (storage, key) => {
    try {
        return storage.getItem(key)
    } catch(e) {
        console.error(e)
        return null
    }
}

class TimerBox extends React.Component {
    constructor(props) {
        super(props)

        const storedSnoozeTime = getStorageItem(localStorage, 'snoozeTime'),
              stateSnoozeTime = storedSnoozeTime ? storedSnoozeTime : 3,
              storedTimerList = getStorageItem(localStorage, 'timerList'),
              stateTimerList = (storedTimerList) ? JSON.parse(storedTimerList) : []

        this.state = {
            timerList: stateTimerList,  // A list of timers: { id: 0, title: '', time: '00:00', cycle: 0 }
            timeoutList: [],            // A list of active timers -- with Timeout ID: { id: 0, timer: 0 }
                                        // Also includes a list of 'display timers' (sibling setTimeouts).
            timeoutQueue: [],           // A list of completed timeouts going through the 'modal' process.
            timerDisplayList: [],       // 1-second timeouts that update set (stateless) <TimeDisplay />s.
            titleCount: 20,
            titleTemp: 'Watch my show!',
            countHours: 24,
            countMinutes: 60,
            stepCountMinutes: 5,
            snoozeTime: stateSnoozeTime,
            entryCycleList: ['daily','hourly','every minute'],
            showModal: false,
            modalTitle: '',
            modalTimerId: '',
        }
        this.setSnooze = this.setSnooze.bind(this)
        this.setTimer = this.setTimer.bind(this)
        this.setTimerCallback = this.setTimerCallback.bind(this)
        this.addRemoveTimeout = this.addRemoveTimeout.bind(this)
        this.toggleTimeout = this.toggleTimeout.bind(this)
        this.removeTimer = this.removeTimer.bind(this)
        this.getLastId = this.getLastId.bind(this)
        this.deleteTimeout = this.deleteTimeout.bind(this)
        this.createTimeout = this.createTimeout.bind(this)
        this.timerSnooze = this.timerSnooze.bind(this)
        this.timerReset = this.timerReset.bind(this)
        this.timerDisable = this.timerDisable.bind(this)
        this.showModal = this.showModal.bind(this)
        this.getTimeDiff = this.getTimeDiff.bind(this)
        this.getTimeDiffUpdate = this.getTimeDiffUpdate.bind(this)
        this.addToTimeoutQueue = this.addToTimeoutQueue.bind(this)
        this.removeFromTimeoutQueue = this.removeFromTimeoutQueue.bind(this)
        this.checkTimeoutQueue = this.checkTimeoutQueue.bind(this)
    }
    initializeState() {
        // Create new 'timeoutList' from stored 'timerList'
            // Go through each [timerList] entry and, if 'active', execute addRemoveTimeout(entryId, 'add')

        // On 'componentWillUnmount', empty [timeoutList]
            // Clear setTimeouts, but "don't" set 'timer' entry to non-active
            // Must clear these because setTimeout() will no longer be active

            // Don't think 'componentWillUnmount' functionality is necessary...
                // If 'componentDidMount' is being run, then 'this.state' will be (re)initialized as well,
                // which will zero out [] both 'timeoutList' and 'timeoutQueue'

        const storedTimerList = getStorageItem(localStorage, 'timerList'),
              stateTimerList = (storedTimerList) ? JSON.parse(storedTimerList) : []

        // 'this.state.timeoutList' should already be empty [] ( per constructor's this.state = {} )
        // 'this.state.timeoutQueue' should already be empty [] ( per constructor's this.state = {} )

        if (stateTimerList.length > 0) {
            stateTimerList.forEach( (elem) => {
                if (elem.active === true) {
                    setTimeout( () => {                         // WHen these are not staggered, only 1 shows in the 'timerDisplay' code/layout.
                        this.addRemoveTimeout(elem.id, 'add')   // And although setTimeout({},0) fixes this, it is not the best solution.
                    },0)                                        // I just don't know what a more proper solution/approach would be.
                }
            })
        }
    }
    componentDidMount() {
        this.initializeState()
    }

    // Timers   - Can be active/non-active [id, title, time, cycle, active]
    // Timeouts - Contains only active Timers [Timer ID, setTimeout ID]

    // Timer - Add
        // this.setTimer(...params) // From <form> submit
        // --> this.addRemoveTimeout --> (lastId+1)

    // Timer - Toggle Activation
        // ID passed in

        // Timer - ON
            // Create/Start Timeout: this.addRemoveTimeout(timerId, 'add')
            // Toggle Timer on: this.toggleTimeout('on')

        // Timer - OFF
            // Remove/Clear Timeout: this.addRemoveTimeout(timerId, 'remove')
            // Toggle Timer off: this.toggleTimeout('off')

    // Timer - Remove
        // From <Timers /> Listing
        // If timer is active: this.addRemoveTimeout(timerId, 'remove')
        // Remove from timerList: this.removeTimer(timerId)

        // Text PADDING: Pre-ES8 (pre-ES2017) (i.e., the old-fashioned way)
            // entryHoursPad = entryHours.toString().length === 1 ? '0'+entryHours : entryHours,
            // entryMinutesPad = entryMinutes.toString().length === 1 ? '0'+entryMinutes : entryMinutes,
        // Text PADDING: ES8 (ES2017) (i.e., the new way)
            // Couldn't get padStart() to work in testing, so went back to pre-ES8
                // (installed babel-preset-2017 and added to [.babelrc] file)
            // entryHoursPad = entryHours.toString().padStart(2, '0'),
            // entryMinutesPad = entryMinutes.toString().padStart(2, '0'),

    setTimer(entryTitle, entryHours, entryMinutes, entryCycle) {
        const entryHoursPad = entryHours.toString().length === 1 ? '0'+entryHours : entryHours,
              entryMinutesPad = entryMinutes.toString().length === 1 ? '0'+entryMinutes : entryMinutes,
              lastIdx = this.getLastId(),
              nextId = this.state.timerList.length === 0 ? 0 : (lastIdx+1),
              timerList = this.state.timerList.concat({
                  id: nextId,
                  title: entryTitle,
                  time: entryHoursPad + ':' + entryMinutesPad,
                  cycle: entryCycle,
                  active: false
              })
        this.setState({ timerList }, () => {
            setStorageItem(localStorage, 'timerList', JSON.stringify(timerList))
            this.setTimerCallback()
        })
    }
    getLastId() {
        const lastId = this.state.timerList.reduce( (agg, curObj) => (curObj.id > agg) ? curObj.id : agg, 0 )

        return lastId
    }
    setTimerCallback() {
        const lastId = this.getLastId()

        this.toggleTimeout(lastId, 'on') // 'addRemoveTimeout' is called from 'toggleTimeout'
    }
    removeTimer(timerId) {
        const entryId = parseInt(timerId, 10),
              newTimerList = this.state.timerList,
              timerEntry = newTimerList.find( elem => (elem.id === entryId) )

        if (timerEntry.active === true) {
            this.addRemoveTimeout(entryId, 'remove')
        }

        newTimerList.forEach( (elem, idx) => {
            if (elem.id === entryId) {
                newTimerList.splice(idx, 1)
            }
        })
        this.setState({ timerList: newTimerList }, () => {
            setStorageItem(localStorage, 'timerList', JSON.stringify(newTimerList))
        })
    }
    addRemoveTimeout(timerId, whichTask) {
        // This method has 2 entry points:
            // removeTimer(timerId) // ID is passed in (from Timer listing)
            // toggleTimeout()      // ID is passed in (has 3 entry points)

        const entryId = timerId

        if (whichTask === 'remove') {
            this.deleteTimeout(entryId)
        } else if (whichTask === 'update') {
            this.updateTimeout(entryId)         // no 2nd param        (setTimeout delay is based on current time)
        } else if (whichTask === 'snooze') {
            this.updateTimeout(entryId, true)   // 2nd param = snooze  (setTimeout delay is set based on state.snoozeTime)
        } else {
            this.createTimeout(entryId)         //                     (setTimeout delay is set based on <form> submit values and current time)
        }
    }
    deleteTimeout(entryId) {
        // This method has 1 entry point:
            // addRemoveTimeout()

        let newTimeoutList = this.state.timeoutList,
            newTimerDisplayList = this.state.timerDisplayList,
            timeoutTimerId

        // timeoutList[] will have 2 entries for each timeout
            // [
            //     {id: 0, timer: 15}, <-- Modal-prompt setTimeout ('pop-up alerts')
            //     {id: 0, timer: 24}, <-- Every-second setTimeout ('visual counter')
            //     {id: 1, timer: 32}, <-- Modal-prompt setTimeout
            //     {id: 1, timer: 45}  <-- Every-second setTimeout
            // ]

            newTimeoutList.forEach( (elem, idx) => {
                if (elem.id === entryId) {
                    timeoutTimerId = elem.timer
                    newTimeoutList.splice(idx, 1)
                    window.clearTimeout(elem.timer)
                }
            })
            this.setState({timeoutList: newTimeoutList})

        // timerDisplayList[]
            // [
            //     {id: 24, destination: targetDateInMilliseconds}, <-- 'id' is this sibling timeout's Timer ID; 'destination' is current date/time plus timeDiff
            //     {id: 45, destination: targetDateInMilliseconds}  <-- 'id' is this sibling timeout's Timer ID; 'destination' is current date/time plus timeDiff
            // ]

            newTimerDisplayList.forEach( (elem, idx) => {
                if (elem.id === timeoutTimerId) {
                    newTimerDisplayList.splice(idx, 1)
                    window.clearTimeout(timeoutTimerId)
                }
            })
            this.setState({timerDisplayList: newTimerDisplayList})
    }
    createTimeout(entryId) {
        // This method has 1 entry point:
            // addRemoveTimeout()

        const newTimerList = this.state.timerList,
              timerEntry = newTimerList.find( elem => (elem.id === entryId) ),
              timerHour = parseInt(timerEntry.time.substr(0,2), 10),
              timerMinute = parseInt(timerEntry.time.substr(3,2), 10),
              timerCycle = timerEntry.cycle,
              thisTimeDiff = this.getTimeDiff(timerHour, timerMinute, timerCycle)


        let newTimeoutList = this.state.timeoutList,
            newTimerDisplayList = this.state.timerDisplayList,
            newTimeout,
            newTimeoutEntry,
            newTimerDisplayEntry,
            targetTime

        // setTimeout function will subtract current time from target time and use as ({setTimeout's}, wait) time

        newTimeout = setTimeout( () => {
            // Add to timeoutQueue
                // 1. Add to queue[] (array) when setTimeout time is up;
                // 2. Remove from queue[] when closing modal;
                // 3. Run queueCheck() to see if any others have entered since modal was up.
            this.addToTimeoutQueue(entryId)
            // this.setState(...timeoutParams, this.showModal) // <-- Moving this to [addToTimeoutQueue()]
                // this.setState({ modalTitle: timerEntry.title, modalTimerId: entryId }, this.showModal)
                // For native apps, modal should work fine (I presume you can hook into the system's messaging system)

            // For web-based, might consider using window.confirm() which uses browser internal message notification system
                // (it'll alert you if you're on another tab)
                // window.confirm(timerEntry.title)
        }, thisTimeDiff)
        // }, 1000)

        targetTime = (Date.now() + thisTimeDiff)
        newTimerDisplayEntry = { id: newTimeout, destination: targetTime }
        newTimerDisplayList = newTimerDisplayList.concat(newTimerDisplayEntry)
        this.setState({ timerDisplayList: newTimerDisplayList })

//                 // timeoutList[] will have 2 entries for each timeout
//                     // [
//                     //     {id: 0, timer: 15}, <-- Modal-prompt setTimeout ('pop-up alerts')
//                     //     {id: 0, timer: 24}, <-- Every-second setTimeout ('visual counter')
//                     //     {id: 1, timer: 32}, <-- Modal-prompt setTimeout
//                     //     {id: 1, timer: 45}  <-- Every-second setTimeout
//                     // ]
//                 // this.state.timerDisplayList[]
//                     // [
//                     //     {id: 24, destination: now + timeDiff}, <-- 'destination' date/time minus current date/time
//                     //     {id: 45, destination: now + timeDiff}  <-- 'destination' date/time minus current date/time
//                     // ]
//                 // 1499929200000 + 45000 (45 seconds; in future (in milliseconds))

//                 const timerDisplayListIndex = newTimerDisplayList.findIndex(x => x.id === newTimeout),
//                       tmpTimerDisplayList = [
//                            ...newTimerDisplayList.slice(0,timerDisplayListIndex),
//                            { id: newTimeout, destination: (timerDisplayList[timerDisplayListIndex].destination - Date.now()) },
//                            ...newTimerDisplayList.slice(timerDisplayListIndex+1)
//                       ]

//                 this.setState({ timerDisplayList: tmpTimerDisplayList })

            // this.getTimeDiff() // Returns milliseconds between [current time] and [current time + set time + cycle]

        newTimeoutEntry = { id: entryId, timer: newTimeout }
        newTimeoutList = newTimeoutList.concat(newTimeoutEntry)
        this.setState({ timeoutList: newTimeoutList })
    }
    addToTimeoutQueue(entryId) {
        let tmpTimeoutQueue = this.state.timeoutQueue

        tmpTimeoutQueue.push(entryId)
        this.setState({timeoutQueue: tmpTimeoutQueue}, this.checkTimeoutQueue)
    }
    removeFromTimeoutQueue(entryId) {
        let tmpTimeoutQueue = this.state.timeoutQueue

        tmpTimeoutQueue.forEach( (elem, idx) => {
            if (elem === entryId) {
                tmpTimeoutQueue.splice(idx, 1)
            }
        })
        this.setState({timeoutQueue: tmpTimeoutQueue}, this.checkTimeoutQueue)
    }
    checkTimeoutQueue() {
        // get queue, get first[0] id in queue
        // set [state]modal contents (which will show modal with showModal: true)

        let tmpTimeoutQueue = this.state.timeoutQueue
        if (tmpTimeoutQueue.length > 0) {
            this.setModal(tmpTimeoutQueue[0])
        }
    }
    setModal(entryId) {
        const timerEntry = this.state.timerList.find( entry => (entry.id === entryId) )
        this.setState({
            modalTitle: timerEntry.title,
            modalTimerId: timerEntry.id
        }, this.showModal)
    }
    updateTimeout(entryId, isSnooze) {
        // This method has 2 calls from 1 entry point:
            // addRemoveTimeout()

        const newTimerList = this.state.timerList,
              timerEntry = newTimerList.find( elem => (elem.id === entryId) ),
              timerHour = parseInt(timerEntry.time.substr(0,2), 10),
              timerMinute = parseInt(timerEntry.time.substr(3,2), 10),
              timerCycle = timerEntry.cycle,
              thisTimeDiffUpdate = this.getTimeDiffUpdate(timerHour, timerMinute, timerCycle),
              thisTimeoutWait = (isSnooze) ? (this.state.snoozeTime * 60 * 1000) : thisTimeDiffUpdate
                                          // [this.state.snoozeTime] is set in {state} as 'minutes', so we need to convert to milliseconds

        let newTimeoutList = this.state.timeoutList,
            newTimerDisplayList = this.state.timerDisplayList,
            newTimeout,
            tmpTimerOldId,
            targetTime

        newTimeout = setTimeout( () => {
            this.addToTimeoutQueue(entryId)
        }, thisTimeoutWait)

        // this.deleteTimeout(entryId) // No need to delete existing 'timeout': Just update with new Timeout ID (i.e., the results of [newTimeout])

        // UPDATE TIMEOUT LIST

        // Update an Object's properties from within an Array
        newTimeoutList = newTimeoutList.map( (elem, idx) => {
            if (elem.id === entryId) {
                tmpTimerOldId = elem.timer
                elem.timer = newTimeout
            }
            return elem
        })
        this.setState({ timeoutList: newTimeoutList })

        // UPDATE VISUAL COUNTDOWN LIST

        targetTime = (Date.now() + thisTimeoutWait)
        // newTimerDisplayEntry = { id: newTimeout, destination: targetTime }
        // newTimerDisplayList = newTimerDisplayList.concat(newTimerDisplayEntry)

        newTimerDisplayList = newTimerDisplayList.map( elem => {
            if (elem.id === tmpTimerOldId) {
                elem.id = newTimeout
                elem.destination = targetTime
            }
            return elem
        })
        this.setState({ timerDisplayList: newTimerDisplayList })
    }
    getTimeDiffUpdate(tHour, tMinute, timerCycle) {

        let tmpDate = new Date(),
            timerDate = tmpDate.getDate(),
            timerHour = tHour,
            timerMinute = tMinute,
            addDate = 0,
            addHours = 0,
            addMinutes = 0,
            nowDate,
            nowSetTime,
            futureSetTime,
            timeToSetAhead = 0

        const currentMinutes = tmpDate.getMinutes()

        tmpDate.setMilliseconds(0)
        tmpDate.setSeconds(0)

            // 'cycle' === '0: daily'
            // 'cycle' === '1: hourly'
            // 'cycle' === '2: minute'

        if (timerCycle === 0) {
            // tmpDate.setDate(tmpDate.getDate() + 1)

            tmpDate.setMinutes(timerMinute, 0, 0)
            tmpDate.setHours(timerHour)

            if (timerDate === tmpDate.getDate()) {              // 15 = 15
                addDate = 1
            } else {                                            // If not equal, just add a day to current day
                addDate = tmpDate.getDate() + 1
            }

        } else if (timerCycle === 1) {
            // tmpDate.setHours(tmpDate.getHours() + 1)

            // tH   cH -- (tH: timeoutHour, cH: currentHour)
            // 18 < 00 -- addHours = 24 + (timerMHour - tmpDate.getMHours()) + 1
            // 18 = 01 -- addHours = 1
            // 18 > 00 -- addHours = (timerMHour - tmpDate.getMHours()) + 1

            tmpDate.setMinutes(timerMinute, 0, 0)                   // I believe this just zeros it out, and doesn't increment/decrement hours.

            if (timerMinute <= currentMinutes) {

                // if (timerHour < tmpDate.getHours()) {                   // 18 < 21 | 1 < 2
                // } else if (timerHour === tmpDate.getHours()) {          // 18 = 18
                // } else if (timerHour > tmpDate.getHours()) {            // 18 > 15 | 2 > 1
                //     // addHours = (timerHour - tmpDate.getHours()) + 1
                // }
                addHours = 1
            }

        } else if (timerCycle === 2) {
            // tmpDate.setMinutes(tmpDate.getMinutes() + 1)

            addMinutes = 1
        }

        tmpDate.setMinutes(tmpDate.getMinutes() + addMinutes)
        tmpDate.setHours(tmpDate.getHours() + addHours)
        tmpDate.setDate(tmpDate.getDate() + addDate)

        futureSetTime = tmpDate.getTime()                       // Future milliseconds

        nowDate = new Date()
        nowSetTime = nowDate.getTime()                          // Current milliseconds

        timeToSetAhead = futureSetTime - nowSetTime             // Future milliseconds - now() milliseconds +> Target Hours +> Target Minutes

            console.log('Add [Date|Hours|Minutes]', addDate, '|', addHours, '|', addMinutes)

            console.log('[Current Date]', nowDate.toString())
            console.log('[Target Date]', tmpDate.toString())

            console.log('[setTimeout(,milliseconds)]', timeToSetAhead)

        return timeToSetAhead
    }
    getTimeDiff(tHour, tMinute, timerCycle) {

        let timerHour = tHour,
            timerMinute = tMinute,
            tmpDate = new Date(),
            addMinutes = 0,
            addHours = 0,
            nowDate,
            nowSetTime,
            futureSetTime,
            timeToSetAhead = 0

        const currentMinutes = tmpDate.getMinutes()

        tmpDate.setMilliseconds(0)
        tmpDate.setSeconds(0)

        // 'cycle' === '0: daily'
        // 'cycle' === '1: hourly'
        // 'cycle' === '2: minute'

        if (timerMinute < tmpDate.getMinutes()) {               // :30 < :45 | 19 < 20 | 59

            addMinutes = 60 + (timerMinute - tmpDate.getMinutes())

        } else if (timerMinute === tmpDate.getMinutes()) {      // :30 = :30

            if (timerCycle === 0 || timerCycle === 1) {
                addMinutes = 0
            } else {
                addMinutes = 1
            }

        } else if (timerMinute > tmpDate.getMinutes()) {        // :30 > :15

            addMinutes = (timerMinute - tmpDate.getMinutes())
        }

        tmpDate.setMinutes(tmpDate.getMinutes() + addMinutes)

        if (timerHour < tmpDate.getHours()) {                   // 18 < 21

            addHours = 24 + (timerHour - tmpDate.getHours())

        } else if (timerHour === tmpDate.getHours()) {          // 18 = 18 | 3 = (2 + 1)

            // console.log('[...]', timerMinute, '<=', tmpDate.getMinutes(), '<=', currentMinutes)
            // ^---< was having trouble per testing note 3 lines down : Determined bad comparison

            //                         tT      cT
            // 31 "<=" 32 "|" 1  ===  3:31 <= 2:32  ===

            if (timerMinute === currentMinutes) {
                // Changed from [tmpDate.getMinutes()] to [currentMinutes]
                    // Due to test: (current time) 03:52 ==> (target time) 03:53
                    // 1 minute ahead resulted in (+1 hour +1 minute) ahead

                if (timerCycle === 0) {
                    addHours = 24
                } else if (timerCycle === 1) {
                    addHours = 0
                } else {
                    addHours = 0
                }
            } else {
                addHours = 0
            }

        } else if (timerHour > tmpDate.getHours()) {            // 18 > 15

            addHours = (timerHour - tmpDate.getHours())
        }

        tmpDate.setHours(tmpDate.getHours() + addHours)

        futureSetTime = tmpDate.getTime()                       // Future milliseconds

        nowDate = new Date()

            // nowDate.setMilliseconds(0)
                // Don't need to zero this out.

            // nowDate.setSeconds(0)
                // Don't zero
                // Use current seconds to allow for 'same-minute' execution
                // I.e., if timer is set within the current minute,
                    // but current time is 30 seconds before the target 'timerMinute',
                    // it'll wait that first 30 seconds... not a minute and 30 seconds.

            nowSetTime = nowDate.getTime()                      // Current milliseconds

        timeToSetAhead = futureSetTime - nowSetTime             // Future milliseconds - now() milliseconds +> Target Hours +> Target Minutes

            console.log('[getTimeDiff] Add [Hours|Minutes]', addHours, '|', addMinutes)

            console.log('[getTimeDiff] [Current Date]', nowDate.toString())
            console.log('[getTimeDiff] [Target Date]', tmpDate.toString())

            // console.log('[Current milliseconds]', nowSetTime)
            // console.log('[Target milliseconds]', futureSetTime)
            console.log('[getTimeDiff] [setTimeout(,milliseconds)]', timeToSetAhead)

            // [getTimeDiff] AAA double-check with ZZZ (below)     24 0 0 0
            // [getTimeDiff] tmpDate PRE seconds set               Wed Jul 12 2017 00:24:54 GMT-0700 (Pacific Daylight Time)
            // [getTimeDiff] tmpDate POST seconds set              Wed Jul 12 2017 00:24:00 GMT-0700 (Pacific Daylight Time)
            // [getTimeDiff] addMinutes                        36  Wed Jul 12 2017 01:00:00 GMT-0700 (Pacific Daylight Time)
            // [getTimeDiff] addHours                          23  Thu Jul 13 2017 00:00:00 GMT-0700 (Pacific Daylight Time)
            // [getTimeDiff] ZZZ Double check same as AAA          24 0 0 0
            // [tmpDate]                                           Thu Jul 13 2017 00:00:00 GMT-0700 (Pacific Daylight Time)
            // [nowDate]                                           Wed Jul 12 2017 00:24:54 GMT-0700 (Pacific Daylight Time)
            // [nowSetTime]                                        1499844294219
            // [futureSetTime]                                     1499929200000
            // [timeToSetAhead]                                    84905781

        return timeToSetAhead
    }
    toggleTimeout(timerId, onOff) {
        // This method has 4 entry points:
            // setTimerCallback()       // ID is highest
            // <Timer /> checkbox       // ID is passed in
            // <TimerBox /> alert Modal // ID from Modal: (timerReset && timerSnooze) (callbacks)

        console.log('[toggleTimeout]', timerId, onOff)

        if (onOff === 'on') {                           // <Form /> Add -> setTimer() -> setTimerCallback()
            this.addRemoveTimeout(timerId, 'add')
        } else if (onOff === 'off') {                   // timerList[] -> <Timer /> -> checkbox
            this.addRemoveTimeout(timerId, 'remove')
        } else if (onOff === 'snooze') {                // <Modal /> -> Snooze
            this.addRemoveTimeout(timerId, 'snooze')
        } else {                                        // <Modal /> -> Done (for now)
            this.addRemoveTimeout(timerId, 'update')
        }

        // Update Global Timer List - Set timer on/off (active/non-active)
            // Timer checkbox display (in Timer Listing)
            //
        if (onOff !== 'update' && onOff !== 'snooze') {
                                    // Added this condition because don't think we need to run this entire section of code if it's an 'update'
                                    // ('active' state should already be 'true' -- Just need to update the timer's new Timout ID)
            const entryIdx = timerId,
                  newTimerList = this.state.timerList.map( (elem, idx) => {
                    if (elem.id === entryIdx) {
                        elem.active = (onOff === 'on') ? true : false
                        // elem.active = (onOff === 'on' || onOff === 'update') ? true : false
                    }
                    return elem
                  })
            this.setState({ timerList: newTimerList }, () => {
                setStorageItem(localStorage, 'timerList', JSON.stringify(newTimerList))
            })
        }
    }
    timerSnooze(entryId) {
        //
        this.setState({ showModal: false }, () => { // This will turn off the modal,
            this.removeFromTimeoutQueue(entryId)    //  then remove the entry from the timeoutQueue.
            this.toggleTimeout(entryId, 'snooze')   //  then this will setup a new setTimeout, which, when done, will add this entry back into the timeoutQueue
                                                        // This should be run after the removal of the entry from the timeoutQueue (else it'll remove this entry).
                                                        // This should not pose an issue unless the setTimeout execution is less than the few milliseconds
                                                        // it takes for the 'removeFromTimeoutQueue()' method above to remove it from the queue first.
        })
    }
    timerReset(entryId) {
        //
        this.setState({ showModal: false }, () => { // This will turn off the modal,
            this.removeFromTimeoutQueue(entryId)    //  then remove the entry from the timeoutQueue.
            this.toggleTimeout(entryId, 'update')   //  then this will setup a new setTimeout, which, when done, will add this entry back into the timeoutQueue
                                                        // This should be run after the removal of the entry from the timeoutQueue (else it'll remove this entry).
                                                        // This should not pose an issue unless the setTimeout execution is less than the few milliseconds
                                                        // it takes for the 'removeFromTimeoutQueue()' method above to remove it from the queue first.
        })
    }
    timerDisable(entryId) {
        //
        this.setState({ showModal: false }, () => {
            this.toggleTimeout(entryId, 'off')
            this.removeFromTimeoutQueue(entryId)
        })
    }
    setSnooze(snoozeTime) {
        //
        this.setState(
            { snoozeTime: snoozeTime },
            () => {
                setStorageItem(localStorage, 'snoozeTime', snoozeTime)
                console.log('[setSnooze] Snooze time set to:', this.state.snoozeTime)
            }
        )
    }
    showModal() {
        this.setState({ showModal: true })
    }
    render() {
        const configSettings = {
            titleCount: this.state.titleCount,
            titleTemp: this.state.titleTemp,
            countHours: this.state.countHours,
            countMinutes: this.state.countMinutes,
            stepCountMinutes: this.state.stepCountMinutes,
            entryCycleList: this.state.entryCycleList
        }
        return (
            <div>
                <header>
                    <h1 className="panel panel-primary">Done <small className="h1-small">(for now)</small></h1>
                    <p>
                        "Done (for now)" is a multi-'timer' web app with custom snooze and a one-at-a-time notification queue.
                        This is my second React web app, which I'm hoping will become my first React Native (mobile) app <small>(which is why I haven't done much on this app's responsiveness)</small>.
                    </p>
                </header>
                <main className="content">{this.props.children}
                    <PanelGroup defaultActiveKey="1" accordion>
                        <Panel header={this.state.timerList.length > 0 ? `Add/View Timers` : `Create a Timer`} eventKey="1" bsStyle="info">

                            <Row className="show-grid">
                                <Col xs={12} sm={5} md={5} className="field-col settings-form-col">
                                    <SettingsForm setTimer={this.setTimer} {...configSettings} />
                                </Col>
                                <Col xsOffset={1} xs={10} smOffset={0} sm={7} md={7} className={`field-col timer-list ${this.state.timerList.length === 0 && 'hidden'}`}>
                                    <Timers
                                        removeTimer={this.removeTimer}
                                        toggleTimeout={this.toggleTimeout}
                                        timerList={this.state.timerList}
                                        timeoutList={this.state.timeoutList}
                                        timerDisplayList={this.state.timerDisplayList}
                                        entryCycleList={this.state.entryCycleList}
                                    />
                                </Col>
                            </Row>
                            <ul>
                                <li className="padTopLi2">Snooze delay time (in minutes; for future snoozes):&nbsp;
                                    <SnoozeForm snoozeTime={this.state.snoozeTime} setSnooze={this.setSnooze} />
                                </li>
                                <li className="padTopLi">When a timer is created, the timer will be initially set to the next available time from when the time is set based on the 'cycle' selection.</li>
                            </ul>
                        </Panel>
                        <Panel header="App Features" eventKey="2" bsStyle="info">
                            <div className="ul-features">
                                <h2 className="hidden">App Features</h2>
                                <ul>
                                    <li className="padTopLi2">"<strong>Done (for now)</strong>" provides a list of all timers (both active and disabled).</li>
                                    <li>Timers provide the option to set recurring alerts (based on 'daily', 'hourly', and 'every minute' increments).<br/>
                                        &nbsp;&nbsp;<u>Note:</u> Although all timers are initially set to be recurring, they can simply be 'Disabled' when the alert pops up, and can be disabled manually at any time.</li>
                                    <li>The snooze option is adjustable (between 1-15 minutes).</li>
                                    <li>"Done (for now)" also has a 'timer queue' to account for overlapping timer alerts.</li>
                                    <li>Both the [Timer List] and the custom 'Snooze Time' are saved to your local browser storage.
                                        <ul>
                                            <li>If the page is refreshed, all timers will be recreated from this saved storage.</li>
                                            <li>Any timers in 'snooze' state will be reset to their next default time (i.e., snoozes aren't saved).</li>
                                        </ul>
                                        <br/>
                                    </li>
                                    <li className="btn-warning">@TODO: Convert this Pen to a local file structure</li>
                                    <li className="btn-warning">@TODO: Commit to GitHub</li>
                                    <li className="btn-warning">@TODO: Deploy to GitHub via Travis</li>
                                    <li className="btn-warning">@TODO: Convert to React Native (<b><i>learn React Native</i></b>)</li>
                                </ul>
                            </div>
                        </Panel>
                        <Panel header="App History" eventKey="3" bsStyle="info">
                            <History />
                        </Panel>
                    </PanelGroup>
                    <TimerAlertPrompt
                        show={this.state.showModal}
                        timerList={this.state.timerList}
                        entryCycleList={this.state.entryCycleList}
                        modalTimerId={this.state.modalTimerId}
                        modalTitle={this.state.modalTitle}
                        timerReset={this.timerReset}
                        timerDisable={this.timerDisable}
                        timerSnooze={this.timerSnooze}
                        snoozeTime={this.state.snoozeTime}
                        // hideDelete={false}
                        // userDelete={this.userDelete}
                    />
                </main>

                <footer>
                    <div className="github">
                        Done (for now) is<br/><a href="https://github.com/KDCinfo/done-for-now" target="kdcNewWin">Open Source on GitHub</a>
                    </div>
                    <div className="footer-right">
                        <span className="mobile-only"><span className="hide-created-575">Created by: </span><a href="https://kdcinfo.com" target="kdcinfo">KDC-Info</a></span>
                        <span className="non-mobile-i">Created by: <a href="https://kdcinfo.com" target="kdcinfo">KDC-Info</a></span>
                    </div>
                </footer>
             </div>
        )
    }
}
class SnoozeForm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            snoozeTime: this.props.snoozeTime
        }
        this.updateSnooze = this.updateSnooze.bind(this)
        this.setLocalSnooze = this.setLocalSnooze.bind(this)
    }
    setLocalSnooze(e) {
        this.setState({ snoozeTime: parseInt(e.target.value, 10) }, this.updateSnooze)
    }
    updateSnooze() {
        this.props.setSnooze(this.state.snoozeTime)
    }
    render() {
        return (
            <select onChange={this.setLocalSnooze} value={this.state.snoozeTime}>
                { Array.from(Array(15), (e,i)=>(i+1)).map( (entry, idx) => {
                    return (
                        <option key={idx}>{entry}</option>
                    )
                }) }
            </select>
        )
    }
}
class Timers extends React.Component {
    render() {
        // console.log('[Timers] 1:', this.props.timeoutList)
        // console.log('[Timers] 2:', this.props.timerDisplayList)
        return (
            <div className="timers-div">
                <Table responsive>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Start<br/>Time</th>
                            <th>Cycle</th>
                            <th>On/Off</th>
                            <th className="text-center">Time Until</th>
                            <th>Del</th>
                        </tr>
                    </thead>
                    <tbody>
                        { this.props.timerList.map( (entry, idx) =>
                            <Timer
                                key={idx}
                                entry={entry}
                                timeoutList={this.props.timeoutList}
                                timerDisplayList={this.props.timerDisplayList}
                                entryCycleList={this.props.entryCycleList}
                                toggleTimeout={this.props.toggleTimeout}
                                removeTimer={this.props.removeTimer}
                            />
                        )}
                    </tbody>
                </Table>
            </div>
        )
    }
}
class TimeDisplay extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            secondsElapsed: 0,
            interval: 0,
            tTimeDisplay: ''
        }
        this.tick = this.tick.bind(this)
    }
    tick() {
        // this.setState({secondsElapsed: this.state.secondsElapsed + 1})
        let tDateDiff,
            tDateHr,
            tDateMin,
            tDateSec,
            tmpTimeDisplay

        if (this.props.targetTime === 0) {
            this.setState({ tTimeDisplay: '' })
        } else {
            tDateDiff = (this.props.targetTime - Date.now())
            // tDateMin = Math.floor(tDateDiff / 60000)
            // tDateSec = ((tDateDiff % 60000) / 1000).toFixed(0)
            tDateSec = parseInt((tDateDiff / 1000) % 60, 10)
            tDateMin = parseInt((tDateDiff / (1000 * 60)) % 60, 10)
            tDateHr = parseInt((tDateDiff / (1000 * 60 * 60)) % 24, 10)

            tDateHr = (tDateHr < 10) ? "0" + tDateHr : tDateHr
            tDateMin = (tDateMin < 10) ? "0" + tDateMin : tDateMin
            tDateSec = (tDateSec < 10) ? "0" + tDateSec : tDateSec

            // return minutes + ":" + (seconds < 10 ? '0' : '') + seconds
            // return (seconds == 60 ? (minutes+1) + ":00" : minutes + ":" + (seconds < 10 ? '0' : '') + seconds)

            tmpTimeDisplay = tDateHr + ':' + tDateMin + ':' + tDateSec

            this.setState({ tTimeDisplay: tmpTimeDisplay })
            // this.setState({ tTimeDisplay: tDateHr + ':' + tDateMin + ':' + (tDateSec < 10 ? '0' : '') + tDateSec })
            // this.setState({ tTimeDisplay: 'S:' + parseInt(tDateDiff/1000).toString() })
        }
    }
    componentDidMount() {
        // Should there be a 'clearInterval' prior to setting a new one (same as what is run in 'componentWillUnmount')?
            // Although I know it's not in the instance state anymore (that's been replaced),
            // but is the previous setInterval still counting in memory?
        this.setState({ interval: setInterval(this.tick, 1000) })
    }
    componentWillUnmount() {
        clearInterval(this.state.interval)
    }
    render() {
        return (
            <span className="nowrap">{this.state.tTimeDisplay.length > 0 ? 'T-' + this.state.tTimeDisplay : ''}</span>
        )
    }
}
class Timer extends React.Component {
    constructor(props) {
        super(props)
        this.toggleTimeout = this.toggleTimeout.bind(this)
        this.removeTimer = this.removeTimer.bind(this)
    }
    toggleTimeout() {
        this.props.toggleTimeout(this.props.entry.id, this.props.entry.active ? 'off' : 'on')
    }
    removeTimer() {
        this.props.removeTimer(this.props.entry.id)
    }
    render() {
        // const { Glyphicon } = ReactBootstrap

        const timeoutEntry = this.props.timeoutList.find( elem => elem.id === this.props.entry.id),
              timerDisplayEntry = (timeoutEntry) ? this.props.timerDisplayList.find( elem => elem.id === timeoutEntry.timer) : null,
              timeDisplay = (timerDisplayEntry) ? timerDisplayEntry.destination : 0

        return (
            <tr>
                <td>{this.props.entry.title}</td>
                <td>{this.props.entry.time}</td>
                <td>{this.props.entryCycleList[this.props.entry.cycle]}</td>
                <td className="text-center">
                    <input
                        onChange={this.toggleTimeout.bind(this)}
                        type="checkbox"
                        value={this.props.entry.id}
                        checked={this.props.entry.active}
                    />
                </td>
                <td className="text-center">
                    <TimeDisplay targetTime={timeDisplay} />
                </td>
                <td>
                    <button
                        className="btn btn-xs"
                        onClick={this.removeTimer.bind(this)}
                    ><Glyphicon glyph="remove" /></button>
                </td>
            </tr>
        )
    }
}
class SettingsForm extends React.Component {
    constructor(props) {
        super(props)

        this.state = { ...this.initialState() }

        this.updateEntry = this.updateEntry.bind(this)
        this.submitEntry = this.submitEntry.bind(this)
        this.resetState = this.resetState.bind(this)
    }
    initialState() {
        return {
            entryTitle: '',
            entryHours: 0,
            entryMinutes: 0,
            entryCycleSelect: 0, // [daily|hourly|every minute]
            active: false
        }
    }
    resetState() {
        const newObj = Object.assign({}, {...this.state}, {...this.initialState()})
        this.setState( newObj )
    }
    updateEntry(e) {
        const newVal = e.target.dataset.type === 'number' ? parseInt(e.target.value, 10) : e.target.value
        this.setState({ [e.target.name]: newVal })
    }
    submitEntry(e) {
        e.preventDefault()

        if ( typeof(this.state.entryTitle) !== 'string' || this.state.entryTitle.length === 0 ) {
            console.log('A [Title] is required')
        } else if (
                (typeof(this.state.entryHours) !== 'number' || typeof(this.state.entryMinutes) !== 'number') ||
                (this.state.entryHours < 0 || this.state.entryHours >= this.props.countHours) ||
                (this.state.entryMinutes < 0 || this.state.entryMinutes >= this.props.countMinutes)
            ) {
            console.log('Invalid time set: It should be [0-' + (this.props.countHours-1) + ']:[0-' + (this.props.countMinutes-1) + ']')
        } else if (
                (typeof(this.state.entryCycleSelect) !== 'number') ||
                (this.state.entryCycleSelect < 0 || this.state.entryCycleSelect >= this.props.entryCycleList.length)
            ) {
            console.log('Invalid Cycle: It should be one of [' + [...this.props.entryCycleList] + ']')
        } else {

            // FORM DATA IS GOOD

            this.textInput.focus()

            // -- Send form data back to parent component callback
            this.props.setTimer(
                this.state.entryTitle,
                this.state.entryHours,
                this.state.entryMinutes,
                this.state.entryCycleSelect)

            // -- Reset local state
            this.resetState()
        }
    }
    formOptions = (idx) => {
            // Pre-ES8 (Pre-ES2017)
            // <option key={idx} value={idx}>{idx.toString().length === 1 ? '0'+idx : idx}</option>
            // ES8 (ES2017) - Couldn't get to work with Jest/Testing
            // <option key={idx} value={idx}>{idx.toString().padStart(2, '0')}</option>
        return (
            <option key={idx} value={idx}>{idx.toString().length === 1 ? '0'+idx : idx}</option>
        )
    }; // Unsure why this semi-colon is required here (at least in codepen)
    render() {
        const setSelectOptions = (maxCount, stepCount=1) => {
                let optionTags = []
                for (let ii = 0; ii<maxCount; ii+=stepCount) {
                    optionTags.push(this.formOptions(ii))
                }
                return optionTags
            },
            setSelectOptionsHours = setSelectOptions(this.props.countHours),
            setSelectOptionsMinutes = setSelectOptions(this.props.countMinutes, this.props.stepCountMinutes),
            timeProps = {
                required: true,
                onChange: this.updateEntry
            },
            countDownChars = (this.props.titleCount - this.state.entryTitle.length)

        return (
            <Form onSubmit={this.submitEntry} horizontal>
                <h2 className="hidden">Create a Timer</h2>
                <FormGroup controlId="formHorizontalTimerTitle">
                    <Col xs={5} sm={4} md={5} componentClass={ControlLabel}>
                        Timer Title <small>({countDownChars} chars)</small>
                    </Col>
                    <Col xs={7} sm={8} md={7}>
                        <input
                            type="text"
                            name="entryTitle"
                            {...timeProps}
                            value={this.state.entryTitle}
                            placeholder={this.props.titleTemp}
                            maxLength={this.props.titleCount}
                            size={this.props.titleCount}
                            autoFocus={true}
                            ref={(input) => { this.textInput = input; }}
                        />
                    </Col>
                </FormGroup>
                <FormGroup controlId="formHorizontalTimerTime" className="formHorizontalTimerTime">
                    <Col xs={5} sm={4} md={5} componentClass={ControlLabel}>
                        Time <small>(hrs/ mins/ cycle)</small>
                    </Col>
                    <Col xs={7} sm={8} md={7}>
                            <label style={{display: 'none'}}>Time <small>(hrs/ mins/ cycle)</small></label>
                            <select id="entryTimeHr" name="entryHours" data-type="number" {...timeProps} value={this.state.entryHours} size="1">
                                {setSelectOptionsHours}
                            </select>
                            <label style={{display: 'none'}}>Minutes</label>
                            <select id="entryTimeMin" name="entryMinutes" data-type="number" {...timeProps} value={this.state.entryMinutes} size="1">
                                {setSelectOptionsMinutes}
                            </select>
                            <label style={{display: 'none'}}>Cycle</label>
                            <select id="entryTimeCycle" name="entryCycleSelect" data-type="number" {...timeProps} value={this.state.entryCycle} size="1">
                                { this.props.entryCycleList.map( (cycle, idx) => <option key={idx} value={idx}>{cycle}</option> ) }
                            </select>
                    </Col>
                </FormGroup>
                <FormGroup>
                    <Col xsOffset={5} xs={7} smOffset={4} sm={8} mdOffset={5} md={7} className="add-button-div">
                        <div className="label hidden">Add It!!!</div>
                        <button id="entryButton" className="btn">Add Your Timer</button>
                    </Col>
                </FormGroup>
            </Form>
        )
    }
}
class TimerAlertPrompt extends React.Component {

   // export default class TimerAlertPrompt extends React.Component {}
        // https://cdnjs.cloudflare.com/ajax/libs/react/15.5.4/react.min.js
        // https://cdnjs.cloudflare.com/ajax/libs/react/15.5.4/react-dom.min.js
        // https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.24.0/babel.min.js

        // https://cdnjs.cloudflare.com/ajax/libs/react-bootstrap/0.31.0/react-bootstrap.js
        // import { Modal, Button, Glyphicon } from 'react-bootstrap'

    constructor(props) {
        super(props)

        this.timerSnooze = this.timerSnooze.bind(this)
        this.timerReset = this.timerReset.bind(this)
        this.timerDisable = this.timerDisable.bind(this)
    }
    timerSnooze() {
        console.log('[TimerAlertPrompt][timerSnooze] 1:', this.props.modalTimerId)
        this.props.timerSnooze(this.props.modalTimerId)
    }
    timerReset() {
        console.log('[TimerAlertPrompt][timerReset] 1:', this.props.modalTimerId)
        this.props.timerReset(this.props.modalTimerId)
    }
    timerDisable() {
        console.log('[TimerAlertPrompt][timerDisable] 1:', this.props.modalTimerId)
        this.props.timerDisable(this.props.modalTimerId)
    }
    render() {
        // const { show, user, hideDelete, userDelete } = this.props;
        // const Modal = ReactBootstrap.Modal
        // const Button = ReactBootstrap.Modal
        // const Glyphicon = ReactBootstrap.Modal
        // const { Modal, Button, Glyphicon } = 'react-bootstrap'
        // const { Modal, Button } = ReactBootstrap
        const { show, modalTitle } = this.props

        // id, time, cycleName
        let timerEntry = this.props.timerList.find( elem => (elem.id === this.props.modalTimerId) ) || {}
        timerEntry.cycleName = this.props.entryCycleList[timerEntry.cycle]

        return (
            <Modal show={show} className="modal-alert">
                <Modal.Body>
                    <Button onClick={this.timerSnooze} bsStyle="warning">Snooze <small><small>({this.props.snoozeTime} min)</small></small></Button>
                        <div className="modal-title">{modalTitle}</div>
                    <Button onClick={this.timerReset} bsStyle="success">Done <small><small>(for now)</small></small></Button>
                        <div className="modal-subtitle">[{timerEntry.time}]&nbsp;[{timerEntry.cycleName}]</div>
                    <Button onClick={this.timerDisable} bsStyle="default">Disable</Button>
                </Modal.Body>
            </Modal>
        )
    }
}
export default TimerBox