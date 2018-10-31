import React, { Component } from 'react';
import axios from 'axios';
import { Button, Header } from 'semantic-ui-react';

export default class ClickMode extends Component {
  constructor(props) {
    super(props);
    const { id, project, projectData} = this.props;
    const { urls, config } = projectData;
    this.time = 0;
    this.state={
      situations: [],
      show: -1,
      hide: true,
      maxRepeat: config.repeatingsPerDesign*urls.length,
      actions: config.actions,
      userData: [
        {
          subject: id,
          project
        }
      ]
    }
    this.spaceReady=this.spaceReady.bind(this);
  }

  componentDidMount() {
    this.preload();
    window.addEventListener("keydown", this.spaceReady);
  }

  saveData(userData) {
    const { subject, project } = userData[0];
    axios.get('http://localhost:3001/save/'+subject+"/"+project+"/"+JSON.stringify(userData)).catch((error) => console.log(error));
  }

  keyAction(e) {
    const { show, userData, situations, actions } = this.state;
    let keys = [];
    for(let i in actions) keys.push(actions[i].key);
    if(keys.includes(e.key)) {
      userData.push({
        time: performance.now()-this.time,
        clicked: e.key,
        situation: situations[show].url
      });
      this.setState({
        userData,
        hide: true,
        finish: show>=situations.length-1
      });
      if(show>=situations.length-1) this.saveData(userData);
    }
  }

  saveData(userData) {
    const { subject, project } = userData[0];
    axios.get('http://localhost:3001/save/'+subject+"/"+project+"/"+JSON.stringify(userData))
    .catch(function (error) {
      console.log(error);
    });
  }

  spaceReady(e) {
    const { show, hide, situations } = this.state;
    if(e.key===" " && hide){
      this.time = performance.now();
      this.setState({
        show: show+1,
        hide: false,
      });
    } else if(e.key!==" " && !hide) {
      this.keyAction(e);
    }
  }

  fisherYates(arr) {
    let curIndex = arr.length, tempVal, randIndex;
    while (0 !== curIndex) {
      randIndex = Math.floor(Math.random() * curIndex);
      curIndex -= 1;
      tempVal = arr[curIndex];
      arr[curIndex] = arr[randIndex];
      arr[randIndex] = tempVal;
    }
    return arr;
  }

  getButtonBar() {
    const { actions } = this.props.projectData.config;
    let buttonBar = [];

    for(let action of actions) buttonBar.push(
      <Button size="huge" key={Math.random()}>{action.key+": "+action.name}</Button>
    );
    return buttonBar;
  }

  preload() {
    const { urls, config } = this.props.projectData;

    let situations = [];
    for (var i = 0; i < urls.length; i++) {
      for(var j = 0; j < config.repeatingsPerDesign; j++ ){
        situations.push(
          {
            url: urls[i],
            payload: (
              <img
                key={Math.random()}
                alt="reload"
                style={styles.image}
                src={"http://localhost:3001/static/"+this.props.project+"/img/"+urls[i]}
              />
            )
          }
        );
      }
    }
    this.setState({ situations: this.fisherYates(this.fisherYates(situations))});
  }

  render() {
    const { show, situations, finish, hide } = this.state;
    return (
        <div>
          {!finish && !hide &&
            [
              situations[show].payload,
              <div key={Math.random()} style={styles.buttonBar}>
                {this.getButtonBar()}
              </div>
            ]
          }
          {!finish && hide &&
            <Button size="huge" style={styles.ready}>Ready?</Button>
          }
          {finish &&
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
  buttonBar: {
    position: "absolute",
    bottom: 5,
    width: "100%",
    left: 0,
    textAlign: "center"
  },
  ready: {
    position: "absolute",
    bottom: 5,
    left: 0,
    width: "100%"
  },
  thanks: {
    fontSize: 35,
  }
}
