import {Reflux} from 'nylas-exports';

let Actions = {
  'updateSettings': Reflux.createAction('updateSettings')
};

Actions['updateSettings'].sync = true;

export default Actions;
