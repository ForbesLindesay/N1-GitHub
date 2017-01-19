import {React} from 'nylas-exports';
import serialize from 'form-serialize';
import Actions from './github-actions';
import GitHubPreferencesStore from './github-preferences-store';

export default class GitHubPreferences extends React.Component {

  constructor() {
    super()

    this.state = {
      accessToken: GitHubPreferencesStore.accessToken(),
    };
  };

  componentDidMount() {
    this.subscription = GitHubPreferencesStore.listen(this._onSettingsUpdated);
  };

  componentWillUnmount() {
    this.subscription();
  };

  _onSettingsChanged = (event) => {
    const settings = serialize(this.refs.githubSettingsForm, { hash: true });
    Actions.updateSettings(settings);
  };

  _onSettingsUpdated = () => {
    this.setState({
      accessToken: GitHubPreferencesStore.accessToken(),
    });
  };

  render() {
    return (
      <div>
        <section className="container-github">
          <p className="github-intro">
            GitHub helps keep more information to hand when viewing e-mails from
            GitHub.  It requires an access token in order to fetch information
            about issues on your behalf.
          </p>

          <form ref="githubSettingsForm">
            <table className="github-settings-section">
              <tbody>
                <tr>
                  <td>
                    <label htmlFor="access-token-input">Access Token</label>
                  </td>
                  <td>
                    <input
                      id="access-token-input"
                      onChange={this._onSettingsChanged}
                      type="password"
                      value={this.state.accessToken}
                      name="accessToken"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </form>
        </section>
      </div>
    );
  }
}
