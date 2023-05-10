import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  isActivated: { type: Boolean, default: false },
  activationToken: { type: String },
  titles: [{ type: mongoose.Schema.Types.ObjectId }],
});

export default mongoose.model('User', userSchema);
