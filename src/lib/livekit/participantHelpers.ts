import { Track, type Participant as LKParticipant, type TrackPublication } from 'livekit-client';

/** Finds the currently subscribed (or local) camera video track for a participant, if any. */
export function getCameraPublication(participant: LKParticipant): TrackPublication | undefined {
  return participant.getTrackPublication(Track.Source.Camera);
}

export function getScreenSharePublication(participant: LKParticipant): TrackPublication | undefined {
  return participant.getTrackPublication(Track.Source.ScreenShare);
}

export function getMicrophonePublication(participant: LKParticipant): TrackPublication | undefined {
  return participant.getTrackPublication(Track.Source.Microphone);
}

export function getScreenShareAudioPublication(participant: LKParticipant): TrackPublication | undefined {
  return participant.getTrackPublication(Track.Source.ScreenShareAudio);
}
