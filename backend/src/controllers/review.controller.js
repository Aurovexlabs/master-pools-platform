import { Review } from '../models/Review.model.js'
import { isNonEmptyString, pick } from '../utils/safe.js'

export const createReview = async (req, res) => {
  const payload = pick(req.body, ['rating', 'title', 'content', 'project'])

  if (!isNonEmptyString(payload.title) || !isNonEmptyString(payload.content)) {
    return res.status(400).json({ message: 'Title and review text are required' })
  }

  const rating = Number(payload.rating)
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' })
  }

  const project = isNonEmptyString(payload.project) ? payload.project : undefined

  const existing = await Review.findOne({ user: req.user._id, project })
  if (existing) return res.status(409).json({ message: 'You already reviewed this project' })

  // Publication is an administrative decision: approval and visibility are set
  // here, never taken from the request body.
  const review = await Review.create({
    rating,
    title: payload.title.trim().slice(0, 120),
    content: payload.content.trim().slice(0, 4000),
    project,
    user: req.user._id,
    isApproved: false,
    isPublished: false,
  })
  res.status(201).json({ review })
}

export const getPublicReviews = async (req, res) => {
  const { project, page = 1, limit = 10 } = req.query
  const filter = { isApproved: true, isPublished: true }
  if (project) filter.project = project
  const total = await Review.countDocuments(filter)
  const reviews = await Review.find(filter)
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate('user', 'name avatar')
    .populate('project', 'title slug')
  res.json({ reviews, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } })
}

export const adminGetReviews = async (req, res) => {
  const reviews = await Review.find()
    .sort('-createdAt')
    .populate('user', 'name email')
    .populate('project', 'title')
  res.json({ reviews })
}

export const adminToggleReview = async (req, res) => {
  const review = await Review.findById(req.params.id)
  if (!review) return res.status(404).json({ message: 'Review not found' })
  review.isApproved = !review.isApproved
  review.isPublished = review.isApproved
  await review.save()
  res.json({ review })
}
