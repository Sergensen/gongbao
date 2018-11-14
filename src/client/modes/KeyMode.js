import React, { Component } from 'react';
import axios from 'axios';
import { Button } from 'semantic-ui-react';

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
        const actions = this.props.projectData.config.actions;
        let allowedKeys = [];
        for(let key in actions) allowedKeys.push(actions[key].key);

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

          if(nextState===4) this.saveData(userData);
        }
        break;
      case 3:
        if(KEYPRESSED===" ") {
          this.time=performance.now();
          this.setState({
            state: 1
          });
        }
        break;
    }
  }

  saveData(userData) {
    const { subject, project } = userData[0];
    axios.get('http://localhost:3001/save/'+subject+"/"+project+"/"+JSON.stringify(userData))
    .catch(function (error) {
      console.log(error);
    });
  }

  preload() {
    const { id, project, projectData } = this.props;
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

  getButtonBar() {
    let buttons =[];
    const actions = this.props.projectData.config.actions;
    for(let key in actions) {
      buttons.push(
        <Button>
          {actions[key].key+": "+actions[key].name}
        </Button>
      );
    }
    return buttons;
  }

  render() {
    const { show, design, designs, situations, state } = this.state;
    switch (state) {
      case 0:
        return <p style={styles.question}>Ready? Press Space...</p>;
        break;
      case 1:
        return (<div>
            <p style={styles.question}>Which action do you choose?</p>
            <br />
            {
              this.getButtonBar()
            }
            <div style={{width:"100%"}}>{situations[designs[design]][show].payload}</div>
          </div>);
        break;
      case 3:
        return (
          <div>
            <p style={styles.question}>
            {"The next design will be design: "+ designs[design]}
            <br />
            Please read the instructions.
            <br />
            Ready? Press Space...
            </p>
          </div>
        );
        break;
      case 4:
        return <p style={styles.thanks}>Thank you for your participation.</p>;
        break;
    }
  }
}

const styles = {
  text: {
    fontSize: 22
  },
  question: {
    fontSize: 26
  },
  thanks: {
    fontSize: 35,
  },
  image: {
    width: 800
  }
}
