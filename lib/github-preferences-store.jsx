import NylasStore from 'nylas-store';
import Actions from './github-actions';

const defaults = {
  accessToken: '',
};

class GitHubPreferencesStore extends NylasStore {

  constructor() {
    super();

    this._accessToken = NylasEnv.config.get('github-accessToken') || defaults.accessToken;

    this.trigger();

    Actions.updateSettings.listen(this._onUpdateSettings);
  };

  accessToken() {
    return this._accessToken || '';
  }

  _onUpdateSettings = (settings) => {
    this._accessToken = settings.accessToken;

    NylasEnv.config.set('github-accessToken', settings.accessToken);

    this.trigger();
  };

}

export default new GitHubPreferencesStore();
