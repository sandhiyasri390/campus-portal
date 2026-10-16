const Notification = require('../models/Notification');

exports.getMyNotifications = async (req, res) => {
  const { unreadOnly } = req.query;
  const filter = { recipient: req.user.id };
  if (unreadOnly === 'true') filter.isRead = false;

  const notifications = await Notification.find(filter).sort('-createdAt').limit(50);
  const unreadCount = await Notification.countDocuments({ recipient: req.user.id, isRead: false });
  res.json({ count: notifications.length, unreadCount, notifications });
};

exports.markAsRead = async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user.id },
    { isRead: true },
    { new: true }
  );
  if (!notification) return res.status(404).json({ message: 'Notification not found' });
  res.json({ notification });
};

exports.markAllAsRead = async (req, res) => {
  await Notification.updateMany({ recipient: req.user.id, isRead: false }, { isRead: true });
  res.json({ message: 'All notifications marked as read' });
};
