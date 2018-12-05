const config = {
  base: 'http://bureaudesconsultations.mm/v1/api',
  rest: 'http://bureaudesconsultations.mm',
};

const API_ROOT = `${config.base}`;

const headers = new Headers({
  'Accept': 'application/hal+json',
  'Content-Type': 'application/hal+json',
  'Cache': 'no-cache'
});


let Appbar = mui.react.Appbar,
  Container = mui.react.Container,
  Form = mui.react.Form,
  Input = mui.react.Input,
  Textarea = mui.react.Textarea,
  Button = mui.react.Button,
  Option = mui.react.Option,
  Select = mui.react.Select;


class App extends React.Component {
  constructor() {
    super();
    this.state = {
      data: null,
      addnew: false,
    };
    this.loadNodeData = this.loadNodeData.bind(this);
    this.postNode = this.postNode.bind(this);
    this.patchNode = this.patchNode.bind(this);
    this.deleteNode = this.deleteNode.bind(this);
    this.fetchJsonApiGet = this.fetchJsonApiGet.bind(this);
    this.fetchJsonApiPost = this.fetchJsonApiPost.bind(this);
    this.fetchJsonApiPatch = this.fetchJsonApiPatch.bind(this);
    this.fetchJsonApiDelete = this.fetchJsonApiDelete.bind(this);
    this.updateData = this.updateData.bind(this);
    this.checkInvalidData = this.checkInvalidData.bind(this);
  }

  componentWillMount() {
    this.loadNodeData();
  }

  // GET
  // Get list of node content & store in this.state.data
  loadNodeData() {
    this.fetchJsonApiGet('data', `${API_ROOT}/vers?_format=json`, true);
  }

  // Update the data object in state, optionally validating.
  updateData(destination, responseData, validate = true) {
    const validatedData = this.checkInvalidData(responseData, validate);
    if (validatedData || validate === false) {
      //  console.log(responseData);
      this.setState({ [destination]: responseData }, () => console.log(this.state));
    }
  }

  // Check that the data response is in the format we expect.
  checkInvalidData(data, validate = true) {
    if (validate) {
      if (data === null) {
        return false;
      }
      if (data.results === undefined ||
        data.results === null) {
        return false;
      }
      return true;
    }
    return true;
  }

  // Helper function wraps a normal fetch call with a fetch request that first
  // retrieves a CSRF token and then adds the token as an X-CSRF-Token header
  // to the options for desired fetch call.
  //
  // Use this in place of fetch() for any write/update operations like POST,
  // PATCH, and DELETE.
  fetchWithCSRFToken(url, options) {
    return fetch(`${config.rest}/rest/session/token?_format=json`)
      .then(response => response.text())
      .then((csrfToken) => {
        options.headers.append('X-CSRF-Token', csrfToken);
        return fetch(url, options);
      })
      .catch(err => console.log('Unable to obtain CSRF token:', err));
  }

  // Perform GET request. If successful, update state.
  fetchJsonApiGet(destination, url) {
    // console.log(url);
    fetch(url)
      .then(function (response) {
        return response.json();
      })
      .then((data) => this.updateData(destination, data))
      .catch(err => console.log('API error:', err));
  }

  // POST
  postNode(data) {
    console.log(data);
    this.fetchJsonApiPost('patch', `${config.rest}/entity/node?_format=hal_json`, data);
  }

