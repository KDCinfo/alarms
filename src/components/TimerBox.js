import React from 'react'

import { PanelGroup, Panel, Row, Col } from 'react-bootstrap'

import { getStorageItem, setStorageItem } from '../utilities/functions'

import SettingsForm from './SettingsForm'
import SnoozeForm from './SnoozeForm'
import ShowSecondsForm from './ShowSecondsForm'
import Timers from './Timers'
import TimerAlertPrompt from './TimerAlertPrompt'
import History from './History'

class TimerBox extends React.Component {
    constructor(props) {
        super(props)

        const storedSnoozeTime = getStorageItem(localStorage, 'snoozeTime'),
              stateSnoozeTime = storedSnoozeTime ? storedSnoozeTime : 3,
              storedShowSeconds = getStorageItem(localStorage, 'showSeconds'),
              stateShowSeconds = storedShowSeconds ? storedShowSeconds : false,
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
            showSeconds: stateShowSeconds,
        }
        this.setSnooze = this.setSnooze.bind(this)
        this.setShowSeconds = this.setShowSeconds.bind(this)
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
    setShowSeconds(showSeconds) {
        //
        this.setState(
            { showSeconds: showSeconds },
            () => {
                setStorageItem(localStorage, 'showSeconds', showSeconds)
                console.log('[setShowSeconds] Show Seconds set to:', this.state.showSeconds)
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
                                        showSeconds={this.state.showSeconds}
                                    />
                                </Col>
                            </Row>
                            <ul>
                                <li className="padTopLi2"><span className="timer-options">[Setting]</span> Snooze delay time (in minutes; for future snoozes):&nbsp;
                                    <SnoozeForm snoozeTime={this.state.snoozeTime} setSnooze={this.setSnooze} />
                                </li>
                                <li className="padTopLi"><span className="timer-options">[Setting]</span> Always show seconds (checked), or only during last minute (unchecked):&nbsp;
                                    <ShowSecondsForm showSeconds={this.state.showSeconds} setShowSeconds={this.setShowSeconds} />
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
                                    <li className="btn-warning">@TODO: Convert to React Native (<b><i>learn React Native</i></b>)</li>
                                </ul>
                            </div>
                        </Panel>
                        <Panel header="App History" eventKey="3" bsStyle="info">
                            <History />
                        </Panel>
                        <Panel header="Process Flowchart" eventKey="4" bsStyle="info">
                            <div>
                                <img className="flowchart" src="//kdcinfo.com/app/done-for-now/flowchart/done-for-now.svg" alt="Process Flowchart" />
                            </div>
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

export default TimerBox