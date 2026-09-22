# 🔑 limbo.keys

> **You have one job. Pick the right key.**

A tiny browser-based minigame inspired by **Limbo** by Mindcap from Geometry Dash.

It looks simple.

It isn't.

## 🎮 What is this?

`limbo.keys` is basically a **redirect minigame**.

You give it a destination URL, and the player has to survive a sequence of moving, rotating, glowing keys before choosing the correct one.

If they pick correctly...

**they get sent to the destination.**

If they don't...

> WRONG.

### How it works

The generator creates a version 4 UUID with `crypto.randomUUID()`, then sends
that UUID and the HTTPS destination to `create-link.php`. The PHP endpoint
stores the mapping in MySQL and returns a link such as:

```text
https://limbo.gt.tc/?link=8199829c-4905-4bbc-9adc-426971acbd76
```

When the link is opened, `script.js` calls `resolve-link.php` to retrieve the
destination. The destination is not placed in the browser URL. After the
challenge is completed, the browser redirects to the stored destination.

The query-string format is intentional. InfinityFree serves its own 404 page
for unknown path URLs such as `/UUID`, so a query link is used instead of
`https://limbo.gt.tc/UUID`.

So you can think of it as:

```text
[ destination URL ]
        ↓
   🔑 LIMBO KEYS
        ↓
   🎯 correct key?
      ↙     ↘
   WRONG    CORRECT
              ↓
        destination
```

## 🕹️ The challenge

1. Click **GO TO SITE**
2. Watch the keys.
3. Try to keep track of the correct one.
4. Wait for the final selection.
5. Click a key.
6. Hope you remembered correctly.

The game gets increasingly chaotic with:

* 🔴 changing key colors
* 🔄 rotations
* 🌀 moving keys
* ⚡ randomized movement patterns
* 🌈 a final color sequence
* 👁️ a blinking selection phase

The movement patterns and correct-key tracking are handled in JavaScript.

## 🛠️ The 404 Problem

There was one problem with the redirect idea:

GitHub Pages would see a URL like

```text
/limbo.keys/https://example.com
```

as a page that doesn't exist.

So GitHub Pages would return its **404 page before `script.js` ever got a chance to run**.

That kinda defeats the entire point.

### The fix

I initially added a custom **`404.html` fallback**.

Instead of letting GitHub Pages stop at its default 404 page, the fallback allows the `limbo.keys` app to load and lets the JavaScript read the destination from the URL.

That fallback remains useful for legacy path-based links, but the current
InfinityFree deployment uses query links because the host can intercept
unknown paths before `404.html` runs.

```text
GitHub Pages
     ↓
    404?
     ↓
 custom 404.html
     ↓
 limbo.keys
     ↓
   🎮 GAME
     ↓
 CORRECT KEY
     ↓
 destination URL
```

So the 404 page isn't really an error here.

**It's part of the game.**

## ✨ Why I made this

This is mostly a **fun experiment / web toy**, inspired by the memory-based gameplay of **Limbo** in Geometry Dash.

I wanted to turn that idea into something that could actually be used as a weird little web redirect.

Because why should a normal link just...

> **link?**

When it could make you suffer first?

## 🧩 Tech

Nothing fancy:

* HTML
* CSS
* JavaScript
* PHP and MySQL on InfinityFree
* A tiny bit of insanity

The interface uses eight SVG key icons, with a black background and glowing color effects.
The JavaScript handles the game sequence, animations, randomization, audio, key selection, and final redirect.

## 🚀 Try it

```text
https://limbo.gt.tc
```

Replace `https://example.com` with whatever destination you want.

Enter an HTTPS destination in the generator. It creates a database-backed
link like:

```text
https://limbo.gt.tc/?link=UUID
```

Google Docs, YouTube, GitHub, and other HTTPS URLs with query strings or
fragments are supported. The generator rejects HTTP and other protocols.

## ⚠️ Important limitations and warnings

* A UUID is an opaque identifier, not encryption or access control.
* Anyone who obtains a generated link can use it. Treat links as bearer links.
* The destination is stored in the site's MySQL database.
* Links currently do not expire automatically because `expires_at` is optional
  and generated records leave it `NULL`.
* Links stop working if the website, PHP endpoints, database, or hosting
  account is unavailable.
* Only HTTPS destinations are accepted; some sites may block redirects or
  refuse to load after a challenge.
* The challenge requires JavaScript. Audio may be blocked until the user
  interacts with the page.
* A wrong key restarts the challenge. Closing the page loses the current run.
* Do not use this for passwords, private documents, authentication links,
  payment links, or other sensitive destinations.
* The service does not currently provide destination previews, user accounts,
  link management, rate limiting, or a deletion interface.
* The site owner is responsible for the destinations stored and shared
  through the service.

If someone sends you a Limbo link, verify that you trust the sender before
opening it.

---

## 📜 Credits

The original implementation was **not written from scratch by me**.

This project is based on the work by **finnchillah**:

👉 [Original CodePen — Limbo Keys](https://codepen.io/finnchillah/full/mdoGxXd)

I adapted the original project, added the original URL-based redirect
functionality and 404 fallback, then replaced it with UUID-backed PHP/MySQL
links for the InfinityFree deployment.

Huge credit to the original creator for the core idea and implementation.

The project is also inspired by:

**Geometry Dash — Limbo**
by **Mindcap**

---

## 📁 Project structure

```text
limbo.keys/
├── index.html      # The game interface
├── 404.html        # GitHub Pages fallback
├── style.css       # Styling + animations
├── script.js       # Game logic + redirect system
├── db.php          # Server-only MySQL connection configuration
├── create-link.php # Creates UUID-to-destination records
├── resolve-link.php # Resolves UUIDs after the link is opened
└── limbo.mp3       # Audio
```

`db.php` must never contain real credentials in a public repository. Keep the
server copy on InfinityFree configured with the database password, and keep
the local or public copy redacted.

## 🧠 The interesting part

The correct key is tracked even while the keys are moving.

The game randomly chooses a starting key, then updates its position whenever a movement pattern is applied.

Eventually, the player gets a final selection screen.

Click the right one:

```text
CORRECT
```

and the browser redirects.

Click the wrong one:

```text
WRONG
```

and you're sent back to try again.

## 🔑

That's pretty much it.

It's a link.

It's a game.

It's a terrible idea.

**Have fun.**
