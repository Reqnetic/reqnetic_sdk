export { Reqnetic } from "./Reqnetic";

import { Reqnetic } from "./Reqnetic";
window.Reqnetic = Reqnetic;

// add a global type for window
declare global {
  interface Window {
    Reqnetic: typeof Reqnetic;
  }
}
