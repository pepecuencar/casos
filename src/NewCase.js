import React, { Component } from 'react';
import{ API, Auth } from 'aws-amplify';
import {Header, Input, Segment } from 'semantic-ui-react';


class NewCase extends Component {
  constructor(props) {
    super(props);
    this.state = {caseName: ''};
    }

  handleChange = (event) => {
    let change = {};
    change[event.target.name] = event.target.value;
    this.setState(change);
  }

  handleSubmit = async (event) => {
    event.preventDefault();
    const user = await Auth.currentAuthenticatedUser();
    const caseName = this.state.caseName;
    let data = {
      headers: {
        'Content-Type': 'application/json'
      }, body: {
        owner: user.username,
        name: caseName
      }
    }
    const result = await API.post("casosapi", "/casos", data);
    console.info('Created case with id: ' + result);
    if(result) {
      this.props.onSuccess();
    }
    this.setState({caseName:''}); 
  }

  render() {
    return (
      <Segment>
        <Header as='h3'>Crear un caso</Header>
          <Input
          type='text'
          placeholder='Nombre del Caso'
          icon='plus'
          iconPosition='left'
          action={{ content: 'Crear', onClick: this.handleSubmit }}
          name='caseName'
          value={this.state.caseName}
          onChange={this.handleChange}
          />
        </Segment>
      )
    }
}

export default NewCase;
