import {shell} from 'electron'
import {Actions, React, DatabaseStore, Message} from 'nylas-exports'
import {RetinaImg, KeyCommandsRegion} from 'nylas-component-kit'
import github from 'github-basic';
import {findGitHubLink, parseLink, isRelevantThread} from './utils';

import GitHubPreferencesStore from './github-preferences-store';

function loadMessages(thread) {
  // TODO: try using findBy to return just one message
  const query = DatabaseStore.findAll(Message);
  query.where({threadId: thread.id});
  query.include(Message.attributes.body);
  return query.then(messages => {
    for (let i = 0; i < messages.length; i++) {
      const link = findGitHubLink(messages[i]);
      if (link) {
        return link;
      }
    }
    return null;
  });
}
export default class GitHubStatus extends React.Component {
  static displayName = "GitHubStatus"

  static propTypes: {
    thread: React.PropTypes.object,
  };

  constructor(props) {
    super(props)
    this.state = {};
  }

  componentDidMount() {
    this.setState(this._getStateFromProps(this.props));
  }
  componentWillReceiveProps(props) {
    if (props.thread) {
      this.setState(this._getStateFromProps(props));
    }
  }

  _getStateFromProps(props) {
    if (this._threadID && props.thread.id === this._threadID) {
      return this.state;
    }
    this._threadID = props.thread.id;
    if (isRelevantThread(props.thread.participants)) {
      const threadID = props.thread.id;
      loadMessages(props.thread).then(link => {
        if (this.props.thread && this.props.thread.id === threadID) {
          this.setState(this._getStateFromLink(link));
        }
      }).catch(ex => {
        setTimeout(() => { throw ex; }, 0);
      });
    }
    return {link: null, info: null, status: null};
  }
  _getStateFromLink(link) {
    if (this.state && this.state.link === link) {
      return this.state;
    }
    const info = parseLink(link);
    if (info) {
      // Intentionally not subscribing to the access token
      const accessToken = GitHubPreferencesStore.accessToken();
      const client = github({version: 3, auth: accessToken});
      client.get('/repos/:owner/:repo/issues/:number', {
        owner: info.owner,
        repo: info.repo,
        number: info.number,
      }).done(result => {
        if (this.state.link === link) {
          this.setState({status: result});
        }
      });
    }
    return {link, info, status: null};
  }

  _openLink = () => {
    Actions.recordUserEvent("Github Thread Opened", {pageUrl: this.state.link})
    if (this.state.link) {
      shell.openExternal(this.state.link)
    }
  }

  render() {
    if (!this.state.link) { return false }
    return (
      <div className="github-issue-status">
        {this._renderStatus()}
        <button
          className="btn btn-toolbar btn-view-on-github"
          onClick={this._openLink}
          title={"Visit Thread on GitHub"}
        >
          <RetinaImg
            mode={RetinaImg.Mode.ContentIsMask}
            url="nylas://github/assets/github@2x.png"
          />
          {this._renderType()}
        </button>
      </div>
    )
  }
  _renderStatus() {
    if (!this.state.info) {
      return null;
    }
    const status = this.state.status;
    if (!status) {
      return (
        <span className="btn btn-toolbar">
          Loading...
        </span>
      );
    }
    switch (status.state) {
      case 'open':
        return (
          <span className="btn btn-toolbar github-issue-status github-issue-status-open">
            Open
          </span>
        );
      case 'closed':
        return (
          <span className="btn btn-toolbar github-issue-status github-issue-status-closed">
            Closed
          </span>
        );
    }
  }
  _renderType() {
    const info = this.state.info;
    if (!info) {
      return null;
    }
    switch (info.type) {
      case 'issue':
        return ' Issue';
      case 'pull-request':
        return ' Pull Request';
    }
  }
}
