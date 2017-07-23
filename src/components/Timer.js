import React from 'react'

import { Glyphicon } from 'react-bootstrap'

import TimeDisplay from './TimeDisplay'

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

export default Timer