import { Node, NodeDef, NodeInitializer } from 'node-red';

import { Protobuf } from '@meshtastic/meshtasticjs';

const nodeInit: NodeInitializer = (RED): void => {
  function DecodeNodeConstructor(this: Node, config: NodeDef): void {
    RED.nodes.createNode(this, config);

    this.on("input", (msg, send, done) => {
      if (Buffer.isBuffer(msg.payload)) {
        const decoded = Protobuf.ServiceEnvelope.fromBinary(msg.payload);
        if (!decoded.packet) {
          return;
        }
        switch (decoded.packet.payloadVariant.case) {
          case "encrypted":
            break;

          case "decoded":
            const { payload } = decoded.packet.payloadVariant.value;
            let data: unknown;

            switch (decoded.packet.payloadVariant.value.portnum) {
              case Protobuf.PortNum.TEXT_MESSAGE_APP:
                data = new TextDecoder().decode(payload);
                break;

              case Protobuf.PortNum.REMOTE_HARDWARE_APP:
                data = Protobuf.HardwareMessage.fromBinary(payload);
                break;

              case Protobuf.PortNum.POSITION_APP:
                data = Protobuf.Position.fromBinary(payload);
                break;

              case Protobuf.PortNum.NODEINFO_APP:
                data = Protobuf.User.fromBinary(payload);
                break;

              case Protobuf.PortNum.ROUTING_APP:
                data = Protobuf.Routing.fromBinary(payload);
                break;

              case Protobuf.PortNum.ADMIN_APP:
                data = Protobuf.AdminMessage.fromBinary(payload);
                break;

              case Protobuf.PortNum.TEXT_MESSAGE_COMPRESSED_APP:
                break;

              case Protobuf.PortNum.WAYPOINT_APP:
                data = Protobuf.Waypoint.fromBinary(payload);
                break;

              case Protobuf.PortNum.REPLY_APP:
                break;

              case Protobuf.PortNum.IP_TUNNEL_APP:
                break;

              case Protobuf.PortNum.SERIAL_APP:
                break;

              case Protobuf.PortNum.STORE_FORWARD_APP:
                break;

              case Protobuf.PortNum.RANGE_TEST_APP:
                break;

              case Protobuf.PortNum.TELEMETRY_APP:
                data = Protobuf.Telemetry.fromBinary(payload);
                break;

              case Protobuf.PortNum.PRIVATE_APP:
                break;

              case Protobuf.PortNum.ATAK_FORWARDER:
                break;
            }

            console.log(data);

            if (data) {
              (decoded.packet.payloadVariant.value.payload as unknown) = data;
            }

            break;
        }

        send({
          payload: decoded,
        });
      }

      done();
    });
  }

  RED.nodes.registerType("decode", DecodeNodeConstructor);
};

export default nodeInit;
