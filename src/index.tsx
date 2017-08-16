// @APP:
    // "Done (for now)"

    // A React-based Web App Multi-Timer with custom snooze and a one-at-a-time notification queue.

    // https://kdcinfo.com/app/done-for-now/
    // Author: Keith D Commiskey

    // 'Done (for now)' provides timer alerts (via a modal) with Snooze/Done/Disable options, and an adjustable
    // snooze delay. It also provides a custom notification 'queue' which accounts for overlapping/simultaneous alerts.

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import TimerBox from './App';

// class TimerBox extends React.Component {
//     render() {
//         return <div>Haylo</div>;
//     }
// }

if (process.env.NODE_ENV !== 'production') {
    console.clear();
}

ReactDOM.render(
    <TimerBox />,
    document.getElementById('root') as HTMLElement
);