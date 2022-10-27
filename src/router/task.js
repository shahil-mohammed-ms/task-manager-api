const express = require('express')
const auth = require('../middleware/Auth')
const Task = require('../models/task')

const router = new express.Router()
 
router.post('/tasks', auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id
  })
  try {
    await task.save()
    return res.send({ task })
  } catch (e) {
  }
  res.send()
})
router.get('/tasks', auth, async (req, res) => {
  const match = {}
  const sort = {}
  if (req.query.Completed) {
    match.Completed = req.query.Completed == 'true'
  }
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':')
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
  }
  try {
    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort
      }
    }).execPopulate()
    console.log(req.user.tasks)
    res.send(req.user.tasks)
  } catch (e) {
    res.status(500).send()
  }
})
router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id
  try {
    const task = await Task.findOne({ _id, owner: req.user._id })
    if (!task) {
      return res.status(404).send()
    }
    res.send(task)
  } catch (e) {
    res.status(500).send()
  }
})
router.patch('/tasks/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['description', 'completed']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' })
  }
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user.id })
    if (!task) {
      return res.status(404).send()
    }
    updates.forEach((update) => task[update] = req.body[update])
    await task.save()
    res.send(task)
  } catch (e) {
    res.status(400).send(e)
  }
})
router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
    if (!task) {
      res.status(404).send()
    }
    res.send(task)
  } catch (e) {
    res.status(500).send()
  }
})


module.exports = router