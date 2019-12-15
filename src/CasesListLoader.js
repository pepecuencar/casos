import React from 'react';
import {Header,Segment, Table } from 'semantic-ui-react';

function makeComparator(key, order='asc') {
  return (a, b) => {
    if(!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) return 0; 

    const aVal = (typeof a[key] === 'string') ? a[key].toUpperCase() : a[key];
    const bVal = (typeof b[key] === 'string') ? b[key].toUpperCase() : b[key];

    let comparison = 0;
    if (aVal > bVal) comparison = 1;
    if (aVal < bVal) comparison = -1;

    return order === 'desc' ? (comparison * -1) : comparison
  };
}


class CasesListLoader extends React.Component{
  constructor(props) {
    super(props);
    this.state = {caso: [], caseList: this.props.caseList};
  }
  
  componentWillReceiveProps(nextProps) {
    const { caseList } = this.props
    console.log(nextProps.caseList !== caseList);
       this.setState({ caseList: nextProps.caseList });
       console.log( this.state.caseList);
  }
  
  caseItems = () => {
    const { caseList } = this.state;
    
    console.log("Case list:", caseList);
    
    if (caseList) {
      return caseList.sort(makeComparator('name')).map(caso =>
    <Table.Row key={caso.id}>
        <Table.Cell > <a href={'/casos/' + caso.id}> {caso.name} </a>
        </Table.Cell>
        <Table.Cell>{caso.caseStatus}</Table.Cell>
        <Table.Cell>{caso.allocation}</Table.Cell>
      </Table.Row>
    );
    }
    
  }

  render() {
    return (
      <Segment>
        <Header as='h3'>Mis Casos</Header>
       <Table celled>
        <Table.Header>
            <Table.Row><Table.HeaderCell>Nombre</Table.HeaderCell><Table.HeaderCell>Estatus</Table.HeaderCell><Table.HeaderCell>Asignacion</Table.HeaderCell>
            </Table.Row>
        </Table.Header>
        <Table.Body>
            {this.caseItems()}
        </Table.Body>
        </Table>
      </Segment>
    );
  }
}

export default CasesListLoader;