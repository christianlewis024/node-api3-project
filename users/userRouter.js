const express = require("express");

const router = express.Router();

const Users = require("./userDb");
const Posts = require("../posts/postDb");
// create new user, run validateUser and set it up for proper validation. #2
router.post("/", validateUser, (req, res) => {
  Users.insert(req.body).then((newUser) => {
    console.log(newUser);
    res.status(200).json(newUser);
  });
});
// create new post, need to add validatePost as well as validateUserId and set it up below for proper validation check.   step #3
router.post("/:id/posts", validateUserId, validatePost, (req, res) => {
  const { id: user_id } = req.params;
  const { text } = req.body;

  Posts.insert({ user_id, text })
    .then((post) => {
      res.status(200).json(post);
    })
    .catch((error) => {
      res.status(500).json({ error: "500 server error" });
    });
});
// get all users, check userDb and do this part first, #1
router.get("/", (req, res) => {
  Users.get()
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((error) => {
      res.status(500).json({ message: "500 server error" });
    });
});

// get individual user by id
router.get("/:id", (req, res) => {
  Users.getById(req.params.id).then((user) => {
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(400).json({ message: "400" });
    }
  });
});
// get posts by a certain user, use function getUserPosts only needs id
router.get("/:id/posts", (req, res) => {
  const { id } = req.params;
  Users.getUserPosts(id).then((posts) => res.status(200).json(posts));
});
// delete needs validateUserId and requires the id of user to be deleted
router.delete("/:id", validateUserId, (req, res) => {
  const { id } = req.user;
  Users.remove(id).then(() => res.status(200).json({ message: "deleted" }));
});
// put request to update user also needs to go through validateUserId
// define user id and name to be updated
router.put("/:id", (req, res) => {
  // name and id
  const { user_id } = req.body;
  const { name } = req.body;

  // function is called update and needs id and name
  Users.update(user_id, name).then(() =>
    res.status(200).json({ message: "updated" })
  );
});

//custom middleware
// set this up with new Post
function validateUserId(req, res, next) {
  const { id } = req.params;
  Users.getById(id)
    .then((user) => {
      if (user) {
        req.user = user;
        next();
      } else {
        res.status(400).json({ message: "in valid user id" });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: "500 server error " });
    });
}
// validate user needs to be setup with new user post. run this check every time a new user is created. Part of step 2.
function validateUser(req, res, next) {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "400 - missing user data" });
  }
  if (typeof name !== "string") {
    return res.status(400).json({ error: "400 - must be a string" });
  }
  req.body = { name };
  next();
}
// also to be setup with new post
function validatePost(req, res, next) {
  const { text } = req.body;

  if (!req.body) {
    return res.status(400).json({ error: "missing post data" });
  }
  if (!text) {
    return res.status(400).json({ error: "missing required text field" });
  }
  next();
}

module.exports = router;
