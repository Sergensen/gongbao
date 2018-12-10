import React, { Component } from 'react';
import axios from 'axios';
import { Button, Icon } from 'semantic-ui-react';

export default class SpaceKeyMode extends Component {
  constructor(props) {
    super(props);
    const { id, project, projectData } = this.props;
    this.time = 0;
    this.state={
      situations: [],
      designs: projectData.config.designs,
      design:0,
      show: 0,
      lastaction: "",
      state: 3, //0: ready? 1: situation zeigen, 2: Frage beantworten, 3: Nächste Sit erklären, 4: Finished
      userData: [
        {
          subject: id,
          project
        }
      ]
    }
  }

  componentDidMount() {
    this.preload();
    window.addEventListener('keydown', this.spaceEvent.bind(this));
  }

  undo(e) {
    const { design, schedule, show, userData } = this.state;
    const { time, clicked, situation } = userData.pop();

    userData.push({
      time,
      clicked,
      situation,
      undo: true
    });

    this.setState({
      show: show>0?show-1:schedule[design-1].length-1,
      design: show>0?design:design-1,
      userData,
      undo: time,
      state: 2
    });
  }

  spaceEvent(e) {
    const KEYPRESSED = e.key;
    const { design, designs, show, state, situations, userData } = this.state;
    switch (state) {
      case 0:
        if(KEYPRESSED===" ") {
          this.time=performance.now();
          this.setState({
            state: 1
          });
        }
        break;
      case 1:
        if(KEYPRESSED===" ") {
          this.time=performance.now()-this.time;
          this.setState({
            state: 2
          });
        }
        break;
      case 2:
        const {schedule} = this.props.projectData.config.actions;

        let allowedKeys = [];
        for(let key in schedule[design][show]) allowedKeys.push(schedule[design][show][key]+"");
        if(allowedKeys.includes(KEYPRESSED)) {
          userData.push({
            time: this.time,
            clicked: KEYPRESSED,
            situation: situations[designs[design]][show].url
          });

          const nextShow = show<situations[designs[design]].length-1?show+1:0;
          const nextDesign = show===situations[designs[design]].length-1?design+1:design;
          const nextState = nextDesign===designs.length?4:(nextShow===0?3:0);

          this.setState({
            userData,
            lastaction: KEYPRESSED,
            show: nextShow,
            design: nextDesign,
            state: nextState
          });

          if(nextState>2) this.saveData(userData, "temp");
          if(nextState===4) this.saveData(userData, "save");
        }
        break;
      case 3:
        if(KEYPRESSED==="Enter") {
          this.setState({
            state: 0
          });
        }
        break;
      default:
        break;
    }
  }

  saveData(userData, save) {
    const { subject, project } = userData[0];
    axios.get('http://localhost:3001/'+save+'/'+subject+"/"+project+"/"+JSON.stringify(userData))
    .catch(function (error) {
      console.log(error);
    });
  }

  preload() {
    const { project, projectData } = this.props;
    const { schedule, designs } = projectData.config;
    let situations = {};
    for (var i = 0; i < schedule.length; i++) {
      let situation = [];
      for(var j = 0; j < schedule[i].length; j++){
        situation.push(
          {
            url: schedule[i][j],
            payload: (
              <img
                alt="reload"
                style={styles.image}
                src={"http://localhost:3001/static/"+project+"/img/"+schedule[i][j]}
              />
            )
          }
        );
      }
      situations[designs[i]] = situation;
    }
    this.setState({ situations });
  }

  getButtonBar(backgroundColor) {
    let buttons =[];
    const {types, schedule} = this.props.projectData.config.actions;
    const {show, design} = this.state;

    for(let i in types) {
      let style = styles.button;
      for(let j in schedule[design][show]) if(parseInt(i)===schedule[design][show][j]) style = styles.activeButton;
      for(let j in schedule[design][show]) console.log(i, schedule[design][show][j]);
      buttons.push(
        <Button style={{...style, backgroundColor}} key={Math.random()}>
          {i+": "+types[i]}
        </Button>
      );
    }
    return buttons;
  }

  render() {
    const { show, design, designs, situations, state, lastaction } = this.state;
    switch (state) {
      case 0:
        return (
          <div>
            <p style={styles.question}>Ready? Press Space...</p>
            <br />
            <div style={styles.buttons}>
              {
                this.getButtonBar("#A0AFFF")
              }
            </div>
            {
              (show>0) && <Button color="blue" style={styles.undo} onClick={this.undo.bind(this)}><Icon name="undo"/>{"Last action: "+lastaction}</Button>
            }
          </div>
        );
      case 1:
        return situations[designs[design]][show].payload;
      case 2:
        return (
          <div>
            <p style={styles.question}>Which action do you choose?</p>
            <br />
            <div style={styles.buttons}>
              {
                this.getButtonBar("#B1FFA1")
              }
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <p style={styles.question}>
            {"The next design will be design: "+ designs[design]}
            <br />
            Please read the instructions.
            <br />
            Ready? Press Enter...
            </p>
          </div>
        );
      case 4:
        return <p style={styles.thanks}>Thank you for your participation.</p>;
      default:
        return;
    }
  }
}

const styles = {
  buttons: {
    display: "flex",
    flexDirection: "column",
    minWidth: 600,
    border: "1px solid black",
    borderRadius: 5,
  },
  button: {
    textAlign: "left",
    fontSize: 22,
    margin: 0,
    color: "darkgray",
    pointerEvents:"none"
  },
  activeButton: {
    textAlign: "left",
    margin: 0,
    pointerEvents:"none",
    fontSize: 22
  },
  text: {
    fontSize: 22
  },
  question: {
    fontSize: 30,
    textAlign: "center"
  },
  undo: {
    marginTop: 100,
  },
  thanks: {
    fontSize: 35,
  },
  image: {
    width: 800
  }
}
