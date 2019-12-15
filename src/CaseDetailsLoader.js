import React from 'react';
import { API, Auth, Storage } from 'aws-amplify';
import { Divider, Form,Header, Segment } from 'semantic-ui-react';
import { S3Image } from 'aws-amplify-react';
import {v4 as uuid} from 'uuid';

class CaseDetails extends React.Component {
  render() {
    return (
        <Segment>
          <Header as='h3'>Imagenes.</Header>
          <p>PROHIBIDO SUBIR CONTENIDO SUGESTIVO.</p>
          <S3ImageUpload photoCaseId={this.props.id}/>
          <PhotosList photos={this.props.caso} />
      </Segment>
    );
  }
}
class S3ImageUpload extends React.Component {
  constructor(props) {
    super(props);
    this.state = { uploading: false }
  }
  uploadFile = async (file) => {
    const fileName = uuid();
    const user = await Auth.currentAuthenticatedUser();

  const result = await Storage.put(
    fileName, 
    file, 
      {
        customPrefix: { public: 'uploads/' },
        metadata: { caseid: this.props.photoCaseId, owner: user.username }
      }
    );
    console.log('Uploaded file: ', result);
  }

  onChange = async (e) => {
    this.setState({uploading: true});
    
    let files = [];
    for (var i=0; i<e.target.files.length; i++) {
      files.push(e.target.files.item(i));
    }
    await Promise.all(files.map(f => this.uploadFile(f)));

    this.setState({uploading: false});
    
  }

  render() {
    return (
      <div>
        <Form.Button
          onClick={() => document.getElementById('add-image-file-input').click()}
          disabled={this.state.uploading}
          icon='file image outline'
          content={ this.state.uploading ? 'Uploading...' : 'Agregar Imagen' }
        />
        <input
          id='add-image-file-input'
          type="file"
          accept='image/*'
          multiple
          onChange={this.onChange}
          style={{ display: 'none' }}
        />
        </div>
    );
  }
}

class PhotosList extends React.Component {
   componentDidMount() {
    this.photoItems();
  }
  
  photoItems() {
    return this.props.photos.map(photo => 
    <S3Image 
        key={photo.thumbnail.key} 
        imgKey={photo.thumbnail.key.replace('public/', '')} 
        style={{display: 'inline-block', 'paddingRight': '5px'}}
      />
    );
  }

  render() {
    return (
      <div>
        <Divider hidden />
        {this.photoItems()}
      </div>
    );
  }
}

class CaseDetailsLoader extends React.Component{
  constructor(props) {
    super(props);
    this.state = { caso: []}
  }
  async componentDidMount() {
    await this.fetchList();
  }
  async fetchList() {
    const response = await API.get("casosapi", "/casos/" + this.props.id);
    this.setState({ caso: [...response] });
  }
  render() {
        return (<CaseDetails caso={this.state.caso} id={this.props.id}/> );
  }
}


export default CaseDetailsLoader;