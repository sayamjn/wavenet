const Note = require('../models/Note');
const User = require('../models/User');
const { getIO } = require('../utils/socket');

/**
 * @desc    Get all notes for the current user (owned and shared)
 * @route   GET /api/notes
 * @access  Private
 */
exports.getNotes = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = req.query.filter || 'all'; // 'all', 'owned', 'shared'
    const isArchived = req.query.archived === 'true';
    
    let query = { isArchived };
    
    // Filter by ownership or collaboration
    if (filter === 'owned') {
      query.createdBy = req.user._id;
    } else if (filter === 'shared') {
      query.collaborators = { $elemMatch: { userId: req.user._id } };
    } else {
      // 'all' - get both owned and shared notes
      query.$or = [
        { createdBy: req.user._id },
        { collaborators: { $elemMatch: { userId: req.user._id } } }
      ];
    }

    // Count total documents
    const total = await Note.countDocuments(query);

    // Get notes with pagination, sorted by lastUpdated
    const notes = await Note.find(query)
      .sort({ lastUpdated: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email')
      .populate('collaborators.userId', 'name email');

    res.status(200).json({
      success: true,
      count: notes.length,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalResults: total
      },
      data: notes
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single note by ID
 * @route   GET /api/notes/:id
 * @access  Private
 */
exports.getNoteById = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('collaborators.userId', 'name email');

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Check if user has access to this note
    const isOwner = note.createdBy._id.toString() === req.user._id.toString();
    const isCollaborator = note.collaborators.some(
      collab => collab.userId._id.toString() === req.user._id.toString()
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this note'
      });
    }

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new note
 * @route   POST /api/notes
 * @access  Private
 */
exports.createNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    const note = await Note.create({
      title,
      content,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: note
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a note
 * @route   PUT /api/notes/:id
 * @access  Private
 */
exports.updateNote = async (req, res, next) => {
  try {
    let note = await Note.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('collaborators.userId', 'name email');

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Check if user has permission to update
    const isOwner = note.createdBy._id.toString() === req.user._id.toString();
    const collaborator = note.collaborators.find(
      collab => collab.userId._id.toString() === req.user._id.toString()
    );

    if (!isOwner && (!collaborator || collaborator.permission !== 'write')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this note'
      });
    }

    // Update note
    note = await Note.findByIdAndUpdate(
      req.params.id,
      { 
        title: req.body.title,
        content: req.body.content,
        lastUpdated: Date.now() 
      },
      { 
        new: true,  // Return updated document
        runValidators: true
      }
    )
      .populate('createdBy', 'name email')
      .populate('collaborators.userId', 'name email');

    // Emit socket event for real-time updates
    const io = getIO();
    
    // Notify all collaborators of the update
    const collaboratorIds = note.collaborators.map(
      collab => collab.userId._id.toString()
    );
    
    io.to(collaboratorIds).emit('note-updated', {
      note,
      updatedBy: {
        _id: req.user._id,
        name: req.user.name
      }
    });

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a note
 * @route   DELETE /api/notes/:id
 * @access  Private
 */
exports.deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Check if user is the owner
    if (note.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this note'
      });
    }

    await note.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Share a note with other users
 * @route   POST /api/notes/:id/share
 * @access  Private
 */
exports.shareNote = async (req, res, next) => {
  try {
    const { email, permission } = req.body;

    if (!email || !['read', 'write'].includes(permission)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid email and permission (read/write)'
      });
    }

    // Find the note
    let note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Check if user is the owner
    if (note.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the owner can share this note'
      });
    }

    // Find the user to share with
    const userToShare = await User.findOne({ email });
    if (!userToShare) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't share with self
    if (userToShare._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot share with yourself'
      });
    }

    // Check if already shared
    const alreadyShared = note.collaborators.find(
      collab => collab.userId.toString() === userToShare._id.toString()
    );

    if (alreadyShared) {
      // Update existing permission
      note = await Note.findOneAndUpdate(
        { 
          _id: req.params.id,
          'collaborators.userId': userToShare._id 
        },
        { 
          $set: { 'collaborators.$.permission': permission } 
        },
        { new: true }
      );
    } else {
      // Add new collaborator
      note = await Note.findByIdAndUpdate(
        req.params.id,
        {
          $push: {
            collaborators: {
              userId: userToShare._id,
              permission
            }
          }
        },
        { new: true }
      );
    }

    // Populate the updated note
    note = await Note.findById(note._id)
      .populate('createdBy', 'name email')
      .populate('collaborators.userId', 'name email');

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove a user's access to a note
 * @route   DELETE /api/notes/:id/share/:userId
 * @access  Private
 */
exports.removeAccess = async (req, res, next) => {
  try {
    let note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Check if user is the owner
    if (note.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the owner can modify sharing permissions'
      });
    }

    // Remove collaborator
    note = await Note.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          collaborators: { userId: req.params.userId }
        }
      },
      { new: true }
    )
      .populate('createdBy', 'name email')
      .populate('collaborators.userId', 'name email');

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (error) {
    next(error);
  }
};