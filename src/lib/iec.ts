// IEC - Like IPC but Inter-Extension Communication.

import browser from 'webextension-polyfill';

import { Settings } from './settings';

export enum IecMessageType {
  // Request settings, data type: null.
  SettingsGet,
  // Request settings response, data type: Settings.
  SettingsGetResponse,
  // Request set settings, data type: Settings.
  SettingsSet,
  // 200 OK, data type: null.
  Ok,
  // Error ocurred, data type: string.
  Error,
}

export type IecMessage = Readonly<{
  type: IecMessageType,
  data: null | string | Settings
}>;

// Send a message and recieve one in response.
// Response is likely to be type OK with no data.
export async function sendIecMessage(m: IecMessage): Promise<IecMessage> {
  // Probably safe to assert as the only message handler always returns an IecMessage.
  return browser.runtime.sendMessage(m) as Promise<IecMessage>;
}
