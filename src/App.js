import React, { Component } from 'react';
import {BrowserRouter as Router, Route, NavLink, Link} from 'react-router-dom';
import { Grid, Button, Confirm} from 'semantic-ui-react';
import './App.css';
import Amplify, { API } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';
import AddCaseView from './views/AddCaseView';
import AddCaseViewUS from './views/AddCaseViewUS';
import AdminView from './views/AdminView';
import styled from "@emotion/styled";

import CaseDetailsLoader from './CaseDetailsLoader';

import aws_exports from './aws-exports';

Amplify.configure(aws_exports);

const Title = styled("h1")`
  text-align: center;
  text-transform: uppercase;
  color: #000000;
  margin-bottom: 8px;
`;

const theme = {
  formContainer: {
    margin: 0,
    padding: "8px 24px 24px"
  },
  formSection: {
    backgroundColor: "#ffffff",
    borderRadius: "4px"
  },
  sectionHeader: {
    color: "#74b49b"
  },
  sectionFooterSecondaryContent: {
    color: "#303952"
  },
  inputLabel: {
    color: "#74b49b"
  },
  input: {
    backgroundColor: "#f4f9f4",
    color: "#74b49b"
  },
  hint: {
    color: "#74b49b"
  },
  button: {
    borderRadius: "3px",
    backgroundColor: "#a7d7c5"
  },
  a: {
    color: "#a7d7c5"
  }
};


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
        'Content-Type': 'application/json',
      }, body: {
        caseStatus: caseStatus
      }
    }
    
    /*let dataMC = {
    headers: {
        'Content-Type': 'application/json',
      }
    }*/
    
    let dataLJ = {
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }, body: {
        'ManifestS3Uri': 's3://casosimgs201729-dev/filelist.manifest',
        'LabelingJobName': this.props.id,
        'S3OutputPath':'s3://casos-labelingjoboutput'
      }
    }
    
    console.log("Datos Para Creacion de Labeling Job");
    console.log(dataLJ);
    
    const resultCaseUpdate = await API.post("casosapi", "/casos/"+ this.props.id, data);
    console.log('Case with id: ' + this.props.id + ' updated ' );
    
    //const resultManifest = await API.post("casosapi", "/manifestcreator", dataLJ);
    //console.log(resultManifest);
   
    //const resultLabelingJob = await API.post("casosapi","/labelingjobs", dataLJ);
    //console.log(resultLabelingJob);
  
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
      <Title>Casos App</Title>
        <Grid padded>
          <Grid.Column>
            <Route path="/" exact component={AddCaseView}/>
            <Route path="/us" exact component={AddCaseViewUS}/>
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
export default withAuthenticator(App, {includeGreetings: true}, [], null, theme, {});