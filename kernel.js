
const filesystem = require("./fs/fs.js");

const fs = new filesystem(function() {
  console.log("[  KERNEL  ] Rootfs finished");
});
