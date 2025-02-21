import Room from '../models/room.model.js';

const createRoom = async (req, res) => {
  try {
    const roomId = Math.random().toString(36).substring(7);
    const room = new Room({
      roomId,
      creator: req.user.id,
      participants: [req.user.id],
    });
    await room.save();
    res.status(201).json({ roomId });
  } catch (err) {
    res.status(400).send('Error creating room: ' + err.message);
  }
};

const joinRoom = async (req, res) => {
  try {
    const { roomId } = req.body;
    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).send('Room not found');

    if (!room.participants.includes(req.user.id)) {
      room.participants.push(req.user.id);
      await room.save();
    }
    res.status(200).json({ roomId });
  } catch (err) {
    res.status(400).send('Error joining room: ' + err.message);
  }
};

export { createRoom, joinRoom };