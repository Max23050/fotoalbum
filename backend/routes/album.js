import express from "express";
import Album from "../models/Album.js";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/User.js";

import Photo from "../models/Photo.js";
import fs from "fs";
import path from "path";

const router = express.Router();

// GET /api/albums  returns a list of albums
router.get("/", authMiddleware, async (req, res) => {
  try {
    const albums = await Album.find({ owner: req.userId });
    res.json(albums);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/albums creates a new album
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, parent } = req.body;
    const album = new Album({
      name,
      parent: parent || null,
      owner: req.userId,
    });
    await album.save();
    res.status(201).json(album);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//returns the entire tree structure of albums
router.get("/tree", authMiddleware, async (req, res) => {                                   
  try {
    const albums = await Album.find({
      $or: [
        { owner: req.userId },
        { sharedWith: req.userId }
      ]
    }).populate("owner", "email username").lean();

    const albumMap = {};
    albums.forEach((album) => {
      album.children = [];

      const isOwner = String(album.owner._id) === String(req.userId);
      album.ownership = isOwner ? "owner" : "shared";

      if (!isOwner) {
        album.sharedByName = album.owner.username || album.owner.email;
      }

      albumMap[album._id] = album;
    });

    const tree = [];
    albums.forEach((album) => {
      if (album.parent) {
        const parent = albumMap[album.parent];
        if (parent) {
          parent.children.push(album);
        }
      } else {
        tree.push(album);
      }
    });

    res.json(tree);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// shares an album with another user
router.put("/:id/share", authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;

    const userToShare = await User.findOne({ email });

    if (!userToShare) return res.status(404).json({ message: "User not found" });

    const album = await Album.findOne({ _id: req.params.id, owner: req.userId });
    if (!album) return res.status(404).json({ message: "Album not found or not yours" });

    if (!album.sharedWith.includes(userToShare._id)) {
      album.sharedWith.push(userToShare._id);
      await album.save();
    }

    res.json({ message: "Album shared successfully" });
  } catch (err) {
    console.error("Error sharing:", err);
    res.status(500).json({ error: err.message });
  }
});

// renames an album
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { newName } = req.body;

    const album = await Album.findOne({
      _id: req.params.id,
      owner: req.userId,
    });

    if (!album) return res.status(404).json({ message: "Album not found" });

    album.name = newName;
    await album.save();

    res.json({ message: "Album renamed", album });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/public", authMiddleware, async (req, res) => {
  try {
    const album = await Album.findOne({ _id: req.params.id, owner: req.userId });

    if (!album) return res.status(404).json({ message: "Album not found or not yours" });

    album.isPublic = !album.isPublic;
    await album.save();

    res.json({ message: "Album public status updated", isPublic: album.isPublic });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// returns subalbums
router.get("/children/:parentId", authMiddleware, async (req, res) => {
  try {
    const parentId = req.params.parentId;
    const userId = req.userId;

    const albums = await Album.find({
      parent: parentId,
      $or: [
        { owner: userId },
        { sharedWith: userId }
      ]
    }).lean();

    res.json(albums);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const deleteAlbumAndContents = async (albumId, userId) => {
  const photos = await Photo.find({ album: albumId, owner: userId });
  for (const photo of photos) {
    const filePath = path.join("uploads", photo.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await photo.deleteOne();
  }

  const subalbums = await Album.find({ parent: albumId, owner: userId });

  for (const sub of subalbums) {
    await deleteAlbumAndContents(sub._id, userId);
  }

  await Album.deleteOne({ _id: albumId });
};

// DELETE /api/albums/:id deletes an album
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const album = await Album.findOne({
      _id: req.params.id,
      owner: req.userId,
    });

    if (!album) return res.status(404).json({ message: "Album not found" });

    await deleteAlbumAndContents(album._id, req.userId);

    res.json({ message: "Album and its contents deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
