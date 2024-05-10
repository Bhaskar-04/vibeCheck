import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverID } = req.params;
    const senderID = req.user._id;
    

    let conversation = await Conversation.findOne({
      participants: { $all: [senderID, receiverID] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderID, receiverID],
      });
    }

    const newMessage = new Message({
      senderID,
      receiverID,
      message,
    });

    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }
    res.status(201).json(newMessage);

    await conversation.save();
    await newMessage.save();


  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in SendMessage Controller", error.message);
  }
};

export const getMessage = async (req,res) => {
  try {
    const {id:userToChatId} = req.params;
    const senderId = req.user._id;
    const conversation = await Conversation.findOne({
      participants : {$all:[senderId,userToChatId]}
    }).populate("messages");

    if(!conversation) res.status(200).json([])

    const messages = conversation.messages

    res.status(200).json(messages)

  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in SendMessage Controller", error.message);
  }
}
