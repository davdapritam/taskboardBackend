const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Task Title Required']
    },
    description: {
        type: String,
        required: [true, 'Task Description Required']
    },
    assign: {
        type: String,
        required: [true, 'Assign  Required']
    },
    boardId: {
        type: String,
        required: [true, "Board Id Required"]
    }
}, { timestamps: true });

const task = mongoose.model('Task', TaskSchema);
module.exports = { task }