const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskBoardSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Task Board Title Required']
    },
    taskIds: [{
        type: Schema.Types.ObjectId,
        ref: 'Task'
    }],
    userId: {
        type: String,
        required: [true, "User ID Required"]
    }
}, { timestamps: true });

const TaskBoard = mongoose.model('TaskBoard', TaskBoardSchema);

module.exports = { TaskBoard };
