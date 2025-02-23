import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';

const socket = io('http://localhost:5000');

function VideoCall({ meetingId }) {
  const [stream, setStream] = useState(null);
  const [peers, setPeers] = useState([]);
  const videoRef = useRef();
  const peersRef = useRef([]);
  const userId = socket.id;

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        videoRef.current.srcObject = stream;

        socket.emit('join-room', meetingId, userId, ({ success, meeting }) => {
          if (success && meeting) {
            const newPeers = [];
            meeting.participants.forEach((peerId) => {
              if (peerId !== userId) {
                const peer = createPeer(peerId, userId, stream);
                peersRef.current.push({ peerId, peer });
                newPeers.push({ peerId, peer });
              }
            });
            setPeers(newPeers);
          }
        });

        socket.on('user-connected', (peerId) => {
          const peer = addPeer(peerId, userId, stream);
          peersRef.current.push({ peerId, peer });
          setPeers((prev) => [...prev, { peerId, peer }]);
        });

        socket.on('receiving-signal', (payload) => {
          const peer = addPeer(payload.callerId, userId, stream);
          peer.signal(payload.signal);
          peersRef.current.push({ peerId: payload.callerId, peer });
          setPeers((prev) => [...prev, { peerId: payload.callerId, peer }]);
        });

        socket.on('signal-returned', (payload) => {
          const item = peersRef.current.find((p) => p.peerId === payload.id);
          if (item) item.peer.signal(payload.signal);
        });

        socket.on('user-disconnected', (peerId) => {
          const newPeers = peersRef.current.filter((p) => p.peerId !== peerId);
          peersRef.current = newPeers;
          setPeers(newPeers.map((p) => ({ peerId: p.peerId, peer: p.peer })));
        });
      })
      .catch((err) => console.error('Error accessing media devices:', err));

    return () => {
      socket.off('user-connected');
      socket.off('receiving-signal');
      socket.off('signal-returned');
      socket.off('user-disconnected');
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, [meetingId]);

  function createPeer(userToSignal, callerId, stream) {
    const peer = new Peer({ initiator: true, trickle: false, stream });
    peer.on('signal', (signal) => {
      socket.emit('sending-signal', { userToSignal, callerId, signal });
    });
    peer.on('stream', (peerStream) => {});
    return peer;
  }

  function addPeer(incomingUserId, callerId, stream) {
    const peer = new Peer({ initiator: false, trickle: false, stream });
    peer.on('signal', (signal) => {
      socket.emit('returning-signal', { signal, callerId: incomingUserId });
    });
    peer.on('stream', (peerStream) => {});
    return peer;
  }

  return (
    <div className="relative bg-black h-[80vh] rounded-lg overflow-hidden shadow-lg">
      <video ref={videoRef} autoPlay muted className="absolute top-0 left-0 w-1/2 h-1/2 object-cover" />
      {peers.map((peerObj, index) => (
        <video
          key={index}
          ref={(ref) => ref && (ref.srcObject = peerObj.peer.stream)}
          autoPlay
          className="absolute top-0 right-0 w-1/2 h-1/2 object-cover"
        />
      ))}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
        <button className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default VideoCall;