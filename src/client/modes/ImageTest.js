import React, { Component } from 'react';
import axios from 'axios';
import { Button, Icon } from 'semantic-ui-react';

export default class ImageTest extends Component {
  constructor(props) {
    super(props);
    const { id, project, projectData } = this.props;
    this.time = 0;
    this.state={
      situations: [],
      designs: projectData.config.designs,
      schedule: projectData.config.schedule,
      images: projectData.config.images,
      actions: projectData.config.actions,
      design:0,
      show: 0,
      undo: false,
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

  undo(e) {
    const { design, schedule, show, userData } = this.state;
    const last = userData.pop();

    this.setState({
      show: show>0?show-1:schedule[design-1].length-1,
      design: show>0?design:design-1,
      userData,
      undo: last.time,
      state: 1
    });
  }

  componentDidMount() {
    this.preload();
    window.addEventListener('keydown', this.spaceEvent.bind(this));
  }

  spaceEvent(e) {
    const KEYPRESSED = e.key;
    const { design, designs, show, state, situations, userData, undo } = this.state;

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
        const { schedule } = this.props.projectData.config.actions;
        if(["1","2","3"].includes(KEYPRESSED)) {
          userData.push({
            time: undo?undo:performance.now()-this.time,
            clicked: schedule[design][show][KEYPRESSED-1],
            situation: situations[designs[design]][show].url
          });

          console.log(schedule[design][show][KEYPRESSED-1]);

          const nextShow = show<situations[designs[design]].length-1?show+1:0;
          const nextDesign = show===situations[designs[design]].length-1?design+1:design;
          const nextState = nextDesign===designs.length?4:(nextShow===0?3:0);

          this.setState({
            userData,
            show: nextShow,
            design: nextDesign,
            lastaction: KEYPRESSED,
            state: nextState,
            undo: false
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

  getButtonBar(margin=0) {
    const { show, design, userData, images } = this.state;
    let buttons =[];
    const { schedule } = this.props.projectData.config.actions;

    for(let key in schedule[design][show]) {
      buttons.push(
        <div key={Math.random()} style={{...styles.button, marginTop: margin}}>
          <Button>
            {parseInt(key)+1+":"}
          </Button>
          <img
            alt="reload"
            style={styles.icon}
            src={"http://localhost:3001/static/"+userData[0].project+"/actions/"+images[schedule[design][show][key]]+".png"}
          />
        </div>
      );
    }
    return buttons;
  }

  render() {
    const { show, design, designs, situations, state, lastaction } = this.state;
    switch (state) {
      case 0:
        return (
          <div style={styles.situation}>
            <div style={{width: "100%"}}>
              <p style={styles.question}>Ready? Press Space...</p>
              <div style={{width: "100%", opacity: 0}}>{situations[designs[design]][show].payload}</div>
              {
                (show>0) && <Button style={styles.undo} onClick={this.undo.bind(this)}><Icon name="undo"/>{"undo last action: "+lastaction}</Button>
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
            <p style={styles.nextDesign}>
            {"The next design will be design: "+ designs[design]}
            <br />
            <br />
            <br />
            Please read the instructions and press Enter to continue
            </p>
            {
              (design>0) && <Button style={styles.undo} onClick={this.undo.bind(this)}><Icon name="undo"/>{"undo last action: "+lastaction}</Button>
            }
          </div>
        );
      case 4:
        return <p style={styles.thanks}>Thank you for your participation.</p>;
      default:
        break;
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
    justifyContent: "space-evenly",
    minWidth: 250
  },
  nextDesign: {
    fontSize: 25,
  },
  question: {
    fontSize: 25,
    position: "absolute"
  },
  name: {
    alignSelf: "center"
  },
  icon:{
    maxWidth: "100%",
    height: 150
  },
  button: {
    display: "flex",
    flexDirection: "row",
  },
  thanks: {
    fontSize: 35,
  },
  undo: {
    position: "absolute"
  },
  image: {
    maxHeight: "90vh"
  }
}
