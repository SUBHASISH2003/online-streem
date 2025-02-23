import { useLocation } from 'react-router-dom';
import VideoCall from './VideoCall';
function MeetingRoom() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const meetingId = queryParams.get('meetingId') || 'test-room';

  return (
    <div className="container mx-auto p-6 flex-grow">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Meeting Room: {meetingId}</h2>
      <VideoCall meetingId={meetingId} />
    </div>
  );
}

export default MeetingRoom;