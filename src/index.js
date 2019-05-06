import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

//Component for 'plus' and 'minus' buttons of clock
class SettingButton extends React.Component {
  constructor(props) {
    super(props);

    this.handlePlus = this.handlePlus.bind(this);
    this.handleMinus = this.handleMinus.bind(this);
  }

  //If clock is not running, increase pastValue (session or break) by 1
  handlePlus() {
    if (this.props.running) {
    } else if (this.props.id === "session-button") {
      this.props.setSession(this.props.pastValue + 1);
    } else if (this.props.id === "break-button") {
      this.props.setBreak(this.props.pastValue + 1);
    }
  }
  //If clock is not running, decrease pastValue (session or break) by 1
  handleMinus() {
    if (this.props.running) {
    } else if (this.props.id === "session-button") {
      this.props.setSession(this.props.pastValue - 1);
    } else if (this.props.id === "break-button") {
      this.props.setBreak(this.props.pastValue - 1);
    }
  }
  render() {
    return (
      <div className="setting-container">
        <div id={this.props.labelID} className="setting-label">
          {this.props.label}
        </div>
        <div
          id={this.props.plusID}
          className="updown"
          type="plus"
          onClick={this.handlePlus}
        >
          +
        </div>
        <div id={this.props.lengthID} className="length-label">
          {this.props.time}
        </div>
        <div
          id={this.props.minusID}
          className="updown"
          type="minus"
          onClick={this.handleMinus}
        >
          -
        </div>
      </div>
    );
  }
}

//Main clock component
class Pomodoro extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      //True if clock is running
      running: false,
      //Time clock is started
      startTime: null,
      //Total milliseconds past
      totalMillis: 0,
      //Total milliseconds stored when clock is stopped
      storeMillis: 0,
      //Id of setInterval that keeps time
      intervalID: null,
      //Number of 'session' minutes the clock is set for
      numSesMins: 25,
      //Number of 'break' minutes clock is set for
      numBrkMins: 5,
      //Label displayed on clock, either "Session" or "Break"
      label: "Session"
    };

    this.startTime = this.startTime.bind(this);
    this.stopTime = this.stopTime.bind(this);
    this.increment = this.increment.bind(this);
    this.handleStartStop = this.handleStartStop.bind(this);
    this.initializeTime = this.initializeTime.bind(this);
    this.setBreak = this.setBreak.bind(this);
    this.setSession = this.setSession.bind(this);
    this.reset = this.reset.bind(this);
  }

  //If running, call stopTime, else call startTime
  handleStartStop() {
    if (!this.state.running) {
      this.startTime();
    } else {
      this.stopTime();
    }
  }
  //Sets startTime to current Date
  initializeTime() {
    const d = new Date();
    this.setState({ startTime: d.getTime() });
  }
  //Initializes time, sets clock running to true and sets time increment interval
  startTime() {
    this.initializeTime();
    this.setState({ running: true });
    this.setState({
      intervalID: setInterval(() => {
        this.increment();
        this.ender();
      }, 100)
    });
  }
  //Sets 'running' to false and stores the total number of milliseconds that have
  //passed.  Also clears the previous time interval.
  stopTime() {
    this.setState({ running: false, storeMillis: this.state.totalMillis });
    clearInterval(this.state.intervalID);
  }
  //Increments time (called within setInterval)
  increment(start) {
    //Initialize date object
    const current = new Date();
    //Set totalMillis to the difference between current time and startTime,
    //plus any millis stored after clock's last stop.
    this.setState({
      totalMillis:
        current.getTime() - this.state.startTime + this.state.storeMillis
    });
  }
  //set numBrkMins to time if time between 0 and 60
  setBreak(time) {
    if (time <= 60 && time > 0) {
      this.setState({ numBrkMins: time });
    }
  }
  //set numSesMins to time if time between 0 and 60
  setSession(time) {
    if (time <= 60 && time > 0) {
      this.setState({ numSesMins: time });
    }
  }
  //Handles timer ending
  ender() {
    //Number of minutes timer is set to, depending on if session or break
    const alarmMins =
      this.state.label === "Session"
        ? this.state.numSesMins
        : this.state.numBrkMins;
    //If time goes below 0 (999 is a buffer so time doesn't decrement immediately)
    if (999 + alarmMins * 60000 - this.state.totalMillis < 0) {
      //and it is a session, play alarm sound
      if (this.state.label === "Session") {
        this.playBeep();
      }
      //Toggle from session to break or vice versa
      this.state.label === "Session" ? this.breakTime() : this.sessionTime();
    }
  }
  //Plays html audio tag's mp3
  playBeep() {
    let sound = document.getElementById("beep");
    sound.play();
    setTimeout(() => {
      sound.pause();
      sound.currentTime = 0;
    }, 4500);
  }
  //Initialize and reset time, switch to break mode
  breakTime() {
    this.initializeTime();
    this.setState({
      totalMillis: 0,
      storeMillis: 0,
      label: "Break"
    });
  }
  //Initialize and reset time, switch to session mode
  sessionTime() {
    this.initializeTime();
    this.setState({
      totalMillis: 0,
      storeMillis: 0,
      label: "Session"
    });
  }
  //Resets timer to default state, and pauses alarm sound
  reset() {
    let sound = document.getElementById("beep");
    sound.pause();
    sound.currentTime = 0;
    this.stopTime();
    this.setState({
      running: false,
      startTime: null,
      totalMillis: 0,
      storeMillis: 0,
      intervalID: null,
      numSesMins: 25,
      numBrkMins: 5,
      label: "Session"
    });
  }
  render() {
    //Number of minutes timer is set for (session or break)
    let alarmMins =
      this.state.label === "Session"
        ? this.state.numSesMins
        : this.state.numBrkMins;
    //Milliseconds remaining on timer (999 is buffer)
    const millisRemaining = 999 + alarmMins * 60000 - this.state.totalMillis;
    const secondsRemaining = Math.floor(millisRemaining / 1000);
    const minutes = Math.floor(secondsRemaining / 60);
    const seconds = secondsRemaining % 60;
    //Format minutes and seconds (xx:xx)
    const formatSeconds = ("0" + seconds).slice(-2);
    const formatMinutes = ("0" + minutes).slice(-2);

    return (
      <div id="container">
        <h1>Pomodoro Clock</h1>
        <audio
          id="beep"
          src="http://www.ffmages.com/ffvii/ost/disc-1/11-fanfare.mp3"
          type="audio/mpeg"
        />
        <div id="clock-container">
          <div id="timer-label">{this.state.label}</div>
          <div id="time-left">{formatMinutes + ":" + formatSeconds}</div>
        </div>
        <div id="btn-panel">
          <SettingButton
            id="session-button"
            label="Session Length"
            time={this.state.numSesMins}
            pastValue={this.state.numSesMins}
            setSession={this.setSession}
            running={this.state.running}
            labelID="session-label"
            plusID="session-increment"
            minusID="session-decrement"
            lengthID="session-length"
          />
          <div id="start-reset">
            <div id="start_stop" onClick={this.handleStartStop}>
              {this.state.running ? "Stop" : "Start"}
            </div>
            <div id="reset" onClick={this.reset}>
              Reset
            </div>
          </div>
          <SettingButton
            id="break-button"
            label="Break Length"
            time={this.state.numBrkMins}
            pastValue={this.state.numBrkMins}
            setBreak={this.setBreak}
            running={this.state.running}
            labelID="break-label"
            plusID="break-increment"
            minusID="break-decrement"
            lengthID="break-length"
          />
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Pomodoro />, document.getElementById("root"));
