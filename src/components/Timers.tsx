import * as React from 'react';

import { Table } from 'react-bootstrap';

import Timer from './Timer';

interface TimerListState {
    id: number;
    title: string;
    time: string;
    cycle: number;
    active: boolean;
}

interface TimeoutListState {
    id: number;
    timer: number;
}

interface TimerDisplayListState {
    id: number;
    destination: number;
}

interface TimersProps {
    removeTimer: (timerId: number) => void;                     // removeTimer(timerId: number) {
    toggleTimeout: (timerId: number, onOff: string) => void;    // toggleTimeout(timerId: number, onOff: string) {
    timerList: TimerListState[];
    timeoutList: TimeoutListState[];
    timerDisplayList: TimerDisplayListState[];
    entryCycleList: string[];
    showSeconds: boolean;
}

class Timers extends React.Component<TimersProps, {}> {
    constructor(props: TimersProps) {
        super(props);
    }
    render() {
        // console.log('[Timers] 1:', this.props.timeoutList)
        // console.log('[Timers] 2:', this.props.timerDisplayList)
        return (
            <div className="timers-div">
                <Table responsive={true}>
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
                        { this.props.timerList.map( (entry, idx: number) =>
                            <Timer
                                key={idx}
                                entry={entry}
                                timeoutList={this.props.timeoutList}
                                timerDisplayList={this.props.timerDisplayList}
                                entryCycleList={this.props.entryCycleList}
                                toggleTimeout={this.props.toggleTimeout}
                                removeTimer={this.props.removeTimer}
                                showSeconds={this.props.showSeconds}
                            />
                        )}
                    </tbody>
                </Table>
            </div>
        );
    }
}

export default Timers;