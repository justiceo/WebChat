import * as express from "express";

class Main {
  public express;

  constructor() {
    this.express = express();
    this.mountRoutes();
  }

  private mountRoutes(): void {
    const router = express.Router();
    router.get("/", (req, res) => {
      res.json({
        message: "Hello world!"
      });
    });
    this.express.use("/", router);
  }
}

export default new Main().express;
