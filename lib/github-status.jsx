import {shell} from 'electron'
import {Actions, React} from 'nylas-exports'
import {RetinaImg, KeyCommandsRegion} from 'nylas-component-kit'
import github from 'github-basic';

import GithubStore from './github-store'
import GitHubPreferencesStore from './github-preferences-store';

export default class GitHubStatus extends React.Component {
  static displayName = "GitHubStatus"

  constructor(props) {
    super(props)
    this.state = this._getStateFromStores()
  }

  componentDidMount() {
    this._unlisten = GithubStore.listen(this._onStoreChanged)
  }

  componentWillUnmount() {
    this._unlisten()
  }

  _onStoreChanged = () => {
    this.setState(this._getStateFromStores())
  }

  _getStateFromStores() {
    const link = GithubStore.link();
    if (this.state && this.state.link === link) {
      return this.state;
    }
    const info = GithubStore.info();
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
