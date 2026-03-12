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
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const isInitiatorRef = useRef(false);
  const retryTimerRef = useRef<number | null>(null);

  const channelName = `webrtc-${sessionId}`;

  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  const clearRetryTimer = useCallback(() => {
    if (retryTimerRef.current) {
      window.clearInterval(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const cleanup = useCallback(() => {
    clearRetryTimer();

    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    pendingCandidatesRef.current = [];
    setLocalStream(null);
    setRemoteStream(null);
    setIsMuted(false);
    setIsVideoOff(false);
    setCallState("idle");
  }, [clearRetryTimer]);

  const createPeerConnection = useCallback(() => {
    if (peerConnection.current) {
      peerConnection.current.close();
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (!event.candidate || !channelRef.current) return;

      channelRef.current.send({
        type: "broadcast",
        event: "ice-candidate",
        payload: {
          candidate: event.candidate.toJSON(),
          from: userId,
        },
      });
    };

    pc.ontrack = (event) => {
      const [incomingStream] = event.streams;
      if (!incomingStream) return;
      setRemoteStream(incomingStream);
      onRemoteStream?.(incomingStream);
    };

    pc.onconnectionstatechange = () => {
      switch (pc.connectionState) {
        case "connected":
          clearRetryTimer();
          setCallState("connected");
          break;
        case "failed":
          clearRetryTimer();
          setCallState("disconnected");
          break;
        case "disconnected":
          // transient network drops happen; keep retry loop alive briefly
          setTimeout(() => {
            if (pc.connectionState === "disconnected") {
              setCallState("disconnected");
            }
          }, 3000);
          break;
        case "closed":
          clearRetryTimer();
          setCallState("idle");
          break;
      }
    };

    peerConnection.current = pc;
    return pc;
  }, [clearRetryTimer, onRemoteStream, userId]);

  const addLocalTracks = useCallback((pc: RTCPeerConnection) => {
    const stream = localStreamRef.current;
    if (!stream) return;

    const existingKinds = new Set(pc.getSenders().map((sender) => sender.track?.kind));

    stream.getTracks().forEach((track) => {
      if (!existingKinds.has(track.kind)) {
        pc.addTrack(track, stream);
      }
    });
  }, []);

  const flushPendingCandidates = useCallback(async (pc: RTCPeerConnection) => {
    if (!pendingCandidatesRef.current.length) return;

    const candidates = [...pendingCandidatesRef.current];
    pendingCandidatesRef.current = [];

    for (const candidate of candidates) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {
        // ignore malformed/expired candidates
      }
    }
  }, []);

  const sendOffer = useCallback(async (pc: RTCPeerConnection) => {
    if (!channelRef.current) return;

    if (pc.signalingState === "have-local-offer" && pc.localDescription) {
      await channelRef.current.send({
        type: "broadcast",
        event: "offer",
        payload: { sdp: pc.localDescription, from: userId },
      });
      return;
    }

    if (pc.signalingState !== "stable") return;

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    await channelRef.current.send({
      type: "broadcast",
      event: "offer",
      payload: { sdp: offer, from: userId },
    });
  }, [userId]);

  const startRetryLoop = useCallback(() => {
    clearRetryTimer();

    retryTimerRef.current = window.setInterval(async () => {
      const pc = peerConnection.current;
      const channel = channelRef.current;
      if (!pc || !channel) return;

      if (pc.connectionState === "connected" || pc.connectionState === "closed") {
        clearRetryTimer();
        return;
      }

      try {
        if (isInitiatorRef.current) {
          await sendOffer(pc);
        } else if (!pc.remoteDescription) {
          await channel.send({
            type: "broadcast",
            event: "ready",
            payload: { from: userId },
          });
        }
      } catch {
        // keep retrying silently
      }
    }, 2500);
  }, [clearRetryTimer, sendOffer, userId]);

  const setupSignaling = useCallback(async () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channel = supabase.channel(channelName, {
      config: { broadcast: { self: false } },
    });

    channel
      .on("broadcast", { event: "ready" }, async ({ payload }) => {
        if (payload.from === userId || !isInitiatorRef.current) return;
        const pc = peerConnection.current;
        if (!pc) return;
        try {
          await sendOffer(pc);
        } catch {
          // retry loop handles future attempts
        }
      })
      .on("broadcast", { event: "offer" }, async ({ payload }) => {
        if (payload.from === userId) return;

        let pc = peerConnection.current;
        if (!pc || pc.signalingState === "closed") {
          pc = createPeerConnection();
          addLocalTracks(pc);
        }

        try {
          if (pc.signalingState === "have-local-offer") {
            // avoid glare deadlock by resetting local offer and accepting remote
            await pc.setLocalDescription({ type: "rollback" });
          }

          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          await flushPendingCandidates(pc);

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          await channel.send({
            type: "broadcast",
            event: "answer",
            payload: { sdp: answer, from: userId },
          });
        } catch {
          setCallState("error");
        }
      })
      .on("broadcast", { event: "answer" }, async ({ payload }) => {
        if (payload.from === userId) return;

        const pc = peerConnection.current;
        if (!pc) return;

        try {
          if (pc.signalingState === "have-local-offer") {
            await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
            await flushPendingCandidates(pc);
          }
        } catch {
          setCallState("error");
        }
      })
      .on("broadcast", { event: "ice-candidate" }, async ({ payload }) => {
        if (payload.from === userId) return;

        const pc = peerConnection.current;
        if (!pc || !pc.remoteDescription) {
          pendingCandidatesRef.current.push(payload.candidate);
          return;
        }

        try {
          await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
        } catch {
          // ignore invalid ICE candidates
        }
      })
      .on("broadcast", { event: "hang-up" }, ({ payload }) => {
        if (payload.from === userId) return;
        cleanup();
      });

    const subscribed = await new Promise<boolean>((resolve) => {
      const timeout = window.setTimeout(() => resolve(false), 8000);

      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          window.clearTimeout(timeout);
          resolve(true);
        }
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          window.clearTimeout(timeout);
          resolve(false);
        }
      });
    });

    if (!subscribed) {
      setCallState("error");
      throw new Error("Failed to subscribe to signaling channel");
    }

    channelRef.current = channel;
    return channel;
  }, [addLocalTracks, channelName, cleanup, createPeerConnection, flushPendingCandidates, sendOffer, userId]);

  const startCall = useCallback(async (initiator = true) => {
    try {
      setCallState("connecting");
      isInitiatorRef.current = initiator;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: true,
      });

      localStreamRef.current = stream;
      setLocalStream(stream);

      const pc = createPeerConnection();
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const channel = await setupSignaling();

      if (initiator) {
        await sendOffer(pc);
      } else {
        await channel.send({
          type: "broadcast",
          event: "ready",
          payload: { from: userId },
        });
      }

      startRetryLoop();
    } catch {
      setCallState("error");
    }
  }, [createPeerConnection, sendOffer, setupSignaling, startRetryLoop, userId]);

  const hangUp = useCallback(() => {
    channelRef.current?.send({
      type: "broadcast",
      event: "hang-up",
      payload: { from: userId },
    });

    cleanup();
  }, [cleanup, userId]);

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;

    stream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });

    setIsMuted((prev) => !prev);
  }, []);

  const toggleVideo = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;

    stream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });

    setIsVideoOff((prev) => !prev);
  }, []);

  const switchCamera = useCallback(async () => {
    const stream = localStreamRef.current;
    const pc = peerConnection.current;

    if (!stream || !pc) return;

    const currentTrack = stream.getVideoTracks()[0];
    const currentFacingMode = currentTrack?.getSettings().facingMode;
    const nextFacingMode = currentFacingMode === "environment" ? "user" : "environment";

    try {
      const replacementStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: nextFacingMode },
      });

      const replacementTrack = replacementStream.getVideoTracks()[0];
      const videoSender = pc.getSenders().find((sender) => sender.track?.kind === "video");

      if (videoSender) {
        await videoSender.replaceTrack(replacementTrack);
      }

      if (currentTrack) {
        currentTrack.stop();
        stream.removeTrack(currentTrack);
      }

      stream.addTrack(replacementTrack);
      setLocalStream(new MediaStream(stream.getTracks()));
    } catch {
      // keep current camera if switch fails
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

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