  fetchJsonApiPost(destination, url, postData) {
    this.fetchWithCSRFToken(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers,
      body: JSON.stringify(postData)
    })
      .then(function (response) {
        return response.json();
      })
      .then((data) => {
        this.updateData(destination, data, false);
        this.loadNodeData();
      })
      .catch(err => console.log('API error:', err));
  }

  // PATCH
  patchNode(nid, data) {
    if (nid !== undefined &&
      nid !== null &&
      data !== undefined &&
      data !== null) {
      this.fetchJsonApiPatch('patch', `${config.rest}/node/${nid}/?_format=hal_json`, data);
    }
  }

  fetchJsonApiPatch(destination, url, update) {
    this.fetchWithCSRFToken(url, {
      method: 'PATCH',
      credentials: 'same-origin',
      headers,
      body: JSON.stringify(update)
    })
      .then(function (response) {
        return response.json();
      })
      .then((data) => {
        this.updateData(destination, data, false);
        this.loadNodeData();
      })
      .catch(err => console.log('API error:', err));
  }

  // DELETE
  deleteNode(nid) {
    if (nid !== undefined && nid !== null) {
      this.fetchJsonApiDelete('delete', `${config.rest}/node/${nid}?_format=hal_json`);
    }
  }

  fetchJsonApiDelete(destination, url) {
    this.fetchWithCSRFToken(url, {
      method: 'DELETE',
      credentials: 'same-origin',
      headers
    })
      .then(function (response) {
        // Should be 204
        console.log(response);
        return response;
      })
      .then((data) => {
        this.fetchJsonApiGet('data', `${API_ROOT}/vers?_format=json`);
      })
      .catch(err => console.log('API error:', err));
  }

  render() {
    let styles = {
      buttons: {
        margin: '30px',
      },
      buttonsElement: {
        border: '0px solid #000',
        padding: '3px 10px'
      },
    }
    return (
      <div className="App">
        <h2>All Articles</h2>
        <Container>
          <NodeNew postNode={this.postNode} />
          <NodeList
            data={this.state.data}
            patchNode={this.patchNode}
            deleteNode={this.deleteNode}
          />
        </Container>
      </div>
    );
  }

}

class NoData extends React.Component {
  render() {
    return <div>No pages found.</div>;
  }
}

class NodeDelete extends React.Component {
  constructor() {
    super();
    this.state = {
      confirm: false,
    }
    this.deleteNode = this.deleteNode.bind(this);
    this.showConfirm = this.showConfirm.bind(this);
    this.cancelDelete = this.cancelDelete.bind(this);
  }

  deleteNode(id) {
    console.log(id);
    this.props.deleteNode(id);
    this.cancelDelete();
  }

  showConfirm() {
    this.setState({ confirm: true });
  }

  cancelDelete() {
    this.setState({ confirm: false });
  }

  render() {
    let style = {
      panel: {
        margin: '0px',
        padding: '0px',
        backgroundColor: 'transparant',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'baseline'
      },
      inactive: {
        color: '#DDD',
      },
      nav: {
        margin: '0px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'baseline'
      },
      buttonsElement: {
        border: '0px solid #000',
        padding: '3px 10px',
        color: '#ccc',
        backgroundColor: '#ffffff',
      }
    };
    return (
      <div style={style.nav}>
        {this.state.confirm === false &&
          <button style={style.buttonsElement} onClick={() => this.showConfirm()}>
            <i class="fas fa-trash-alt"></i>
          </button>
        }
        
        {this.state.confirm === true &&
          <div style={style.panel}>
            <div>Vraiment?</div><br />
            <button style={style.buttonsElement} onClick={() => this.deleteNode(this.props.nid)}>O</button>
            <button style={style.buttonsElement} onClick={() => this.cancelDelete()}>N</button>
          </div>
        }
      </div>
    );
  }
}

class NodeEdit extends React.Component {
  constructor(props) {
    super();
    this.state = {
      field_title: props.title,
      field_legende: props.field_legende,
      field_authors_books: props.field_authors_books,
      field_authors_books_tid: props.field_authors_books_tid, 
      selected_authors_books: props.field_authors_books_tid ? props.field_authors_books_tid : [],
      authors: null,
      addAuthor: false,
      searchAuthors: [],
      searchAuthorsString: '',
    };
    this.patchNode = this.patchNode.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.updateTerm = this.updateTerm.bind(this);
  }

  componentWillMount() {
    this.loadNodeAuthors();
  }

