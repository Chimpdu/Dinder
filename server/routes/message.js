var express = require('express');
var router = express.Router();
const Message = require("../models/Message");
const verifyToken = require('../auth/verifyToken');

/* Post request for sending messages */
router.post('/', verifyToken, async(req, res, next)=>{
  try {
    const { sender, receiver, content } = req.body;
    
    const message = new Message({ sender, receiver, content });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
/* Get request for receiving messages */
router.get('/:userId/:contactId', verifyToken, async (req, res, next) => {
  try {
    const { userId, contactId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: contactId },
        { sender: contactId, receiver: userId }
      ]
    }).sort('createdAt');
    res.json(messages);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
/* This feature was not implemented, ran out of time... */
router.patch('/read/:userId/:contactId', verifyToken, async (req, res, next) => {
  try {
    const { userId, contactId } = req.params;
    await Message.updateMany({ sender: contactId, receiver: userId, isRead: false }, { $set: { isRead: true } });
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;