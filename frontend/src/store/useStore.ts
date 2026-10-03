import { create } from 'zustand';

interface AppState {
  isMatchmaking: boolean;
  matchFound: boolean;
  roomId: string | null;
  peerId: string | null;
  remoteStream: MediaStream | null;
  localStream: MediaStream | null;
  setMatchmaking: (isMatchmaking: boolean) => void;
  setMatch: (roomId: string, peerId: string) => void;
  clearMatch: () => void;
  setLocalStream: (stream: MediaStream | null) => void;
  setRemoteStream: (stream: MediaStream | null) => void;
}

export const useStore = create<AppState>((set) => ({
  isMatchmaking: false,
  matchFound: false,
  roomId: null,
  peerId: null,
  remoteStream: null,
  localStream: null,
  
  setMatchmaking: (isMatchmaking) => set({ isMatchmaking }),
  
  setMatch: (roomId, peerId) => set({ 
    matchFound: true, 
    roomId, 
    peerId,
    isMatchmaking: false 
  }),
  
  clearMatch: () => set({ 
    matchFound: false, 
    roomId: null, 
    peerId: null,
    remoteStream: null 
  }),

  setLocalStream: (stream) => set({ localStream: stream }),
  setRemoteStream: (stream) => set({ remoteStream: stream }),
}));
