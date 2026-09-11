import { create } from 'zustand';

export const useLabStore = create((set, get) => ({
  currentLab: null,
  currentStep: null,
  labState: null,
  topology: { nodes: [], edges: [] },
  devices: new Map(),
  setLab: (lab) => set({ currentLab: lab }),
  setStep: (step) => set({ currentStep: step }),
  setLabState: (state) => set({ labState: state }),
  setTopology: (topology) => set({ topology }),
  addDevice: (device) => set((prev) => ({ devices: new Map(prev.devices).set(device.id, device) })),
  updateDevice: (id, patch) => set((prev) => {
    const devices = new Map(prev.devices);
    devices.set(id, { ...devices.get(id), ...patch });
    return { devices };
  }),
  removeDevice: (id) => set((prev) => {
    const devices = new Map(prev.devices);
    devices.delete(id);
    return { devices };
  }),
  reset: () => set({
    currentLab: null,
    currentStep: null,
    labState: null,
    topology: { nodes: [], edges: [] },
    devices: new Map()
  })
}));
