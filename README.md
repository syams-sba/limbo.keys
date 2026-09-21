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

The URL itself contains the destination:

```text
https://syams-sba.github.io/limbo.keys/https://example.com
```

Play the challenge → choose the correct key → get redirected to:

```text
https://example.com
```

For URLs containing a query string, use the URL exactly as shown:

```text
https://syams-sba.github.io/limbo.keys/https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

The custom `404.html` must be present in the branch and folder published by
GitHub Pages. It converts the extra path into a hash parameter before loading
the game, so destinations containing `?` continue to work.

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

I added a custom **`404.html` fallback**.

Instead of letting GitHub Pages stop at its default 404 page, the fallback allows the `limbo.keys` app to load and lets the JavaScript read the destination from the URL.

The result:

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
* GitHub Pages
* A tiny bit of insanity

The interface uses eight SVG key icons, with a black background and glowing color effects.
The JavaScript handles the game sequence, animations, randomization, audio, key selection, and final redirect.

## 🚀 Try it

```text
https://syams-sba.github.io/limbo.keys/https://example.com
```

Replace `https://example.com` with whatever destination you want.

For example:

```text
https://syams-sba.github.io/limbo.keys/https://github.com
```

The destination is extracted from everything after `/limbo.keys/`, and the code only accepts targets beginning with `http://` or `https://`.

## ⚠️ A small warning

This is intentionally **not a normal redirect**.

If someone sends you a `limbo.keys` link, you're signing up for the challenge before reaching the actual website.

You have been warned.

---

## 📜 Credits

The original implementation was **not written from scratch by me**.

This project is based on the work by **finnchillah**:

👉 [Original CodePen — Limbo Keys](https://codepen.io/finnchillah/full/mdoGxXd)

I adapted the original project for GitHub Pages and added the URL-based redirect functionality and 404 fallback.

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
└── limbo.mp3       # Audio
```

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
