import Meeting from "../models/metting.model.js";
import { nanoid } from "nanoid"; // Generate unique meeting IDs

export const createMeeting = async (req, res) => {
  try {
    const { title, description, startTime } = req.body;
    const meetingId = nanoid(10); // Generate a 10-character unique meeting ID

    const newMeeting = new Meeting({
      hostId: req.user.id,
      meetingId,
      title,
      description,
      startTime,
      status: "scheduled",
    });

    await newMeeting.save();
    res.status(201).json({ success: true, meeting: newMeeting });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};


export const joinMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const meeting = await Meeting.findOne({ meetingId });

    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    if (!meeting.participants.includes(req.user.id)) {
      meeting.participants.push(req.user.id);
      await meeting.save();
    }

    res.json({ success: true, meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};


export const getMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({ hostId: req.user.id }).sort({ startTime: 1 });
    res.json({ success: true, meetings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