  // GET
  // Get list of node content & store in this.state.authors
  loadNodeAuthors() {
    this.fetchJsonApiGet('authors', `${API_ROOT}/figures/all?_format=json`, true);
  }

  // Get list of node content & store in this.state.authors
  searchAuthors(string) {
    if (string.length > 3) {
      this.fetchJsonApiGet('searchAuthors', `${API_ROOT}/figures/search?_format=json&name=${string}`, true);
      this.setState({ searchAuthorsString: string }); 
    }else{
      this.setState({ searchAuthors: [] });
      this.setState({ searchAuthorsString: '' }); 
    }
  }

  patchNode() {
    let author = this.state.field_authors_books_tid.length > 0 ? [{ target_id: this.state.field_authors_books_tid }] : [];
    let data = {
      _links: {
        type: {
          href: `${config.rest}/rest/type/node/vers`
        }
      },
      type: {
        target_id: 'vers'
      },
      title: {
        value: this.state.field_title
      },
      field_legende: {
        value: this.state.field_legende
      },
      field_authors_books: author
    };
    this.props.patchNode(this.props.nid, data);
    this.props.cancelEdit();
  }

  handleChange(event, target) {
    console.log(event.target.value);
    this.setState({ [target]: event.target.value });
  }

  handleAuthors(event, target) {
    // console.log(event.target.value);
    this.searchAuthors(event.target.value);
    // this.setState({ [target]: event.target.value }, () => console.log(this.state));
  }

  handleSubmit(e) {
    this.patchNode();
    e.preventDefault();
  }

  onChange(e) {
    // const { option, value } = e.target;
    // let index = e.target.selectedIndex;
    // let el = e.target.childNodes[index];
    // var ellabel = el.label;
    // console.log(ellabel);
    this.setState({ selected_authors_books: e.target.value });

  }

  addAuthor(e) {
    this.setState({ addAuthor: true });
    e.preventDefault();
  }

  // Update the data object in state, optionally validating.
  updateTerm(destination, responseData, validate = true) {
    // console.log(responseData);
    this.setState({ [destination]: responseData });
  }

  selectStatusAuthor(e, tid, name) {
    this.setState({ field_authors_books: name });
    this.setState({ field_authors_books_tid: tid });
    this.setState({ addAuthor: false });
  }

  removeAuthor(e){
    this.setState({ field_authors_books: '' });
    this.setState({ field_authors_books_tid: [] });
  }

  // Perform GET request. If successful, update state.
  fetchJsonApiGet(destination, url) {
    // console.log(url);
    fetch(url)
      .then(function (response) {
        return response.json();
      })
      .then((data) => this.updateTerm(destination, data))
      .catch(err => console.log('API error:', err));
  }

