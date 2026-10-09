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

The generator creates an eight-character short name (or uses a custom name)
and sends it with the HTTPS destination to `create-link.php`. Optional button
text, title, and a checkbox for the fixed challenge hint are stored alongside
it in MySQL. A link looks like:

```text
https://limbo.gt.tc/ia9ur38r
```

When the link is opened, `script.js` calls `resolve-link.php` to retrieve the
destination and optional display settings. The destination is not placed in
the browser URL. After the challenge is completed, the browser redirects to
the stored destination. Existing query links such as `/?link=UUID` continue
to work.

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

## 🔗 Hosting on InfinityFree

This project is hosted on InfinityFree and uses PHP, MySQL, and Apache
`.htaccess` rules. Short links such as `/my-custom-link` are routed by
`.htaccess` to `index.html?link=my-custom-link`; the browser keeps the short
path visible. If short paths are unavailable on a particular host
configuration, use the query-link format `/?link=my-custom-link`.

### Deploying to InfinityFree

1. Upload the site files into the domain's `htdocs` directory, keeping
   `.htaccess` alongside `index.html`. Make sure the FTP client shows hidden
   files so `.htaccess` is uploaded.
2. Create a MySQL database in the InfinityFree control panel. Import
   `database-migration.sql` once using phpMyAdmin for the existing
   `short_links` table.
3. Set the database host, name, username, and password supplied by
   InfinityFree in the server copy of `db.php`. The values in this project's
   redacted `db.php` are placeholders, not working credentials.
4. Open the domain over HTTPS and create a test link. Confirm both the
   short-path URL and its challenge resolve before sharing it.

The `.htaccess` rules rely on Apache `mod_rewrite`. If a short path returns an
InfinityFree 404, check that `.htaccess` uploaded correctly and that rewrites
are enabled for the domain. The query-link format can be used as a fallback.

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

Enter an HTTPS destination in the generator. Leave the custom name blank for
an automatically generated short link, or enter a name containing letters,
numbers, and hyphens (up to 36 characters). Names are normalized to lowercase
and must be unique. The optional title and button text customize the challenge.
The checkbox enables the fixed “click anywhere when the correct key flashes”
hint; leave it unchecked to retain the classic appearance. The
generator creates a database-backed path link like:

```text
https://limbo.gt.tc/my-custom-link
```

Google Docs, YouTube, GitHub, and other HTTPS URLs with query strings or
fragments are supported. The generator rejects HTTP and other protocols.

Before deploying the updated PHP endpoints, run
[`database-migration.sql`](./database-migration.sql) once against the existing
MySQL database to add the optional display columns. The included `.htaccess`
rewrites short paths to the app while leaving existing files and directories
untouched.

## ⚠️ Important limitations and warnings

* A short or custom name is an identifier, not encryption or access control.
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

I adapted the original project, added redirect functionality, then added
database-backed PHP/MySQL links for the InfinityFree deployment.

Huge credit to the original creator for the core idea and implementation.

The project is also inspired by:

**Geometry Dash — Limbo**
by **Mindcap**

---

## 📁 Project structure

```text
limbo.keys/
├── index.html      # The game interface
├── 404.html        # Fallback for hosts that use a custom 404 page
├── style.css       # Styling + animations
├── script.js       # Game logic + redirect system
├── db.php          # Server-only MySQL connection configuration
├── create-link.php # Creates short-name-to-destination records
├── resolve-link.php # Resolves links after they are opened
├── .htaccess       # Rewrites short paths to the app
├── database-migration.sql # Adds optional link display settings
└── limbo.mp3       # Audio
```

`db.php` must never contain real credentials in a public repository. Keep the
server copy on InfinityFree configured with the database credentials, and
keep any public or shared copy redacted.

## 🧠 The interesting part

The correct key is tracked even while the keys are moving.

The game randomly chooses a starting key and tracks that key as each shuffle
moves it to a new slot. Movement animations are committed to the keys' positions
so the visual arrangement stays in sync with the answer. Before the final
selection, the keys return to their numbered positions and the game checks
whether the selected key is the one that was tracked.

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
