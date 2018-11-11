import React, { Component } from 'react';
import axios from 'axios';

export default class SpaceMode extends Component {
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
    console.log(show, design);
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
        if(KEYPRESSED==="y"||KEYPRESSED==="n") {
          userData.push({
            time: this.time,
            clicked: KEYPRESSED,
            situation: situations[designs[design]][show].url
          });

          const nextShow = show<situations[designs[design]].length-1?show+1:0;
          const nextDesign = show===situations[designs[design]].length-1?design+1:design;
          const nextState = nextDesign===designs.length?4:((nextDesign===0&&nextShow===0)?3:0);

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
                src={"http://localhost:3001/static/"+project+"/subjects/"+id+"/img/"+schedule[i][j]}
              />
            )
          }
        );
      }
      situations[designs[i]] = situation;
    }
    this.setState({ situations });
  }

  render() {
    const { show, design, designs, situations, state } = this.state;
    console.log(situations);
    return (
        <div>
          {state===0 &&
            <p style={styles.question}>Ready? Press Space...</p>
          }
          {state===1 &&
            situations[designs[design]][show].payload
          }
          {state===2 &&
            <div>
              <p style={styles.question}>Was the situation critical?</p>
              <br />
              <p style={styles.text}>
                Yes (<b>y</b>), No (<b>n</b>)
              </p>
            </div>
          }
          {state===3 &&
            <p style={styles.question}>
            {"The next design will be design: "+ designs[design]}
            <br />
            Please read the instructions.
            <br />
            Ready? Press Space...
            </p>
          }
          {state===4 &&
            <p style={styles.thanks}>Thank you for your participation.</p>
          }
        </div>
    );
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