  render() {
    let styles = {
      form: {
        margin: '20px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'baseline',
        width: '97%'
      },
      formItem: {
        width: '100%'
      },
      nav: {
        margin: '0px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'baseline'
      },
    }
    return (
      <div>
        {this.state.addnew === false &&
          <button style={styles.buttonsElement} onClick={(e) => this.showAdd(e)}>
            <i class="fas fa-pencil-alt"></i>
          </button>
        }
        {this.state.addnew === true &&
          <button style={styles.buttonsElement} onClick={(e) => this.hideAdd(e)}>
            <i class="fas fa-pencil-alt"></i>
          </button>
        }
        <Form style={styles.form} onSubmit={this.handleSubmit}>
          <Textarea
            label="Titre"
            name="field_title"
            type="text"
            value={this.state.field_title}
            onChange={(e) => this.handleChange(e, 'field_title')}
            style={styles.formItem}
            floatingLabel={true}
            required={true}
          />
          <Input
            label="Legende"
            name="field_legende"
            type="text"
            value={this.state.field_legende}
            onChange={(e) => this.handleChange(e, 'field_legende')}
            style={styles.formItem}
            floatingLabel={true}
          />
          {this.state.field_authors_books_tid.length > 0 ?
            <div>
              <button onClick={(e) => this.removeAuthor(e)}>
                {this.state.field_authors_books} <i class="far fa-times-circle"></i>
              </button>
            </div> :
            <div>
              { this.state.addAuthor === false &&
                <div>
                  <button onClick={(e) => this.addAuthor(e)}>
                    <i class="fas fa-arrow-left"></i> Ajouter un auteur
                  </button>
                </div>
              }
            </div>
          }
          { this.state.addAuthor &&
            <div>
              <Input
                label="Choisir un auteur"
                name="search_author"
                type="text"
                onChange={(e) => this.handleAuthors(e, 'search_author')}
                style={styles.formItem}
                floatingLabel={true}
              />

              {this.state.searchAuthorsString.length > 3 &&
                <div>
                {
                  this.state.searchAuthors &&
                    this.state.searchAuthors.length > 0 ?
                    <div>
                      {
                        this.state.searchAuthors.map(item =>
                          <Option value={item.tid} label={item.name} onClick={(e) => this.selectStatusAuthor(e, item.tid, item.name)} />)
                      }
                    </div> :
                    <div>Add to database</div>
                }
                </div>
              }

              <Button
                variant="raised"
                name="submit"
                type="submit"
                value="Save"
                style={styles.button}
              >
              <i class="fas fa-arrow-left"></i> 
              </Button>
            </div>
          }
          {/* <Input
            label="Authors"
            name="field_authors_books"
            type="text"
            value={this.state.field_authors_books}
            onChange={(e) => this.handleChange(e, 'field_authors_books')}
            style={styles.formItem}
            floatingLabel={true}
          /> */}
          
          {/* <Select label="Auteur" name="input" value={this.state.selected_authors_books} onChange={this.onChange.bind(this)} >
            <Option value='none' label='none' />
          {this.state.authors !== null &&
            this.state.authors !== undefined &&
            this.state.authors !== null &&
            this.state.authors.length > 0 ?
            this.state.authors.map(item =>
                <Option value={item.tid} label={item.name} />)
            :
            <p>No data</p>
          }
          </Select> */}
          <Button
            variant="raised"
            name="submit"
            type="submit"
            value="Save"
            style={styles.button}
          >
            Enregistrer
          </Button>
        </Form>
      </div>
    );
  }
}

class NodeItem extends React.Component {
  constructor() {
    super();
    this.state = {
      showEdit: false,
    }
    this.editNode = this.editNode.bind(this);
    this.showEdit = this.showEdit.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
  }

  editNode(id) {
    this.props.editNode(id);
  }

  showEdit(e) {
    this.setState({ showEdit: true });
    e.preventDefault();
  }

  cancelEdit() {
    this.setState({ showEdit: false });
  }

  render() {
    let style = {
      content: {
        width: '100%',
        margin: '0px',
      },
      title: {
        color: '#cccccc',
        fontSize: '26px',
        lineHeight: '25px'
      },
      nav: {
        width: '100%',
        margin: '0px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between'
      },
      navInfo: {
        margin: '0px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'baseline'
      },
      navBouton: {
        margin: '0px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'baseline'
      },
      author: {
        color: '#000000',
        fontSize: '16px',
        marginRight: '15px'
      },
      legende: {
        color: '#000000',
        fontSize: '12px',
      },
      buttons: {
        margin: '30px',
      },
      buttonsElement: {
        border: '0px solid #000',
        padding: '3px 10px'
      },
      form: {
        width: '100%'
      }
    };
    return (
      <div id={this.props.nid}>
        <div style={style.content}>
          {this.state.showEdit === false &&
            <div>
              <div style={style.title}>{this.props.title}</div>
            </div>
          }
          <div style={style.nav}>
            {this.state.showEdit === true &&
              <div style={style.form}>
                <NodeEdit {...this.props} title={this.props.title} field_legende={this.props.field_legende} cancelEdit={this.cancelEdit} />
              </div>
            }
            {this.state.showEdit === false &&
              <div style={style.navInfo}>
                {this.props.field_authors_books &&
                  <div style={style.author}>{this.props.field_authors_books}</div>
                }
                {this.props.field_legende &&
                  <div style={style.legende}>{this.props.field_legende}</div>
                }
              </div>
            }
            <div style={style.navBouton}>
              {this.state.showEdit === false &&
                <div>
                  <button style={style.buttonsElement} onClick={(e) => this.showEdit(e)}>
                    <i class="fas fa-pencil-alt"></i>
                  </button>
                </div>
              }
              {this.state.showEdit === true &&
                <div>
                  <button style={style.buttonsElement} onClick={() => this.cancelEdit()}>
                    <i class="fas fa-arrow-left"></i>
                  </button>
                </div>
              }
              <NodeDelete {...this.props} />
            </div>
          </div>
        </div>
        <hr />
      </div>
    );
  }
}

