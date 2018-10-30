import React, { Component } from 'react';
import axios from 'axios';
import { Button } from 'semantic-ui-react';

export default class KeyMode extends Component {
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
  }

  saveData(userData) {
    const { subject, project } = userData[0];
    axios.get('http://localhost:3001/save/'+subject+"/"+project+"/"+JSON.stringify(userData)).catch((error) => console.log(error));
  }

  clickButton(e) {
    const { show, userData, situations } = this.state;
    userData.push({
      time: performance.now()-this.time,
      clicked: e.target.id,
      situation: situations[show].url
    });
    this.setState({
      userData,
      hide: true,
      finish: show>=situations.length-1
    });
    if(show>=situations.length-1) this.saveData(userData);
  }

  saveData(userData) {
    const { subject, project } = userData[0];
    axios.get('http://localhost:3001/save/'+subject+"/"+project+"/"+JSON.stringify(userData))
    .catch(function (error) {
      console.log(error);
    });
  }

  clickReady(e) {
    const { show, hide, situations } = this.state;
    this.time = performance.now();
    this.setState({
      show: show+1,
      hide: false,
    });
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
      <Button key={Math.random()} onClick={this.clickButton.bind(this)} id={action}>{action}</Button>
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
            <Button size="huge" onClick={this.clickReady.bind(this)} style={styles.question}>Ready?</Button>
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
    textAlign: "center"
  },
  thanks: {
    fontSize: 35,
  }
}
