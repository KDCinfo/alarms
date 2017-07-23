import React from 'react'

import { Table } from 'react-bootstrap'

import Timer from './Timer'

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

export default Timers