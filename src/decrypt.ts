import { createDecipheriv } from "crypto";
import { Node, NodeDef, NodeInitializer } from "node-red";

const nodeInit: NodeInitializer = (red): void => {
  function DecryptNodeConstructor(this: Node, config: NodeDef): void {
    red.nodes.createNode(this, config);

    this.on("input", (msg, send, done) => {
      const key = "";

      if (Buffer.isBuffer(msg.payload)) {
        const tmp = createDecipheriv("aes-256-ctr", "", "");

        send({
          payload: {},
        });
      }

      done();
    });
  }

  red.nodes.registerType("decrypt", DecryptNodeConstructor);
};

export default nodeInit;
