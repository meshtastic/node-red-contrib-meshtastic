import { Node, NodeDef, NodeInitializer } from "node-red";

import { JsonValue, Message } from "@bufbuild/protobuf"

import { Protobuf } from "@meshtastic/meshtasticjs";

const nodeInit: NodeInitializer = (red): void => {
  function DecodeNodeConstructor(this: Node, config: NodeDef): void {
    red.nodes.createNode(this, config);

    this.on("input", (msg, send, done) => {
      if (Buffer.isBuffer(msg.payload)) {
        const decoded = Protobuf.ServiceEnvelope.fromBinary(msg.payload);
        if (!decoded.packet) {
          return;
        }
        switch (decoded.packet.payloadVariant.case) {
          case "encrypted":
            break;

          case "decoded": {
            const { payload } = decoded.packet.payloadVariant.value;
            const jsonWriteOptions = { emitDefaultValues: true, enumAsInteger: true };
            let data: Message | string;

            switch (decoded.packet.payloadVariant.value.portnum) {
              case Protobuf.PortNum.UNKNOWN_APP: {
                break;
              }

              case Protobuf.PortNum.TEXT_MESSAGE_APP: {
                data = new TextDecoder().decode(payload);
                break;
              }

              case Protobuf.PortNum.REMOTE_HARDWARE_APP: {
                data = new Protobuf.HardwareMessage;
                break;
              }

              case Protobuf.PortNum.POSITION_APP: {
                data = new Protobuf.Position;
                break;
              }

              case Protobuf.PortNum.NODEINFO_APP: {
                data = new Protobuf.User;
                break;
              }

              case Protobuf.PortNum.ROUTING_APP: {
                data = new Protobuf.Routing;
                break;
              }

              case Protobuf.PortNum.ADMIN_APP: {
                data = new Protobuf.AdminMessage;
                break;
              }

              case Protobuf.PortNum.TEXT_MESSAGE_COMPRESSED_APP: {
                // should never get here
                // should be decompressed by the firmware to a TEXT_MESSAGE_APP packet
                throw new Error(
                  "Received a TEXT_MESSAGE_COMPRESSED_APP message.\nPlease open an issue on Github as this should never happen",
                );
              }

              case Protobuf.PortNum.WAYPOINT_APP: {
                data = new Protobuf.Waypoint;
                break;
              }

              case Protobuf.PortNum.AUDIO_APP: {
                break;
              }

              case Protobuf.PortNum.DETECTION_SENSOR_APP: {
                data = new TextDecoder().decode(payload);
                break;
              }

              case Protobuf.PortNum.REPLY_APP: {
                data = new TextDecoder("ascii").decode(payload);
                break;
              }
              case Protobuf.PortNum.IP_TUNNEL_APP: {
                break;
              }

              case Protobuf.PortNum.SERIAL_APP: {
                break;
              }

              case Protobuf.PortNum.STORE_FORWARD_APP: {
                data = new Protobuf.StoreAndForward;
                break;
              }

              case Protobuf.PortNum.dataANGE_TEST_APP: {
                data = new TextDecoder("ascii").decode(payload);
                break;
              }

              case Protobuf.PortNum.TELEMETRY_APP: {
                data = new Protobuf.Telemetry;
                break;
              }

              case Protobuf.PortNum.ZPS_APP: {
                break;
              }

              case Protobuf.PortNum.SIMULATOR_APP: {
                break;
              }

              case Protobuf.PortNum.TRACEROUTE_APP: {
                break;
              }

              case Protobuf.PortNum.NEIGHBORINFO_APP: {
                data = new Protobuf.NeighborInfo;
                break;
              }

              case Protobuf.PortNum.PRIVATE_APP: {
                break;
              }

              case Protobuf.PortNum.ATAK_FORWARDER: {
                break;
              }
            }

            const out = decoded.toJson(jsonWriteOptions)

            if (!data) {
              break;
            }

            let decodedPayload: JsonValue | string;

            if (data instanceof Message) {
              decodedPayload = data.fromBinary(payload).toJson(jsonWriteOptions)
            } else {
              decodedPayload = data
            }

            console.log(decodedPayload);

            out.packet.decoded.payload = decodedPayload;

            break;
          }
        }

        send({
          payload: out,
        });
      }

      done();
    });
  }

  red.nodes.registerType("decode", DecodeNodeConstructor);
};

export default nodeInit;
