import React, { Component } from 'react';
import axios from 'axios';

export default class SpaceMode extends Component {
  constructor(props) {
    super(props);
    const { id, project, projectData} = this.props;
    const { urls, config } = projectData;
    this.time = 0;
    this.state={
      situations: [],
      show: 0,
      finish: false,
      hide: true,
      situation: false,
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
    window.addEventListener('click', this.clickEvent.bind(this));
  }

  saveData(userData) {
    const { subject, project } = userData[0];
    axios.get('http://localhost:3001/save/'+subject+"/"+project+"/"+JSON.stringify(userData)).catch((error) => console.log(error));
  }

  spaceEvent(e) {
    const { show, hide, maxRepeat, finish, situation, userData, situations } = this.state;
    if(e.key==="n"||e.key==="y") {
      userData.push({
        time: this.time,
        clicked: e.key,
        situation: situations[show].url
      });
      this.setState({userData});
    }
    if(e.key===" "|| e.key==="n"||e.key==="y") {
      if(!finish&&hide) this.time = performance.now();
      if(situation) this.time = performance.now()-this.time;
      this.setState({
        show: show+1,
        finish: show>=maxRepeat-1||finish,
        hide: !finish&&!hide?true:false,
        question: !finish&&!hide?true:false,
        situation: !finish&&hide
      });
      if (show>=maxRepeat-1||finish) this.saveData(userData);
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
                alt="reload"
                style={styles.image}
                src={"http://localhost:3001/static/"+this.props.project+"/img/"+urls[i]}
              />
            )
          }
        );
      }
    }
    this.setState({ situations: this.fisherYates(this.fisherYates(situations)) });
  }

  render() {
    const { show, situations, finish, hide, situation } = this.state;
    return (
        <div>
          {situation && situations[show].payload}
          {!finish && hide &&
            <p style={styles.question}>Ready?</p>
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
  thanks: {
    fontSize: 35,
  }
}
