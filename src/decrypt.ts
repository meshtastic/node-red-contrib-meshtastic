import { createDecipheriv } from "crypto";
import { Node, NodeDef, NodeInitializer } from "node-red";

const nodeInit: NodeInitializer = (RED): void => {
  function DecryptNodeConstructor(this: Node, config: NodeDef): void {
    RED.nodes.createNode(this, config);

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

  RED.nodes.registerType("decrypt", DecryptNodeConstructor);
};

export default nodeInit;
