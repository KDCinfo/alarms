import React from 'react'

import { Form, FormGroup, Col, ControlLabel } from 'react-bootstrap'

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
                            <select id="entryTimeCycle" name="entryCycleSelect" data-type="number" {...timeProps} value={this.state.entryCycleSelect} size="1">
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

export default SettingsForm