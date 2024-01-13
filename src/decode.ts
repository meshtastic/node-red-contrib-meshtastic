import type { Node, NodeDef, NodeInitializer } from "node-red";
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
  [Protobuf.Portnums.PortNum.TELEMETRY_APP]: new Protobuf.Telemetry.Telemetry(),
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
          console.debug(
            "No packet in ServiceEnvelope. Exiting without emitting msg",
          );
          return null;
        }

        const jsonWriteOptions = {
          emitDefaultValues: true,
          enumAsInteger: true,
        };

        console.debug("Serializing ServiceEnvelope to JSON for output");
        const out = decoded.toJson(jsonWriteOptions);

        switch (decoded.packet.payloadVariant.case) {
          case "encrypted":
            console.debug(
              "Payload was encrypted. Returning serialized ServiceEnvelope",
            );
            break;

          case "decoded": {
            try {
              const portNum = decoded.packet.payloadVariant.value.portnum;

              if (decoders[portNum] === null) {
                console.debug(`No decoder set for portnum ${portNum}`);
                break;
              }

              const { payload } = decoded.packet.payloadVariant.value;
              const decoder = decoders[portNum];

              if (decoder instanceof TextDecoder) {
                console.debug("TextDecoder detected. Decoding payload");
                out.packet.decoded.payload = decoder.decode(payload);
              } else {
                console.debug(
                  "Decoder was not null and not a TextDecoder. Assuming Protobuf decoder and decoding payload",
                );
                out.packet.decoded.payload = decoder
                  .fromBinary(payload)
                  .toJson(jsonWriteOptions);
              }

              console.debug(
                `Decoded payload to JSON:\n${JSON.stringify(out, null, 2)}`,
              );
            } catch (error) {
              console.error(`could not decode payload: ${error}`);
            }

            break;
          }
        }

        console.debug("Outputting payload from decode node");
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
