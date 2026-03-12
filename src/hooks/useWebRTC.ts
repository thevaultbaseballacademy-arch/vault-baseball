import { useRef, useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

type CallState = "idle" | "connecting" | "connected" | "disconnected" | "error";

interface UseWebRTCOptions {
  sessionId: string;
  userId: string;
  onRemoteStream?: (stream: MediaStream) => void;
}

export const useWebRTC = ({ sessionId, userId, onRemoteStream }: UseWebRTCOptions) => {
  const [callState, setCallState] = useState<CallState>("idle");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const isInitiatorRef = useRef(false);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);

  const channelName = `webrtc-${sessionId}`;

  // Keep localStreamRef in sync
  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  const cleanup = useCallback(() => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    pendingCandidates.current = [];
    setRemoteStream(null);
    setCallState("idle");
  }, []);

  const createPeerConnection = useCallback(() => {
    // Close any existing connection first
    if (peerConnection.current) {
      peerConnection.current.close();
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate && channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "ice-candidate",
          payload: { candidate: event.candidate.toJSON(), from: userId },
        });
      }
    };

    pc.ontrack = (event) => {
      const newRemoteStream = new MediaStream();
      event.streams[0]?.getTracks().forEach((track) => {
        newRemoteStream.addTrack(track);
      });
      setRemoteStream(newRemoteStream);
      onRemoteStream?.(newRemoteStream);
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      console.log("[WebRTC] Connection state:", state);
      switch (state) {
        case "connected":
          setCallState("connected");
          break;
        case "disconnected":
          // Give a brief grace period before marking disconnected
          setTimeout(() => {
            if (pc.connectionState === "disconnected") {
              setCallState("disconnected");
            }
          }, 3000);
          break;
        case "failed":
          setCallState("disconnected");
          break;
        case "closed":
          setCallState("idle");
          break;
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log("[WebRTC] ICE state:", pc.iceConnectionState);
    };

    peerConnection.current = pc;
    return pc;
  }, [userId, onRemoteStream]);

  const addLocalTracks = useCallback((pc: RTCPeerConnection) => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const existingSenders = pc.getSenders();
    stream.getTracks().forEach((track) => {
      // Don't add if already added
      if (!existingSenders.find((s) => s.track === track)) {
        pc.addTrack(track, stream);
      }
    });
  }, []);

  const createAndSendOffer = useCallback(async (pc: RTCPeerConnection) => {
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      channelRef.current?.send({
        type: "broadcast",
        event: "offer",
        payload: { sdp: offer, from: userId },
      });
      console.log("[WebRTC] Offer sent");
    } catch (err) {
      console.error("[WebRTC] Failed to create/send offer:", err);
    }
  }, [userId]);

  const flushPendingCandidates = useCallback(async (pc: RTCPeerConnection) => {
    for (const candidate of pendingCandidates.current) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.warn("[WebRTC] Failed to add queued ICE candidate:", e);
      }
    }
    pendingCandidates.current = [];
  }, []);

  const setupSignaling = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase.channel(channelName, {
      config: { broadcast: { self: false } },
    });

    channel
      .on("broadcast", { event: "offer" }, async ({ payload }) => {
        if (payload.from === userId) return;
        console.log("[WebRTC] Received offer");

        let pc = peerConnection.current;
        if (!pc || pc.signalingState === "closed") {
          pc = createPeerConnection();
        }

        addLocalTracks(pc);

        try {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          await flushPendingCandidates(pc);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          channel.send({
            type: "broadcast",
            event: "answer",
            payload: { sdp: answer, from: userId },
          });
          console.log("[WebRTC] Answer sent");
        } catch (err) {
          console.error("[WebRTC] Failed to handle offer:", err);
        }
      })
      .on("broadcast", { event: "answer" }, async ({ payload }) => {
        if (payload.from === userId) return;
        console.log("[WebRTC] Received answer");

        const pc = peerConnection.current;
        if (!pc) return;

        try {
          if (pc.signalingState === "have-local-offer") {
            await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
            await flushPendingCandidates(pc);
          } else {
            console.warn("[WebRTC] Ignoring answer in state:", pc.signalingState);
          }
        } catch (err) {
          console.error("[WebRTC] Failed to handle answer:", err);
        }
      })
      .on("broadcast", { event: "ice-candidate" }, async ({ payload }) => {
        if (payload.from === userId) return;

        const pc = peerConnection.current;
        if (!pc || !pc.remoteDescription) {
          // Queue candidates until remote description is set
          pendingCandidates.current.push(payload.candidate);
          return;
        }

        try {
          await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
        } catch (e) {
          console.warn("[WebRTC] Failed to add ICE candidate:", e);
        }
      })
      // When a peer joins, the initiator (coach) re-sends the offer
      .on("broadcast", { event: "ready" }, async ({ payload }) => {
        if (payload.from === userId) return;
        console.log("[WebRTC] Peer ready signal received");

        if (isInitiatorRef.current && peerConnection.current) {
          // Re-create connection for a clean negotiation
          const pc = createPeerConnection();
          addLocalTracks(pc);
          await createAndSendOffer(pc);
        }
      })
      .on("broadcast", { event: "hang-up" }, ({ payload }) => {
        if (payload.from === userId) return;
        cleanup();
      })
      .subscribe((status) => {
        console.log("[WebRTC] Channel status:", status);
      });

    channelRef.current = channel;
    return channel;
  }, [channelName, userId, createPeerConnection, addLocalTracks, createAndSendOffer, flushPendingCandidates, cleanup]);

  const startCall = useCallback(
    async (initiator = true) => {
      try {
        setCallState("connecting");
        isInitiatorRef.current = initiator;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
          audio: true,
        });
        localStreamRef.current = stream;
        setLocalStream(stream);

        const pc = createPeerConnection();
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        const channel = setupSignaling();

        // Wait for channel to be fully subscribed before signaling
        // Use a polling approach since subscribe callback is unreliable for timing
        const waitForSubscription = () =>
          new Promise<void>((resolve) => {
            const check = () => {
              // Channel is ready once subscribe has been called
              // Give Realtime a moment to propagate
              setTimeout(resolve, 1500);
            };
            check();
          });

        await waitForSubscription();

        if (initiator) {
          // Coach: send offer immediately
          await createAndSendOffer(pc);
        } else {
          // Athlete: signal readiness so the coach re-sends the offer
          channel.send({
            type: "broadcast",
            event: "ready",
            payload: { from: userId },
          });
          console.log("[WebRTC] Sent ready signal");
        }
      } catch (err) {
        console.error("[WebRTC] Failed to start call:", err);
        setCallState("error");
      }
    },
    [createPeerConnection, setupSignaling, createAndSendOffer, userId]
  );

  const hangUp = useCallback(() => {
    channelRef.current?.send({
      type: "broadcast",
      event: "hang-up",
      payload: { from: userId },
    });
    cleanup();
  }, [cleanup, userId]);

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
      setIsMuted((m) => !m);
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
      setIsVideoOff((v) => !v);
    }
  }, []);

  const switchCamera = useCallback(async () => {
    const stream = localStreamRef.current;
    if (!stream || !peerConnection.current) return;
    const currentTrack = stream.getVideoTracks()[0];
    const currentFacing = currentTrack?.getSettings().facingMode;
    const newFacing = currentFacing === "environment" ? "user" : "environment";

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacing },
      });
      const newTrack = newStream.getVideoTracks()[0];

      const sender = peerConnection.current
        .getSenders()
        .find((s) => s.track?.kind === "video");
      if (sender) await sender.replaceTrack(newTrack);

      currentTrack?.stop();
      stream.removeTrack(currentTrack);
      stream.addTrack(newTrack);
    } catch (e) {
      console.warn("[WebRTC] Camera switch failed:", e);
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    callState,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    startCall,
    hangUp,
    toggleMute,
    toggleVideo,
    switchCamera,
  };
};
