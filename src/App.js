import React, { Component } from 'react';
import './App.css';
import { sortBy } from "lodash";

const DEFAULT_QUERY = 'redux';
const DEFAULT_HPP = '5';

const PATH_BASE = 'https://hn.algolia.com/api/v1'
//create error path
// const PATH_BASE = 'https://hn.thangnguyen.com/api/v1'
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse(),
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null,
      isLoading: false,
      sortKey: 'NONE',
      isSortReverse: false,
    };

    this.onSort = this.onSort.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
  }

  onSort(sortKey){
    const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse;
    this.setState({
      sortKey, isSortReverse
    })
  }

  setSearchTopStories(result){
    const {hits, page} = result;
    const {searchKey, results} = this.state;

    const oldHits = results && results[searchKey] ? results[searchKey].hits : [];

    const updatedHits = [
      ...oldHits,
      ...hits
    ]

    this.setState({
      isLoading: false,
      results: {
        ...results,
        [searchKey]: {hits: updatedHits, page}
      }
    })
  }

  setSearchKey = searchTerm => {
    this.setState({
      searchKey: searchTerm,
    })
  }

  onSearchChange(event) {
    this.setState({ searchTerm: event.target.value });
  }

  onDismiss(id) {
    const {searchKey, results} = this.state;
    const {hits, page} = results[searchKey];

    const isNotId = item => item.objectID !== id;
    const updatedHits = hits.filter(isNotId);
    this.setState({
      // result: Object.assign({}, this.state.result, {hits: updatedHits})
      results: {
        ...results,
        [searchKey]: {hits: updatedHits, page}
      }
    });
  }

  onSearchSubmit(event) {
    event.preventDefault();
    const { searchTerm } = this.state;
    if(this.state.results){
      if(this.needsToSearchTopStories(searchTerm)){
        this.fetchSearchTopStories(searchTerm);
      }
    }
    this.setSearchKey(searchTerm);
  }

  needsToSearchTopStories = searchTerm => {
    return !this.state.results[searchTerm];
  }

  fetchSearchTopStories(searchTerm, page = 0) {
    this.setState({
      isLoading: true,
    })
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
    .then(response => response.json())
    .then(result => this.setSearchTopStories(result))
    .catch(error => this.setState({error}));
  }

  componentDidMount(){
    const { searchTerm } = this.state;
    this.setSearchKey(searchTerm);
    this.fetchSearchTopStories(searchTerm);
  }

  render() {
    const { 
      searchTerm, 
      results, 
      searchKey, 
      error, 
      isLoading,
      sortKey,
      isSortReverse
    } = this.state;

    const page = (results && results[searchKey] && results[searchKey].page) || 0;
    const list = (results && results[searchKey] && results[searchKey].hits) || [];
    return (
      <div className="page">
        <div className="interactions">
          <Search
            value={searchTerm}
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}
          >
            Search
          </Search>
        </div>
        {
          error ? 
          <div className="interaction">
            <p>Oops...</p>
          </div>
            : 
          <Table
            list={list}
            sortKey={sortKey}
            onSort={this.onSort}
            onDismiss={this.onDismiss}
            isSortReverse={isSortReverse}
          /> 
        }
          <div className="interaction">
            {/* <ButtonWithLoading
              isLoading = {isLoading}
              onClick = {() => this.fetchSearchTopStories(searchKey, page + 1)}
            >
              More
            </ButtonWithLoading> */}
            {isLoading ? 
              <Loading/> : 
              <Button onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}>
                More
              </Button>
            }
            
          </div> 
      </div>
    );
  }
}

const Search = ({ value, onChange, onSubmit, children }) =>
  <form onSubmit={onSubmit}>
    <input
      type="text"
      value={value}
      onChange={onChange}
    />
    <button type="submit">{children} </button>
  </form>


const largeColumn = {
  width: '40%',
};

const midColumn = {
  width: '30%',
};

const smallColumn = {
  width: '10%',
};

// function isSearched(searchTerm){
//   return function(item){
//       return item.title.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1;
//   }
// }

const Table = ({ 
  list, 
  sortKey,
  isSortReverse,
  onDismiss,
  onSort,
  }) => {
    const sortedList = SORTS[sortKey](list);
    const reverseSortedList = isSortReverse 
      ? sortedList 
      : sortedList.reverse();
    return(
    <div className="table">
      <div className="table-header">
        <span style={{width: '40%'}}>
          <Sort
            sortKey={'TITLE'}
            onSort={onSort}
            activeSortKey={sortKey}
          >
            Title
          </Sort>
        </span>
        <span style={{width: '30%'}}>
          <Sort
            sortKey={'AUTHOR'}
            onSort={onSort}
            activeSortKey={sortKey}
          >
            Author
          </Sort>
        </span>
        <span style={{width: '10%'}}>
          <Sort
            sortKey={'COMMENTS'}
            onSort={onSort}
            activeSortKey={sortKey}
          >
            Comments
          </Sort>
        </span>
        <span style={{width: '10%'}}>
          <Sort
            sortKey={'POINTS'}
            onSort={onSort}
            activeSortKey={sortKey}
          >
            Points
          </Sort>
        </span>
        <span style={{width: '10%'}}>
            Archive
        </span>
      </div>
      {reverseSortedList.map((item) => (
        <div key={item.objectID} className="table-row">
          <span style={largeColumn}>
            <a href={item.url}>{item.title}</a>
          </span>
          <span style={midColumn}>{item.author}</span>
          <span style={smallColumn}>{item.num_comments}</span>
          <span style={smallColumn}>{item.points}</span>
          <span style={smallColumn}>
            <Button
              onClick={() => onDismiss(item.objectID)}
              className="button-inline"
            >
              Dismiss
            </Button>
          </span>
        </div>
      ))}
    </div>
)};

const Sort = ({
  sortKey,
  onSort,
  activeSortKey,
  children
}) => {
  const sortClass = ['button-inline'];
  
  if(sortKey === activeSortKey){
    sortClass.push('button-active');
  }
  
  return (
  <Button 
    onClick = {() => onSort(sortKey)}
    className={sortClass.join(' ')}
  >
    {children}
  </Button>
)}

const Button = ({ onClick, className = "", children }) => (
  <button onClick={onClick} className={className} type="button">
    {children}
  </button>
);

const Loading = () => {
  return(
    <div>
      <h1>Loading ...</h1>
    </div>
  )
}

export default App;