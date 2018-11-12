import React, { Component } from 'react';
import Login from './Login';
import Application from './Application';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      projectLoaded: false,
      projectData: {},
      error: "",
      mode: "spacemode"
    }
  }

  handleSelection = (e, { value }) => this.setState({ mode: value })

  setProject(projectData, id, project) {
    const { success, message } = projectData;
    if(success) {
      this.setState({
        projectLoaded: true,
        projectData,
        id,
        project,
      });
    } else {
      this.setState({
        projectLoaded: false,
        error: message
      });
    }
  }

  render() {
    const { projectLoaded, projectData, error, id, project, mode } = this.state;
    return projectLoaded?
      <Application mode={mode} projectData={projectData} id={id} project={project} />
    :
      <Login mode={mode} handleSelection={this.handleSelection.bind(this)} error={error} setProject={this.setProject.bind(this)} />
    ;
  }
}

export default App;

const styles = {
  container: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
}
