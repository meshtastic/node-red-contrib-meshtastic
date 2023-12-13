import { Node, NodeDef, NodeInitializer } from "node-red";
import { Message } from "@bufbuild/protobuf";
import { Protobuf } from "@meshtastic/meshtasticjs";

const decoders = {
  [Protobuf.PortNum.UNKNOWN_APP]: null,
  [Protobuf.PortNum.TEXT_MESSAGE_APP]: new TextDecoder(),
  [Protobuf.PortNum.REMOTE_HARDWARE_APP]: new Protobuf.HardwareMessage(),
  [Protobuf.PortNum.POSITION_APP]: new Protobuf.Position(),
  [Protobuf.PortNum.NODEINFO_APP]: new Protobuf.User(),
  [Protobuf.PortNum.ROUTING_APP]: new Protobuf.Routing(),
  [Protobuf.PortNum.ADMIN_APP]: new Protobuf.AdminMessage(),
  [Protobuf.PortNum.TEXT_MESSAGE_COMPRESSED_APP]: null,
  [Protobuf.PortNum.WAYPOINT_APP]: new Protobuf.Waypoint(),
  [Protobuf.PortNum.AUDIO_APP]: null,
  [Protobuf.PortNum.DETECTION_SENSOR_APP]: new TextDecoder(),
  [Protobuf.PortNum.REPLY_APP]: new TextDecoder("ascii"),
  [Protobuf.PortNum.IP_TUNNEL_APP]: null,
  [Protobuf.PortNum.SERIAL_APP]: null,
  [Protobuf.PortNum.STORE_FORWARD_APP]: new Protobuf.StoreAndForward(),
  [Protobuf.PortNum.RANGE_TEST_APP]: new TextDecoder("ascii"),
  [Protobuf.PortNum.TELEMETRY_APP]: new Protobuf.Telemetry(),
  [Protobuf.PortNum.ZPS_APP]: null,
  [Protobuf.PortNum.SIMULATOR_APP]: null,
  [Protobuf.PortNum.TRACEROUTE_APP]: null,
  [Protobuf.PortNum.NEIGHBORINFO_APP]: new Protobuf.NeighborInfo(),
  [Protobuf.PortNum.PRIVATE_APP]: null,
  [Protobuf.PortNum.ATAK_FORWARDER]: null,
};

const nodeInit: NodeInitializer = (red): void => {
  function DecodeNodeConstructor(this: Node, config: NodeDef): void {
    red.nodes.createNode(this, config);

    this.on("input", (msg, send, done) => {
      if (Buffer.isBuffer(msg.payload)) {
        const decoded = Protobuf.ServiceEnvelope.fromBinary(msg.payload);
        if (!decoded.packet) {
          return;
        }

        const jsonWriteOptions = {
          emitDefaultValues: true,
          enumAsInteger: true,
        };
        const out = decoded.toJson(jsonWriteOptions);

        switch (decoded.packet.payloadVariant.case) {
          case "encrypted":
            break;

          case "decoded": {
            try {
              const portNum = decoded.packet.payloadVariant.value.portnum;
              if (decoders[portNum] === null) {
                break;
              }

              const { payload } = decoded.packet.payloadVariant.value;
              const decoder = decoders[portNum];

              if (decoder instanceof Message) {
                out.packet.decoded.payload = decoder
                  .fromBinary(payload)
                  .toJson(jsonWriteOptions);
              } else if (decoder instanceof TextDecoder) {
                out.packet.decoded.payload = decoder.decode(payload);
              }

              console.log(JSON.stringify(out, null, 2));
            } catch (error) {
              console.log(`could not decode payload:${error}`);
            }

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
