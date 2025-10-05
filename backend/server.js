import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 🔹 Test route
app.get("/", (req, res) => {
  res.send("hello");
});

// 🔹 Reddit search
app.post("/reddit", async (req, res) => {
  try {
    const query = req.body.query_search;
    if (!query) return res.status(400).json({ error: "Missing query_search in body" });

    const response = await axios.get(
      `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=10`,
      { headers: { "User-Agent": "multi-api-app/1.0 by Dear-Activity3983" } }
    );

    const posts = response.data.data.children.map((post) => ({
      title: post.data.title,
      subreddit: post.data.subreddit,
      url: "https://reddit.com" + post.data.permalink,
      author: post.data.author,
      upvotes: post.data.ups,
      comments: post.data.num_comments,
    }));

    res.json(posts);
  } catch (err) {
    console.error(err.response?.status, err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// 🔹 GitHub search
app.post("/github", async (req, res) => {
  try {
    const query = req.body.query_search;
    if (!query) return res.status(400).json({ error: "Missing query_search in body" });

    const githubRes = await axios.get(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=5`
    );

    const githubRepos = githubRes.data.items.map((repo) => ({
      name: repo.full_name,
      description: repo.description,
      url: repo.html_url,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language,
    }));

    res.json(githubRepos);
  } catch (err) {
    console.error(err.response?.status, err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// 🔹 Combined Reddit + GitHub
app.post("/github_reddit", async (req, res) => {
  try {
    const query = req.body.query_search;
    if (!query) return res.status(400).json({ error: "Missing query_search in body" });

    // Reddit
    const redditRes = await axios.get(
      `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=10`,
      { headers: { "User-Agent": "multi-api-app/1.0 by Dear-Activity3983" } }
    );
    const redditPosts = redditRes.data.data.children.map((post) => ({
      title: post.data.title,
      subreddit: post.data.subreddit,
      url: "https://reddit.com" + post.data.permalink,
      author: post.data.author,
      upvotes: post.data.ups,
      comments: post.data.num_comments,
    }));

    // GitHub
    const githubRes = await axios.get(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=5`
    );
    const githubRepos = githubRes.data.items.map((repo) => ({
      name: repo.full_name,
      description: repo.description,
      url: repo.html_url,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language,
    }));

    res.json({
      reddit: redditPosts,
      github: githubRepos,
    });
  } catch (err) {
    console.error(err.response?.status, err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});



app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
