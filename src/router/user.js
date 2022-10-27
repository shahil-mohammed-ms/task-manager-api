const express = require('express')
const User = require('../models/user')
const { sendCreationMail, sendCancelMail } = require('../emails/account')
const multer = require('multer')
const sharp = require('sharp')
const auth = require('../middleware/Auth')
const router = new express.Router()

//POST / creating user profile
router.post('/users', async (req, res) => {
   const user = new User(req.body)
   try {
      const token = await user.generateAuthToken()

      await user.save()
      sendCreationMail(user.email, user.name)
      return res.send({ user, token })
   } catch (e) {
      console.log(e, 'errorrrrr')
      return res.send(e)
   }
})
//POST / LOGIN user profile
router.post('/users/login', async (req, res) => {
   try {
      const user = await User.findByCredentials(req.body.email, req.body.password)
      const token = await user.generateAuthToken()

      return res.send({ user, token })
   } catch (e) {
      res.status(400).send(e)

   }
})
//POST /LOGOUT user profile
router.post('/users/logout', auth, async (req, res) => {
   try {
      req.user.tokens = req.user.tokens.filter((token) => {
         return token.token !== req.token
      })
      await req.user.save()
      res.send()
   } catch (e) {
      res.status(500).send()
   }
})
//POST /LOGOUT ALL 
router.post('/users/logoutAll', auth, async (req, res) => {
   try {
      req.user.tokens = []
      await req.user.save()
      res.send()

   }
   catch (e) {
      res.status(500).send()
   }
})
//GET /get profile
router.get('/users/me', auth, async (req, res) => {

   console.log('ussrrr', req.user)
   res.send(req.user)
})
//PATCH / update profile
router.patch('/users/me', auth, async (req, res) => {
   const updates = Object.keys(req.body)
   const allowedUpdates = ['name', 'email', 'password', 'age']
   const isValid = updates.every((update) => allowedUpdates.includes(update))
   if (!isValid) {
      return res.status(400).send({ error: 'Invalid updates!' })
   }
   try {
      const user = await User.findById(req.user.id)

      updates.forEach((update) => user[update] = req.body[update])
      await user.save()

      res.send(user)
   } catch (e) {
      res.status(404).send(e)
   }
})

router.delete('/users/me', auth, async (req, res) => {
   try {

      await req.user.remove()
      sendCancelMail(req.user.email, req.user.name)
      res.send(req.user)
   } catch (e) {
      res.status(500).send()
   }
})
//destination directory
const upload = multer({
   limits: {
      fileSize: 1000000
   },
   fileFilter(req, file, cb) {
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
         return cb(new Error('please upload jpg,jpeg,png files'))
      }
      cb(undefined, true)
   }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
   const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
   req.user.avatar = buffer
   await req.user.save()
   res.send()
}, (error, req, res, next) => {
   res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
   req.user.avatar = undefined
   await req.user.save()
   res.send()
})

router.get('/users/:id/avatar', auth, async (req, res) => {
   try {
      const user = await User.findById(req.params.id)
      console.log('hii', user)
      if (!user || !user.avatar) {
         throw new Error()
      }
      res.set('Content-Type', 'image/png')
      res.send(user.avatar)
   } catch (e) {
      res.status(404).send()
   }
})

module.exports = router