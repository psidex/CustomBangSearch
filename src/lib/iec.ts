// IEC - Like IPC but Inter-Extension Communication.

import browser from 'webextension-polyfill';

import { Settings } from './settings';

export enum IecMessageType {
  // Request settings.
  SettingsGet,
  // Data will contain Settings object.
  SettingsGetResponse,
  // Request set settings.
  SettingsSet,
  // All OK.
  Ok,
  // Error ocurred, data will be error string?
  Error,
}

// Note: readonly for now but it might make sense to remove in future?
export type IecMessage = Readonly<{
  type: IecMessageType,
  data: null | string | Settings | Error
}>;

// Send a message and recieve one in response.
// Response is likely to be type Ok, empty data, and no error.
export async function sendIecMessage(m: IecMessage): Promise<IecMessage> {
  // Probably safe to assert as the only message handler always returns an IecMessage.
  return browser.runtime.sendMessage(m) as Promise<IecMessage>;
}
