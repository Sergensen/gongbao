import React, { Component } from 'react';
import { Grid } from 'semantic-ui-react';
import KeyMode from './modes/KeyMode';
import SpaceMode from './modes/SpaceMode';
import SpaceKeyMode from './modes/SpaceKeyMode';

export default class Login extends Component {
  render() {
    const { mode } = this.props;

    return (
      <div style={styles.container}>
        {mode==="spacemode" &&
          <SpaceMode {...this.props} />
        }
        {mode==="keymode" &&
          <KeyMode {...this.props} />
        }
        {mode==="spacekeymode" &&
          <SpaceKeyMode {...this.props} />
        }
      </div>
    );
  }
}

const styles = {
  container: {
    width: "100%",
    backgroundColor: "darkgrey",
    display: "flex",
    marginTop: 50,
    justifyContent: "center",
    alignItems: "center",
  },
}
