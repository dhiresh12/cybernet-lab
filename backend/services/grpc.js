const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

class GRPCServer {
  constructor(deviceManager, labEngine, telemetryStream) {
    this.deviceManager = deviceManager;
    this.labEngine = labEngine;
    this.telemetryStream = telemetryStream;
    this.server = null;
  }

  start(port) {
    const protoPath = path.join(__dirname, '..', 'proto', 'cybernet.proto');
    const packageDef = protoLoader.loadSync(protoPath, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true
    });
    
    const protoDescriptor = grpc.loadPackageDefinition(packageDef);
    const cybernetLab = protoDescriptor.cybernet.lab;
    const cybernetTelemetry = protoDescriptor.cybernet.lab;

    this.server = new grpc.Server();

    this.server.addService(cybernetLab.LabService.service, {
      getDeviceInfo: (call, callback) => {
        const deviceInfo = this.deviceManager.getDeviceInfo(call.request.device_id);
        callback(null, deviceInfo);
      },
      getLabState: (call, callback) => {
        const state = this.labEngine.getState();
        callback(null, state);
      },
      executeCommand: async (call, callback) => {
        const result = await this.labEngine.executeCommand(
          call.request.device_id,
          call.request.command
        );
        callback(null, result);
      },
      injectError: async (call, callback) => {
        const result = await this.labEngine.injectError(
          call.request.lab_id,
          call.request.error_type
        );
        callback(null, result);
      }
    });

    this.server.addService(cybernetTelemetry.TelemetryService.service, {
      stream: (call) => {
        const client = call;
        this.telemetryStream.addClient({
          send: (data) => {
            client.write(data);
          }
        });
      }
    });

    this.server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), () => {
      console.log(`gRPC server running on port ${port}`);
    });
  }

  stop() {
    if (this.server) {
      this.server.forceShutdown();
    }
  }
}

module.exports = { GRPCServer };
