import React from 'react'

class ShowSecondsForm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            showSeconds: this.props.showSeconds
        }
        this.updateShowSeconds = this.updateShowSeconds.bind(this)
        this.setLocalShowSeconds = this.setLocalShowSeconds.bind(this)
    }
    setLocalShowSeconds(e) {
        this.setState({ showSeconds: e.target.checked }, this.updateShowSeconds)
    }
    updateShowSeconds() {
      this.props.setShowSeconds(this.state.showSeconds)
    }
    render() {
        return (
            <input type="checkbox" onChange={this.setLocalShowSeconds} checked={this.state.showSeconds} />
        )
    }
}

export default ShowSecondsForm