import React from 'react'

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
            tmpTimeDisplay,
            showSeconds = false

        if (this.props.targetTime === 0) {
            this.setState({ tTimeDisplay: '' })
        } else {
            tDateDiff = (this.props.targetTime - Date.now())
            // tDateMin = Math.floor(tDateDiff / 60000)
            // tDateSec = ((tDateDiff % 60000) / 1000).toFixed(0)
            tDateSec = parseInt((tDateDiff / 1000) % 60, 10)
            tDateMin = parseInt((tDateDiff / (1000 * 60)) % 60, 10)
            tDateHr = parseInt((tDateDiff / (1000 * 60 * 60)) % 24, 10)

            tDateHr = (tDateHr <= 0) ? 0 : tDateHr
            tDateMin = (tDateMin <= 0) ? 0 : tDateMin
            tDateSec = (tDateSec <= 0) ? 0 : tDateSec

            showSeconds = (tDateHr === 0 && tDateMin === 0) || this.props.showSeconds

            tDateHr = (tDateHr < 10) ? "0" + tDateHr : tDateHr
            tDateMin = (tDateMin < 10) ? "0" + tDateMin : tDateMin
            tDateSec = (tDateSec < 10) ? "0" + tDateSec : tDateSec

            // return minutes + ":" + (seconds < 10 ? '0' : '') + seconds
            // return (seconds == 60 ? (minutes+1) + ":00" : minutes + ":" + (seconds < 10 ? '0' : '') + seconds)

            if (!showSeconds) {
                tmpTimeDisplay = tDateHr + ':' + tDateMin
            } else {
                tmpTimeDisplay = tDateHr + ':' + tDateMin + ':' + tDateSec
            }

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

export default TimeDisplay