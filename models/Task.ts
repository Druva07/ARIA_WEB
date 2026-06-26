import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  content: { type: String, required: true },
  done: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);
