import NylasStore from 'nylas-store';
import {MessageStore} from 'nylas-exports';
import {findGitHubLink, parseLink, isRelevantThread} from './utils';

function arrayEquals(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}
class GithubStore extends NylasStore {
  // It's very common practive for {NylasStore}s to listen to other parts of N1.
  // Since Stores are singletons and constructed once on `require`, there is no
  // teardown step to turn off listeners.
  constructor() {
    super();
    this._lastItemIds = [];
    this.listenTo(MessageStore, this._onMessageStoreChanged);
  }

  // All {NylasStore}s ONLY have reader methods. No setter methods. Use an
  // `Action` instead!
  //
  // This is the computed & cached value that our `ViewOnGithubButton` will
  // render.
  link() {
    return this._link;
  }
  info() {
    return this._info;
  }

  // Private methods

  _onMessageStoreChanged() {
    if (!MessageStore.threadId()) {
      return;
    }

    const itemIds = MessageStore.items().map(item => item.id)
    if ((itemIds.length === 0) || arrayEquals(itemIds, this._lastItemIds)) {
      return;
    }

    this._lastItemIds = itemIds;
    this._link = this._isRelevantThread() ? this._findGitHubLink() : null;
    this._info = this._parseLink();
    this.trigger();
  }

  _parseLink() {
    return parseLink(this._link);
  }

  _findGitHubLink() {
    // messages that are not currently open will have `null` for a body
    const messages = MessageStore.items();
    for (let i = 0; i < messages.length; i++) {
      const link = findGitHubLink(messages[i]);
      if (link) {
        return link;
      }
    }
    return null;
  }

  _isRelevantThread() {
    return isRelevantThread(MessageStore.thread().participants);
  }
}

/*
IMPORTANT NOTE:

All {NylasStore}s are constructed upon their first `require` by another
module.  Since `require` is cached, they are only constructed once and
are therefore singletons.
*/
export default new GithubStore();
