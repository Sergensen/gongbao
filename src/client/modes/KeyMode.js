import React, { Component } from 'react';
import axios from 'axios';
import { Button, Icon } from 'semantic-ui-react';
import config from '../../config';

export default class KeyMode extends Component {
  constructor(props) {
    super(props);
    const { id, project, projectData } = this.props;
    this.time = 0;
    this.state={
      situations: [],
      designs: projectData.config.designs,
      schedule: projectData.config.schedule,
      design:0,
      show: 0,
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
        const { standard } = this.props.projectData.config.actions;
        let allowedKeys = [];
        for(let key in standard) allowedKeys.push(standard[key].key);

        if(allowedKeys.includes(KEYPRESSED)) {
          userData.push({
            time: performance.now()-this.time,
            clicked: KEYPRESSED,
            situation: situations[designs[design]][show].url
          });

          const nextShow = show<situations[designs[design]].length-1?show+1:0;
          const nextDesign = show===situations[designs[design]].length-1?design+1:design;
          const nextState = nextDesign===designs.length?4:(nextShow===0?3:0);

          this.setState({
            userData,
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
        return;
    }
  }

  saveData(userData, save) {
    const { subject, project } = userData[0];
    axios.get('http://'+config.apiUrl+':'+config.port+'/'+save+'/'+subject+"/"+project+"/"+JSON.stringify(userData))
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
                src={'http://'+config.apiUrl+':'+config.port+'/static/'+project+'/img/'+schedule[i][j]}
              />
            )
          }
        );
      }
      situations[designs[i]] = situation;
    }
    this.setState({ situations });
  }

  undo(e) {
    const { design, schedule, show, userData } = this.state;

    userData.pop();

    this.setState({
      show: show>0?show-1:schedule[design-1].length-1,
      design: show>0?design:design-1,
      userData,
      state: 1
    });
  }

  getButtonBar(margin=0) {
    let buttons =[];
    const {standard} = this.props.projectData.config.actions;
    for(let key in standard) {
      buttons.push(
        <div key={Math.random()} style={{...styles.button, marginTop: margin}}>
          <Button>
            {standard[key].key+": "}
          </Button>
          <p style={styles.name}>{standard[key].name}</p>
        </div>
      );
    }
    return buttons;
  }

  render() {
    const { show, design, designs, situations, state } = this.state;
    switch (state) {
      case 0:
        return (
          <div style={styles.situation}>
            <div style={{width: "100%"}}>
              <p style={styles.question}>Ready? Press Space...</p>
              {
                (show>0) && <Button color="blue" onClick={this.undo.bind(this)}><Icon name="undo"/>undo</Button>
              }
            </div>
            <div style={styles.buttonbar}>{this.getButtonBar(15)}</div>
          </div>);
      case 1:
        return (
          <div style={styles.situation}>
            <div style={{width: "100%"}}>{situations[designs[design]][show].payload}</div>
            <div style={styles.buttonbar}>{this.getButtonBar()}</div>
          </div>);
      case 3:
        return (
          <div>
            <p style={styles.question}>
            {"The next design will be design: "+ designs[design]}
            <br />
            <br />
            <br />
            Please read the instructions and press Enter to continue
            </p>
            {
              (design>0) && <Button color="blue" onClick={this.undo.bind(this)}><Icon name="undo"/>undo</Button>
            }
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
  situation : {
    display: "flex",
    flexDirection: "row",
  },
  buttonbar: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-evenly"
  },
  question: {
    fontSize: 25
  },
  name: {
    alignSelf: "center"
  },
  button: {
    display: "flex",
    flexDirection: "row",
  },
  thanks: {
    fontSize: 35,
  },
  image: {
    maxHeight: "90vh"
  }
}
