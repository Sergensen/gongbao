import React, { Component } from 'react';
import { Grid, Dropdown, Divider, Button, Input, Form, Message, Header } from 'semantic-ui-react';
import axios from 'axios';

export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state={
      id: "",
      project: "",
    }
  }

  handleChange(e) {
    if(e.key==="Enter") this.loadProject();

    this.setState({
      [e.target.id]: e.target.value,
    });
  }

  loadProject() {
    const { id, project } = this.state;
    const { setProject } = this.props;

    if(id===""||project==="") {
      this.setState({
        id: "",
        project: "",
      });
    } else {
      axios.get('http://localhost:3001/study/'+id+"/"+project)
      .then(function (response) {
        setProject(response.data, id, project);
      })
      .catch(function (error) {
        console.log(error);
      });
    }
  }

  render() {
    return (
      <Grid>
        <Grid.Column>
          <Divider />
          <div style={styles.container}>
            <Form>
              <Header size="huge" style={{color: "white"}}>Enter experiment</Header>
              <Form.Field>
                <label>Subject ID</label>
                <Input onKeyUp={this.handleChange.bind(this)} id="id" placeholder='Subject ID' />
              </Form.Field>
              <Form.Field>
                <label>Project ID</label>
                <Input onKeyUp={this.handleChange.bind(this)} id="project" placeholder='Project ID' />
              </Form.Field>
              <Form.Field>
                <label>Experiment mode</label>
                <Dropdown onChange={this.props.handleSelection.bind(this)} placeholder='Select mode' fluid selection options={[{text: "SpaceMode", value:"spacemode"},{text: "KeyMode", value:"keymode"},{text: "SpaceKeyMode", value:"spacekeymode"}]} />
              </Form.Field>
              <Button disabled={this.props.mode===""} onClick={this.loadProject.bind(this)}>Start</Button>
              {
                this.props.error &&
                <Message
                  color="red"
                  header='Action Forbidden'
                  content={this.props.error}
                />
              }
            </Form>
          </div>
          <Divider />
        </Grid.Column>
      </Grid>
    );
  }
}

const styles = {
  container: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
}
