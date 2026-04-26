import express from "express";
import multer from "multer";
import Photo from "../models/Photo.js";
import authMiddleware from "../middleware/authMiddleware.js";
import Album from "../models/Album.js";
import jwt from "jsonwebtoken";


import fs from "fs";
import path from "path";

const router = express.Router();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images allowed"));
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
});

const upload = multer({ storage, fileFilter });

// POST /api/photos  uploads a new photo
router.post(
  "/",
  authMiddleware,
  (req, res, next) => {
    upload.single("image")(req, res, function (err) {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const { album } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: "File was not loaded" });
      }

      const photo = new Photo({
        album,
        owner: req.userId,
        filename: file.filename,
        originalName: file.originalname,
      });

      await photo.save();
      res.status(201).json(photo);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// GET /api/photos/:albumId  returns all photos from the given album
router.get("/:albumId", async (req, res) => {
  try {
    const albumId = req.params.albumId;
    let album;
    try {
      album = await Album.findById(albumId);
    } catch (error) {
      return res.status(404).json({ message: "Album not found" })
    }
    

    let allow = false;

    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.id === album.owner.toString() || album.sharedWith.includes(decoded.id)) {
        allow = true;
      }
    }

    if (album.isPublic) allow = true;

    if (!allow) return res.status(403).json({ message: "Access denied" });

    const photos = await Photo.find({ album: albumId });
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const result = photos.map((photo) => ({
      _id: photo._id,
      album: photo.album,
      originalName: photo.originalName,
      uploadedAt: photo.uploadedAt,
      url: `${baseUrl}/uploads/${photo.filename}`,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const photo = await Photo.findOne({
      _id: req.params.id,
      owner: req.userId,
    });

    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }

    const filePath = path.join("uploads", photo.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await photo.deleteOne();
    res.json({ message: "Photo deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/photos/:id 
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { newName } = req.body;

    const photo = await Photo.findOne({
      _id: req.params.id,
      owner: req.userId,
    });

    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }

    photo.originalName = newName;
    await photo.save();

    res.json({ message: "Photo renamed", photo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;
