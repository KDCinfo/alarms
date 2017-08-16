import * as React from 'react';

import { Button, Modal } from 'react-bootstrap';

interface TimerListProps {
    id: number;
    title: string;
    time: string;
    cycle: number;
    active: boolean;
}

interface ModalProps {
    timerList: TimerListProps[];
    snoozeTime: number; // stateSnoozeTime,
    entryCycleList: string[];
    show: boolean;
    modalTitle: string;
    modalTimerId: number;
    timerSnooze: (entryId: number) => void;
    timerReset: (entryId: number) => void;
    timerDisable: (entryId: number) => void;
}

class TimerAlertPrompt extends React.Component<ModalProps, {}> {

   // export default class TimerAlertPrompt extends React.Component {}
        // https://cdnjs.cloudflare.com/ajax/libs/react/15.5.4/react.min.js
        // https://cdnjs.cloudflare.com/ajax/libs/react/15.5.4/react-dom.min.js
        // https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.24.0/babel.min.js

        // https://cdnjs.cloudflare.com/ajax/libs/react-bootstrap/0.31.0/react-bootstrap.js
        // import { Modal, Button, Glyphicon } from 'react-bootstrap'

    constructor(props: ModalProps) {
        super(props);

        this.timerSnooze = this.timerSnooze.bind(this);
        this.timerReset = this.timerReset.bind(this);
        this.timerDisable = this.timerDisable.bind(this);
    }
    timerSnooze() {
        // console.log('[TimerAlertPrompt][timerSnooze] 1:', this.props.modalTimerId);
        this.props.timerSnooze(this.props.modalTimerId);
    }
    timerReset() {
        // console.log('[TimerAlertPrompt][timerReset] 1:', this.props.modalTimerId);
        this.props.timerReset(this.props.modalTimerId);
    }
    timerDisable() {
        // console.log('[TimerAlertPrompt][timerDisable] 1:', this.props.modalTimerId);
        this.props.timerDisable(this.props.modalTimerId);
    }
    render() {
        // const { show, user, hideDelete, userDelete } = this.props;
        // const Modal = ReactBootstrap.Modal
        // const Button = ReactBootstrap.Modal
        // const Glyphicon = ReactBootstrap.Modal
        // const { Modal, Button, Glyphicon } = 'react-bootstrap'
        // const { Modal, Button } = ReactBootstrap
        const { show, modalTitle } = this.props;

        // id, time, cycleName

        let cycleName,
            timerEntryTime;

        // let timerEntry = this.props.timerList.find( (elem) => (elem.id === this.props.modalTimerId) )!;
            // The above gets past the TS error, but not sure it's correct.
        const timerEntry = this.props.timerList.find( (elem) => (elem.id === this.props.modalTimerId) );

        if (timerEntry) {
            timerEntryTime = timerEntry.time;
            cycleName = this.props.entryCycleList[timerEntry.cycle];
        } else {
            timerEntryTime = '';
            cycleName = '';
        }

        const modalProps = {
            show: show,
            className: 'modal-alert',
            onHide: () => undefined,
        };
        return (
            <Modal {...modalProps}>
                <Modal.Body>
                    <Button onClick={this.timerSnooze} bsStyle="warning">Snooze <small><small>({this.props.snoozeTime} min)</small></small></Button>
                        <div className="modal-title">{modalTitle}</div>
                    <Button onClick={this.timerReset} bsStyle="success">Done <small><small>(for now)</small></small></Button>
                        <div className="modal-subtitle">[{timerEntryTime}]&nbsp;[{cycleName}]</div>
                    <Button onClick={this.timerDisable} bsStyle="default">Disable</Button>
                </Modal.Body>
            </Modal>
        );
    }
}

export default TimerAlertPrompt;