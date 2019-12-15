import React, { Component } from 'react';
import { API, } from 'aws-amplify';
import NewCase from '../../NewCase';
import CasesListLoader from '../../CasesListLoader';


class AddCaseView extends Component {
  constructor(props) {
    super(props);
    this.state = {caseName: '', caseList: []};
    }
    
  componentDidMount() {
    this.fetchList();
  }
  
  fetchList = async () => {
    console.log("cargando casos de nuevo ")
    const response = await API.get("casosapi", "/casos");
    this.setState({ caseList: [...response] });
  }

  handleChange = (event) => {
    let change = {};
    change[event.target.name] = event.target.value;
    this.setState(change);
  }

  render() {
    const { caseList } = this.state;
    return (
      <div>
        <NewCase onSuccess={this.fetchList} />
        <CasesListLoader caseList={caseList} />
      </div>
      )
    }
}

export default AddCaseView;
