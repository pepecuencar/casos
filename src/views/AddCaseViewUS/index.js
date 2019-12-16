import React, { Component } from 'react';
import { API, } from 'aws-amplify';
import NewCaseUS from '../../NewCaseUS';
import CasesListLoaderUS from '../../CasesListLoaderUS';


class AddCaseViewUS extends Component {
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
        <NewCaseUS onSuccess={this.fetchList} />
        <CasesListLoaderUS caseList={caseList} />
      </div>
      )
    }
}

export default AddCaseViewUS;
