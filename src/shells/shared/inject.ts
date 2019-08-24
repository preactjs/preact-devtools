import { inject } from "./utils";

inject(`
  ;(function(w) {
    w.__PREACT_DEVTOOLS2__ = "preact";
  })(window)
`);
