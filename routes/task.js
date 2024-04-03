const express = require('express');
const router = express.Router();
const { task } = require('../models/task.model');
const { TaskBoard } = require('../models/taskboard.model');

router.post('/', async (req, res) => {
    try {
        const { title, description, assign, boardId } = req.body;

        const existingTask = await task.findOne({ title, boardId });

        if (existingTask) {
            return res.status(200).json({ Status: 2, message: "Task with the same title on board already exists" });
        }

        const newTask = new task({ title, description, assign, boardId });
        await newTask.save();

        let taskBoard = await TaskBoard.findById(boardId);

        if (!taskBoard) {
            taskBoard = new TaskBoard({ title: "Default", boardId, taskIds: [newTask._id] });
        } else {
            taskBoard.taskIds.push(newTask._id);
        }
        await taskBoard.save();

        res.status(200).json({
            Status: 1,
            message: "Task Added Successfully",
        });

    } catch (error) {
        res.status(500).json({ Status: 0, message: "Internal Server Error", error: error.message });
    }
});



router.get('/tasks/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const tasks = await task.findOne({ _id: taskId });

        if (!tasks) {
            return res.status(404).json({ Status: 0, message: "Task not found" });
        }

        const simplifiedData = {
            title: tasks.title,
            description: tasks.description,
            assign: tasks.assign,
            boardId: tasks.boardId,
            _id: tasks._id
        }

        res.status(200).json({ Status: 1, data: simplifiedData });
    } catch (error) {
        res.status(500).json({ Status: 0, message: "Internal Server Error", error: error.message });
    }
});

router.put('/tasks/update/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const updatedTask = await task.findByIdAndUpdate(taskId, req.body, { new: true });
        if (!updatedTask) {
            return res.status(404).json({ Status: 0, message: "Task not found" });
        }
        res.status(200).json({ Status: 1, message: "Task updated successfully" });
    } catch (error) {
        res.status(500).json({ Status: 0, message: "Internal Server Error", error: error.message });
    }
});

router.delete('/tasks/delete/:id/:boardId', async (req, res) => {
    try {
        const taskId = req.params.id;
        const boardId = req.params.boardId;
        const deletedTask = await task.findByIdAndDelete(taskId);

        const previousTaskBoard = await TaskBoard.findById(boardId);
        if (previousTaskBoard) {
            previousTaskBoard.taskIds = previousTaskBoard.taskIds.filter(id => id.toString() !== taskId);
            await previousTaskBoard.save();
        }

        if (!deletedTask) {
            return res.status(404).json({ Status: 0, message: "Task not found" });
        }
        res.status(200).json({ Status: 1, message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ Status: 0, message: "Internal Server Error", error: error.message });
    }
});



router.post('/taskboards', async (req, res) => {
    try {
        const { title, userId } = req.body;

        const existingTaskBoard = await TaskBoard.findOne({ title, userId });

        if (existingTaskBoard) {
            return res.status(200).json({ Status: 2, message: "Task Board with the same Title already exists" });
        }

        const newTaskBoard = new TaskBoard({ title, userId });
        await newTaskBoard.save();

        res.status(200).json({
            Status: 1,
            message: "Task Board Added Successfully"
        });

    } catch (error) {
        res.status(500).json({ Status: 0, message: "Internal Server Error", error: error.message });
    }
});

router.get('/user/taskboards/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        const taskBoard = await TaskBoard.find({ userId }).populate('taskIds');
        if (!taskBoard) {
            return res.status(404).json({ Status: 0, message: "Task Board not found" });
        }

        const simplifiedData = taskBoard.map(item => ({
            _id: item._id,
            title: item.title,
            taskIds: item.taskIds.map((task) => ({
                _id: task._id,
                assign: task.assign,
                boardId: task.boardId,
                description: task.description,
                title: task.title
            }))
        }));

        res.status(200).json({ Status: 1, data: simplifiedData });
    } catch (error) {
        res.status(500).json({ Status: 0, message: "Internal Server Error", error: error.message });
    }
});

router.get('/taskboards/:id', async (req, res) => {
    try {
        const taskBoardId = req.params.id;
        const taskBoard = await TaskBoard.findById(taskBoardId).populate('taskIds');
        if (!taskBoard) {
            return res.status(404).json({ Status: 0, message: "Task Board not found" });
        }
        res.status(200).json({ Status: 1, data: taskBoard });
    } catch (error) {
        res.status(500).json({ Status: 0, message: "Internal Server Error", error: error.message });
    }
});

router.put('/taskboards/update/:id', async (req, res) => {
    try {
        const taskBoardId = req.params.id;
        const updatedTaskBoard = await TaskBoard.findByIdAndUpdate(taskBoardId, req.body, { new: true });
        if (!updatedTaskBoard) {
            return res.status(404).json({ Status: 0, message: "Task Board not found" });
        }
        res.status(200).json({ Status: 1, message: "Task Board updated successfully", data: updatedTaskBoard });
    } catch (error) {
        res.status(500).json({ Status: 0, message: "Internal Server Error", error: error.message });
    }
});

router.delete('/taskboards/delete/:id', async (req, res) => {
    try {
        const taskBoardId = req.params.id;

        const deletedTaskBoard = await TaskBoard.findByIdAndDelete(taskBoardId);
        if (!deletedTaskBoard) {
            return res.status(404).json({ Status: 0, message: "Task Board not found" });
        }

        const deletedTasks = await task.deleteMany({ boardId: taskBoardId });

        res.status(200).json({ Status: 1, message: "Task Board and associated tasks deleted successfully" });
    } catch (error) {
        res.status(500).json({ Status: 0, message: "Internal Server Error", error: error.message });
    }
});

router.put('/taskDragDrop', async (req, res) => {
    try {
        const data = req.body;

        const updatedTask = await task.findByIdAndUpdate(data.taskId, { boardId: data.currentBoardId }, { new: true });

        const previousTaskBoard = await TaskBoard.findById(data.previousBoardId);
        if (previousTaskBoard) {
            previousTaskBoard.taskIds = previousTaskBoard.taskIds.filter(id => id.toString() !== data.taskId);
            await previousTaskBoard.save();
        }

        const currentBoard = await TaskBoard.findById(data.currentBoardId);
        if (currentBoard) {
            currentBoard.taskIds.push(data.taskId);
            await currentBoard.save();
        }

        res.status(200).json({ Status: 1, message: "Task board and tasks updated successfully" });
    } catch (error) {
        res.status(500).json({ Status: 0, message: "Internal Server Error", error: error.message });
    }
});


module.exports = router;
