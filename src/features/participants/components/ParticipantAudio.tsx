import { memo } from 'react';
import type { LocalAudioTrack, RemoteAudioTrack } from 'livekit-client';
import { useTrackAttachment } from '../../../hooks/useTrackAttachment';
import { useAudioSink } from '../../../hooks/useAudioSink';
import { useAudioOutputDeviceId } from '../../meeting/AudioOutputContext';

export interface ParticipantAudioProps {
  track: LocalAudioTrack | RemoteAudioTrack | undefined;
}

/** Invisible <audio> sink for a remote participant's microphone. Never used for the local participant — that would echo their own voice back. */
function ParticipantAudioComponent({ track }: ParticipantAudioProps) {
  const audioRef = useTrackAttachment<HTMLAudioElement>(track);
  const speakerDeviceId = useAudioOutputDeviceId();
  useAudioSink(audioRef, speakerDeviceId);

  if (!track) return null;

  // Live WebRTC microphone audio — there is no caption track for a real-time peer audio stream.

  return <audio ref={audioRef} autoPlay />;
}

export const ParticipantAudio = memo(ParticipantAudioComponent);
