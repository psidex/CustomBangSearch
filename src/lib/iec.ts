// IEC - Like IPC but Inter-Extension Communication.

import browser from 'webextension-polyfill';

import { Settings } from './settings';

export enum IecMessageType {
  // Request settings.
  SettingsGet,
  // Request settings response, data will be of type Settings.
  SettingsGetResponse,
  // Request set settings, data will be of type Settings.
  SettingsSet,
  // 200 OK.
  Ok,
  // Error ocurred, data will be of type Error
  Error,
}

export type IecMessage = Readonly<{
  type: IecMessageType,
  data: null | string | Settings | Error
}>;

// Send a message and recieve one in response.
// Response is likely to be type OK with no data.
export async function sendIecMessage(m: IecMessage): Promise<IecMessage> {
  // Probably safe to assert as the only message handler always returns an IecMessage.
  return browser.runtime.sendMessage(m) as Promise<IecMessage>;
}
