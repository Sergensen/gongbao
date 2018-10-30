import React, { Component } from 'react';
import { Grid } from 'semantic-ui-react';
import Clickmode from './modes/ClickMode';
import SpaceMode from './modes/SpaceMode';
import KeyMode from './modes/KeyMode';

export default class Login extends Component {
  render() {
    const { mode } = this.props;

    return (
      <Grid style={{backgroundColor: "darkgrey"}}>
        <div style={styles.container}>
          {mode==="spacemode" &&
            <SpaceMode {...this.props} />
          }
          {mode==="clickmode" &&
            <Clickmode {...this.props} />
          }
          {mode==="keymode" &&
            <KeyMode {...this.props} />
          }
        </div>
      </Grid>
    );
  }
}

const styles = {
  container: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    height: "75vh",
    alignItems: "center",

  },
}
