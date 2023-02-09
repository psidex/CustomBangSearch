// IEC - Like IPC but Inter-Extension Communication

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

// TODO: Make readonly somehow.
export interface IecMessage {
  type: IecMessageType,
  data: null | string | Settings,
  error: boolean
}

// function isIecMessage(m: Object): m is IecMessage {
//   const maybe = (m as IecMessage);
//   return maybe.type !== undefined etc;
// }

// Send a message and recieve one in response.
// Response is likely to be type Ok, empty data, and no error.
export async function sendIecMessage(m: IecMessage): Promise<IecMessage> {
  // Probably safe to cast as the only message handler always returns an IecMessage.
  return <IecMessage> <unknown> browser.runtime.sendMessage(m);
}