class NodeList extends React.Component {
  render() {
    let { data, patchNode, deleteNode } = this.props;
    return (
      <div>
        {data !== null &&
          data.results !== undefined &&
          data.results !== null &&
          data.results.length > 0 ?
          data.results.map(item =>
            <NodeItem
              {...item}
              key={`node-${item.nid}`}
              patchNode={patchNode}
              deleteNode={deleteNode}
            />)
          :
          <NoData />
        }
      </div>
    );
  }
}

class NodeNew extends React.Component {
  constructor() {
    super();
    this.state = {
      addnew: false,
      field_title: '',
      field_legende: '',
    };
    this.postNode = this.postNode.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  postNode() {
    let data = {
      _links: {
        type: {
          href: `${config.rest}/rest/type/node/vers`
        }
      },
      type: {
        target_id: 'vers'
      },
      title: {
        value: this.state.field_title
      },
      field_legende: {
        value: this.state.field_legende
      }
    }; 
    // console.log(data);
    this.props.postNode(data);
  }

  handleChange(event, target) {
    this.setState({ [target]: event.target.value  }, () => console.log(this.state));
  }

  handleSubmit(event) {
    this.postNode();
    event.preventDefault();
    // Clear out form.
    this.setState({ field_title: '', field_legende: '' });
    //document.getElementById('post-body').value = "";
  }

  showAdd(e) {
    this.setState({ addnew: true });
    e.preventDefault();
  }

  hideAdd(e) {
    this.setState({ addnew: false });
    e.preventDefault();
  }


  render() {
    let styles = {
      form: {
        margin: '20px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'baseline',
        width: '97%'
      },
      formItem: {
        width: '100%'
      }
    }
    return (
      <div>
        {this.state.addnew === false &&
          <button style={styles.buttonsElement} onClick={(e) => this.showAdd(e)}>
            <i class="fas fa-pencil-alt"></i>
          </button>
        }
        {this.state.addnew === true &&
          <button style={styles.buttonsElement} onClick={(e) => this.hideAdd(e)}>
            <i class="fas fa-pencil-alt"></i>
          </button>
        }
        {this.state.addnew === true &&
          <Form style={styles.form} onSubmit={this.handleSubmit}>
            <Input
              label="Titre"
              name="field_title"
              type="text"
              floatingLabel={true}
              required={true}
              value={this.state.field_title}
              onChange={(e) => this.handleChange(e, 'field_title')}
              style={styles.formItem}
            />
            <Input
              label="Legende"
              name="field_legende"
              type="text"
              floatingLabel={true}
              value={this.state.field_legende}
              onChange={(e) => this.handleChange(e, 'field_legende')}
              style={styles.formItem}
            />
            <Button
              variant="raised"
              name="submit"
              type="submit"
              value="Add Node"
              style={styles.button}
            >Enregistrer
          </Button>
          </Form>
        }
      </div>
    );
  }
}

ReactDOM.render(
  <App/>,
  document.getElementById('app')
);