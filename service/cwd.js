const { cwd } = require("process");
const { resolve, extname } = require("path");
const { constants } = require("fs");
const { readdir, stat, access } = require("fs/promises");

const getPayload = (data) => {
  return {
    payload: data,
  };
};

class File {
  constructor({ isDirectory, birthtimeMs, size, dirname, filename }) {
    this.isDirectory = isDirectory;
    this.birthtimeMs = birthtimeMs;
    this.size = size;
    this.filename = filename;
    this.dirname = dirname;
    this.ext = extname(filename);
  }
}

//能不能读取某个文件(不throw Error)
const canFileRead = async (path) => {
  try {
    await access(path, constants.R_OK);
    return true;
  } catch (e) {
    return false;
  }
};

//获取目录下的文件和文件夹信息
const getPathFilesStats = async (dirname) => {
  const files = await readdir(dirname);
  const result = [];
  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const filePath = resolve(dirname, filename);
    if (await canFileRead(filePath)) {
      try {
        const fileStat = await stat(filePath);
        result.push(
          new File({
            ...fileStat,
            isDirectory: fileStat.isDirectory(),
            filename,
            dirname,
          })
        );
      } catch (e) {
        console.error(e);
      }
    }
  }
  return result;
};

module.exports = class Cwd {
  _cwd = "";
  _children = [];
  constructor(socket) {
    this.socket = socket;
    this.socket.on("init", this.init.bind(this));
  }
  //初始化绑定
  init() {
    this.setCwd(cwd(), this.syncFiles);
    //返回上一级目录
    this.socket.on("dirnameBack", this.getBack.bind(this));
    //获取文件列表
    this.socket.on("filesListUpdate", this.syncFiles.bind(this));
    //打开某个文件夹
    this.socket.on("openFolder", this.openFolder.bind(this));
  }

  //当前的路径
  get cwd() {
    return this._cwd;
  }

  //设置当前路径, syncFiles : 当前路径设置之后,是否要和客户端同步文件列表
  async setCwd(val, syncFiles = false) {
    const oldVal = this._cwd;
    try {
      await access(val, constants.R_OK);
      this._cwd = val;
      if (syncFiles) {
        const { success, err } = await this.syncFiles();
        if (success) {
          this.syncCwd();
        } else {
          throw err;
        }
      }
      return {
        success: true,
      };
    } catch (e) {
      this._cwd = oldVal;
      return {
        success: false,
        err: e.message,
      };
    }
  }
  //返回上一级目录
  async getBack() {
    const backDirname = resolve(this.cwd, "../");
    const res = await this.setCwd(backDirname, true);
    this.socket.emit("dirnameBack", res);
  }

  //和客户端同步文件夹
  async syncFiles() {
    try {
      const filesInfo = await getPathFilesStats(this.cwd);
      this.socket.emit(
        "filesListUpdated",
        getPayload({
          dirname: this.cwd,
          children: filesInfo,
        })
      );
      return {
        success: true,
      };
    } catch (e) {
      console.error(e);
      return {
        success: false,
        err: e,
      };
    }
  }

  //和客户端同步当前路径
  syncCwd() {
    const data = getPayload({
      cwd: this.cwd,
    });
    this.socket.emit("cwdUpdated", data);
  }
  //打开文件夹
  async openFolder({ payload }) {
    let openPath = "";
    if (typeof payload === "object") {
      const { dirname, foldername } = payload;
      if ((dirname, foldername)) {
        openPath = resolve(dirname, foldername);
      }
    }
    if (typeof payload === "string") {
      openPath = payload;
    }
    if (openPath) {
      const res = await this.setCwd(openPath, true);
      this.socket.emit("openFolder", res);
    }
  }
};
