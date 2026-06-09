import { initUsageTabs } from "./components/usage-tabs.js";
import { initInstall } from "./components/install.js";
import {
  initCopyDemo,
  initStatusDemo,
  initCounterDemo,
} from "./components/demos.js";

initCopyDemo(document.querySelector("#copy-btn"));
initStatusDemo(document.querySelector("#status"));
initCounterDemo(document.querySelector("#counter-label"));
initInstall(document.querySelector("#install"));
initUsageTabs();
