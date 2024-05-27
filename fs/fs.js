const fs = require("fs");
const axios = require("axios");
const { spawn } = require("child_process");

class Filesystem {
  
  rootfs = "https://repo-default.voidlinux.org/live/current/void-x86_64-ROOTFS-20240314.tar.xz"
  rootfsPath = "../mnt.tar"
  rootfsName = "VoidRootfs.tar.xz"
  callback = console.log
  lastLog = Date.now()

  updateLog() {
    this.lastLog = Date.now();
  }

  listenStd(xz, callback) {
    xz.stdout.on("data", e => {
      if (Date.now() - this.lastLog < 500) return this.updateLog();
      console.log(e.toString());
    });
    xz.on("close", callback);
  }

  async extractTar() {
    console.log("[  FS  ] [1/1] Extracting void linux rootfs...");
    const tar = spawn("tar", ["xvf", this.rootfsName.split(".xz")[0], "-C", "./mnt"]);
    this.listenStd(tar, () => {
      console.log("[  FS  ] Cloning rootfs to ./mnt");
      this.callback(this.rootfsPath);
    });
  }

  async extractRootfs() {
    console.log("[  FS  ] [0/1] Extracting void linux rootfs...");
    const xz = spawn("xz", ["-d", this.rootfsName]);
    this.listenStd(xz, () => {
      this.extractTar();
    });
    console.log("[  FS  ] Filesystem preparation finished!");
  }

  async initRootfs() {
    if (fs.existsSync("VoidRootfs.tar.xz")) return this.extractRootfs();

    console.log("[  FS  ] Downloading void linux rootfs...");
    const responce = await axios({
      url: this.rootfs,
      method: "GET",
      responseType: "stream"
    });
      
    const listener = responce.data.pipe(fs.createWriteStream(this.rootfsName));
    listener.on("finish", () => this.extractRootfs());
  }

  constructor(callback) {
    this.callback = callback;
    this.initRootfs();
  }
}

module.exports = Filesystem;