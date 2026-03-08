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
  const remoteStreamRef = useRef<MediaStream>(new MediaStream());

  const channelName = `webrtc-${sessionId}`;

  const cleanup = useCallback(() => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
      setLocalStream(null);
    }
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setRemoteStream(null);
    setCallState("idle");
  }, [localStream]);

  const createPeerConnection = useCallback(() => {
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
      event.streams[0]?.getTracks().forEach((track) => {
        remoteStreamRef.current.addTrack(track);
      });
      setRemoteStream(remoteStreamRef.current);
      onRemoteStream?.(remoteStreamRef.current);
    };

    pc.onconnectionstatechange = () => {
      switch (pc.connectionState) {
        case "connected":
          setCallState("connected");
          break;
        case "disconnected":
        case "failed":
          setCallState("disconnected");
          break;
        case "closed":
          setCallState("idle");
          break;
      }
    };

    peerConnection.current = pc;
    return pc;
  }, [userId, onRemoteStream]);

  const setupSignaling = useCallback(() => {
    const channel = supabase.channel(channelName, {
      config: { broadcast: { self: false } },
    });

    channel
      .on("broadcast", { event: "offer" }, async ({ payload }) => {
        if (payload.from === userId) return;
        const pc = peerConnection.current || createPeerConnection();

        // Add local tracks if we have them
        if (localStream) {
          localStream.getTracks().forEach((track) => {
            pc.addTrack(track, localStream);
          });
        }

        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        channel.send({
          type: "broadcast",
          event: "answer",
          payload: { sdp: answer, from: userId },
        });
      })
      .on("broadcast", { event: "answer" }, async ({ payload }) => {
        if (payload.from === userId) return;
        if (peerConnection.current) {
          await peerConnection.current.setRemoteDescription(
            new RTCSessionDescription(payload.sdp)
          );
        }
      })
      .on("broadcast", { event: "ice-candidate" }, async ({ payload }) => {
        if (payload.from === userId) return;
        if (peerConnection.current) {
          try {
            await peerConnection.current.addIceCandidate(
              new RTCIceCandidate(payload.candidate)
            );
          } catch (e) {
            console.warn("Failed to add ICE candidate:", e);
          }
        }
      })
      .on("broadcast", { event: "hang-up" }, ({ payload }) => {
        if (payload.from === userId) return;
        cleanup();
      })
      .subscribe();

    channelRef.current = channel;
    return channel;
  }, [channelName, userId, createPeerConnection, localStream, cleanup]);

  const startCall = useCallback(
    async (initiator = true) => {
      try {
        setCallState("connecting");

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "environment" },
          audio: true,
        });
        setLocalStream(stream);

        const pc = createPeerConnection();
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        setupSignaling();

        if (initiator) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          // Small delay to ensure channel is subscribed
          setTimeout(() => {
            channelRef.current?.send({
              type: "broadcast",
              event: "offer",
              payload: { sdp: offer, from: userId },
            });
          }, 1000);
        }
      } catch (err) {
        console.error("Failed to start call:", err);
        setCallState("error");
      }
    },
    [createPeerConnection, setupSignaling, userId]
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
    if (localStream) {
      localStream.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
      setIsMuted((m) => !m);
    }
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
      setIsVideoOff((v) => !v);
    }
  }, [localStream]);

  const switchCamera = useCallback(async () => {
    if (!localStream || !peerConnection.current) return;
    const currentTrack = localStream.getVideoTracks()[0];
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
      localStream.removeTrack(currentTrack);
      localStream.addTrack(newTrack);
    } catch (e) {
      console.warn("Camera switch failed:", e);
    }
  }, [localStream]);

  useEffect(() => {
    return () => {
      cleanup();
    };
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
