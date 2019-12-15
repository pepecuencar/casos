import React, { Component } from 'react';
import {BrowserRouter as Router, Route, NavLink, Link} from 'react-router-dom';
import { Grid, Button, Confirm} from 'semantic-ui-react';
import './App.css';
import Amplify, { API } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';
import AddCaseView from './views/AddCaseView';
import AdminView from './views/AdminView';

import CaseDetailsLoader from './CaseDetailsLoader';

import aws_exports from './aws-exports';

Amplify.configure(aws_exports);

class SubmitCase extends React.Component {
  constructor(props) {
    super(props);
    this.state = { submit: false, open: false}
  }
    
  close = () => this.setState({ open: false })
  open = () => this.setState({ open: true })
  
  
  handleChange = (event) => {
    let change = {};
    change[event.target.name] = event.target.value;
    this.setState(change);
  }
  
   handleSubmit = async (event) => {
    event.preventDefault();
    const caseStatus = "En Progreso";
    let data = {
    headers: {
        'Content-Type': 'application/json'
      }, body: {
        caseStatus: caseStatus
      }
    }
    const result = await API.post("casosapi", "/casos/"+ this.props.id, data);
    console.log('Case with id: ' + this.props.id + ' updated ' );
    this.close()
  }
  
  render() {
    return (
      <div>
      <Button onClick={this.open} component={Link} to="/">Enviar Caso</Button>
        <Confirm
          open={this.state.open}
          content='Deseas enviar el caso a revision?'
          cancelButton='Cancelar'
          confirmButton="OK"
          onCancel={this.close}
          onConfirm={this.handleSubmit}
        />
        </div>
    );
  }
}

class App extends Component {
  render(){
    return (
      <Router>
        <Grid padded>
          <Grid.Column>
            <Route path="/" exact component={AddCaseView}/>
            <Route path="/casos/:caseId" render={ () => <div><NavLink to='/'>Regresar a Mis casos </NavLink></div> }/>
            <Route path="/casos/:caseId" render={props=> <CaseDetailsLoader id={props.match.params.caseId}/> }/>
            <Route path="/casos/:caseId" render={props=> <SubmitCase id={props.match.params.caseId}/>}/>
            <Route path="/admin" exact component={AdminView}/>
          </Grid.Column>
        </Grid>
      </Router>
    );
  }
}  
export default withAuthenticator(App, {includeGreetings: true});