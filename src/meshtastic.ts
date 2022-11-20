import { Node, NodeDef, NodeInitializer } from 'node-red';

import { Protobuf } from '@meshtastic/meshtasticjs';

const nodeInit: NodeInitializer = (RED): void => {
  function MeshtasticNodeConstructor(this: Node, config: NodeDef): void {
    RED.nodes.createNode(this, config);

    this.on("input", (msg, send, done) => {
      // do something with 'msg'
      console.log(msg);

      if (Buffer.isBuffer(msg.payload)) {
        send({
          payload: Protobuf.ServiceEnvelope.fromBinary(msg.payload),
        });
      }

      done();
    });
  }

  RED.nodes.registerType("meshtastic", MeshtasticNodeConstructor);
};

export default nodeInit;
