/*
This package displays a "Vew on Github Button" whenever the message you're
looking at contains a "view it on Github" link.

This is the entry point of an N1 package. All packages must have a file
called `main` in their `/lib` folder.

The `activate` method of the package gets called when it is activated.
This happens during N1's bootup. It can also happen when a user manually
enables your package.

Nearly all N1 packages have similar `activate` methods. The most common
action is to register a {React} component with the {ComponentRegistry}

See more details about how this works in the {ComponentRegistry}
documentation.

In this case the `ViewOnGithubButton` React Component will get rendered
whenever the `"MessageList:ThreadActionsToolbarButton"` region gets rendered.

Since the `ViewOnGithubButton` doesn't know who owns the
`"MessageList:ThreadActionsToolbarButton"` region, or even when or where it will be rendered, it
has to load its internal `state` from the `GithubStore`.

The `GithubStore` is responsible for figuring out what message you're
looking at, if it has a relevant Github link, and what that link is. Once
it figures that out, it makes that data available for the
`ViewOnGithubButton` to display.
*/

import fs from 'fs';
import path from 'path';
import {ComponentRegistry, PreferencesUIStore} from 'nylas-exports';
import GitHubPreferences from './github-preferences';
import GitHubStatus from './github-status';

const DISPLAY_NAME = 'GitHub';
/*
All packages must export a basic object that has at least the following 3
methods:

1. `activate` - Actions to take once the package gets turned on.
Pre-enabled packages get activated on N1 bootup. They can also be
activated manually by a user.

2. `deactivate` - Actions to take when a package gets turned off. This can
happen when a user manually disables a package.

3. `serialize` - A simple serializable object that gets saved to disk
before N1 quits. This gets passed back into `activate` next time N1 boots
up or your package is manually activated.
*/

function addPreferencesTabIcon() {
  var cachedImageDataJSON = JSON.parse(NylasEnv.fileListCache().imageData);
  const resourcePath = NylasEnv.getLoadSettings().resourcePath;
  const pluginPath = path.dirname(fs.realpathSync(__filename));

  [1, 2].forEach(function(iconSize) {
    const iconName = `icon-preferences-${DISPLAY_NAME.toLowerCase().replace(' ', '-')}@${iconSize}x.png`;
    // TODO: actually provide a 2x and 1x version of this image, and copy the style used in other images
    cachedImageDataJSON[resourcePath][iconName] = path.join(pluginPath, `../assets/github@2x.png`);
  });

  NylasEnv.fileListCache().imageData = JSON.stringify(cachedImageDataJSON);
}
addPreferencesTabIcon();
const preferencesTab = new PreferencesUIStore.TabItem({
  tabId: 'GitHub',
  displayName: DISPLAY_NAME,
  component: GitHubPreferences,
});
export function activate() {
  PreferencesUIStore.registerPreferencesTab(preferencesTab);
  ComponentRegistry.register(GitHubStatus, {
    role: 'MessageListHeaders',
  });
}

export function deactivate() {
  PreferencesUIStore.unregisterPreferencesTab(preferencesTab);
  ComponentRegistry.unregister(ViewOnGithubButton);
}
