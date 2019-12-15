import React, { Component } from 'react';
import { API, } from 'aws-amplify';
import CasesListLoaderAdmin from '../../CasesListLoaderAdmin';


class AdminView extends Component {
  constructor(props) {
    super(props);
    this.state = {caseName: '', caseList: []};
    }
    
  componentDidMount() {
    this.fetchList();
  }
  
  fetchList = async () => {
    console.log("cargando casos de nuevo ")
    const response = await API.get("casosapi", "/fotos");
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
        <CasesListLoaderAdmin caseList={caseList} />
      </div>
      )
    }
}

export default AdminView;