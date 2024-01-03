import { Node, NodeDef, NodeInitializer } from "node-red";
import { Message } from "@bufbuild/protobuf";
import { Protobuf } from "@meshtastic/js";

const decoders = {
  [Protobuf.Portnums.PortNum.UNKNOWN_APP]: null,
  [Protobuf.Portnums.PortNum.TEXT_MESSAGE_APP]: new TextDecoder(),
  [Protobuf.Portnums.PortNum.REMOTE_HARDWARE_APP]:
    new Protobuf.RemoteHardware.HardwareMessage(),
  [Protobuf.Portnums.PortNum.POSITION_APP]: new Protobuf.Mesh.Position(),
  [Protobuf.Portnums.PortNum.NODEINFO_APP]: new Protobuf.Mesh.User(),
  [Protobuf.Portnums.PortNum.ROUTING_APP]: new Protobuf.Mesh.Routing(),
  [Protobuf.Portnums.PortNum.ADMIN_APP]: new Protobuf.Admin.AdminMessage(),
  [Protobuf.Portnums.PortNum.TEXT_MESSAGE_COMPRESSED_APP]: null,
  [Protobuf.Portnums.PortNum.WAYPOINT_APP]: new Protobuf.Mesh.Waypoint(),
  [Protobuf.Portnums.PortNum.AUDIO_APP]: null,
  [Protobuf.Portnums.PortNum.DETECTION_SENSOR_APP]: new TextDecoder(),
  [Protobuf.Portnums.PortNum.REPLY_APP]: new TextDecoder("ascii"),
  [Protobuf.Portnums.PortNum.IP_TUNNEL_APP]: null,
  [Protobuf.Portnums.PortNum.SERIAL_APP]: null,
  [Protobuf.Portnums.PortNum.STORE_FORWARD_APP]:
    new Protobuf.StoreForward.StoreAndForward(),
  [Protobuf.Portnums.PortNum.RANGE_TEST_APP]: new TextDecoder("ascii"),
  [Protobuf.Portnums.PortNum.TELEMETRY_APP]: new Protobuf.Mesh.Telemetry(),
  [Protobuf.Portnums.PortNum.ZPS_APP]: null,
  [Protobuf.Portnums.PortNum.SIMULATOR_APP]: null,
  [Protobuf.Portnums.PortNum.TRACEROUTE_APP]: null,
  [Protobuf.Portnums.PortNum.NEIGHBORINFO_APP]:
    new Protobuf.Mesh.NeighborInfo(),
  [Protobuf.Portnums.PortNum.PRIVATE_APP]: null,
  [Protobuf.Portnums.PortNum.ATAK_FORWARDER]: null,
};

const nodeInit: NodeInitializer = (red): void => {
  function DecodeNodeConstructor(this: Node, config: NodeDef): void {
    red.nodes.createNode(this, config);

    this.on("input", (msg, send, done) => {
      if (Buffer.isBuffer(msg.payload)) {
        const decoded = Protobuf.Mqtt.ServiceEnvelope.fromBinary(msg.payload);
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
