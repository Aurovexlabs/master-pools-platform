import Message, { Conversation } from '../models/Message.model.js'

export const getConversations = async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { user: req.user._id }
  const conversations = await Conversation.find(filter)
    .sort('-lastMessageAt -createdAt')
    .populate('user', 'name email avatar')
    .populate('quotation', 'referenceNumber status poolType')
  res.json({ conversations })
}

export const getOrCreateConversation = async (req, res) => {
  let conversation = await Conversation.findOne({ user: req.user._id, status: 'open', quotation: null })
  if (!conversation) {
    conversation = await Conversation.create({
      user: req.user._id,
      subject: req.body.subject || 'General Inquiry'
    })
  }
  res.json({ conversation })
}

export const getMessages = async (req, res) => {
  const { conversationId } = req.params
  const { page = 1, limit = 50 } = req.query
  const conversation = await Conversation.findById(conversationId)
  if (!conversation) return res.status(404).json({ message: 'Conversation not found' })
  if (req.user.role !== 'admin' && conversation.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Access denied' })
  }
  const total = await Message.countDocuments({ conversationId })
  const messages = await Message.find({ conversationId })
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate('sender', 'name avatar role')
  const updateField = req.user.role === 'admin' ? { unreadByAdmin: 0 } : { unreadByUser: 0 }
  await Conversation.findByIdAndUpdate(conversationId, updateField)
  await Message.updateMany(
    { conversationId, sender: { $ne: req.user._id }, isRead: false },
    { isRead: true, readAt: new Date() }
  )
  res.json({ messages: messages.reverse(), total, conversation })
}

export const sendMessage = async (req, res) => {
  const { conversationId } = req.params
  const { content, type = 'text' } = req.body
  const conversation = await Conversation.findById(conversationId)
  if (!conversation) return res.status(404).json({ message: 'Conversation not found' })
  if (req.user.role !== 'admin' && conversation.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Access denied' })
  }
  const message = await Message.create({
    conversationId,
    sender: req.user._id,
    senderRole: req.user.role,
    content,
    type
  })
  const inc = req.user.role === 'admin' ? { unreadByUser: 1 } : { unreadByAdmin: 1 }
  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: content.substring(0, 100),
    lastMessageAt: new Date(),
    $inc: inc
  })
  const populated = await message.populate('sender', 'name avatar role')
  res.status(201).json({ message: populated })
}

export const closeConversation = async (req, res) => {
  const conversation = await Conversation.findById(req.params.conversationId)
  if (!conversation) return res.status(404).json({ message: 'Conversation not found' })

  // Only the owner or an administrator may close a conversation.
  if (
    req.user.role !== 'admin' &&
    conversation.user.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({ message: 'Access denied' })
  }

  conversation.status = 'closed'
  await conversation.save()
  res.json({ conversation })
}
