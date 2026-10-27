# 🔑 limbo.keys

> **You have one job. Pick the right key.**

A tiny browser-based minigame inspired by **Limbo** by Mindcap from Geometry Dash.

It looks simple.

It isn't.

## 🎮 What is this?

`limbo.keys` is a **redirect minigame**, which is a sentence nobody asked for and yet here we are.

You give it a destination URL. Whoever opens your link has to survive a sequence of moving and rotating keys before choosing the correct one.

If they pick correctly...

**they get sent to the destination.**

If they don't...

> WRONG.

(Then they get to try again. We're evil, not cruel.)

**Try it:** [https://limbo.gt.tc](https://limbo.gt.tc)

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

---

## ⚠️ Read this first (yes, actually)

The jokes stop for about four bullet points. Please read them.

* **Photosensitivity warning.** The challenge uses flashing, blinking, rotating, color-changing visuals plus audio. It may not be suitable for people with photosensitive epilepsy or motion sensitivity. This is the one part that is not a bit.
* **Only open links from people you trust.** Anyone can make a link to any HTTPS site, and a Limbo link tells you nothing about where it goes until you win. Winning a minigame is not a security audit.
* **Reporting abuse.** If a link leads somewhere malicious, send it to **[limbo.gt.tc@syamsbhima.com](mailto:limbo.gt.tc@syamsbhima.com)**. Reported links get deleted.
* **Do not use this for sensitive stuff.** No passwords, private documents, authentication links, or payment links. If losing the link would ruin your week, don't put it behind a key game.

Okay. Jokes resume.

---

## 🕹️ Make your own terrible link

1. Go to [limbo.gt.tc](https://limbo.gt.tc).
2. Paste an **HTTPS** destination (up to 2048 characters). HTTP and other protocols get rejected by both the form and the server, so don't bother trying. Query strings and fragments are fine, so Google Docs, YouTube, and GitHub links all work. Links with a username or password in them, or links pointing back at limbo.gt.tc, get rejected too. Nice try.
3. Pick your poison:
   * **Click on flash:** click anywhere when the correct key flashes.
   * **Select the correct key:** click the key you tracked.
4. Choose a detail mode:
   * **High Detail:** illustrated animated background and image keys.
   * **Low Detail:** plain black background and simple keys for lower-end devices.
5. Optional extras:
   * **Hint:** shows the instruction for the selected key mode.
   * **Custom name:** letters, numbers, and hyphens, up to 36 characters. Uppercase and lowercase are preserved, and names that differ only by case are distinct. Leave it blank and you get a random eight-character name using uppercase and lowercase letters and numbers.
   * **Title** (up to 80 characters) and **button text** (up to 40, default `GO TO SITE`) customize the challenge screen. Plain text only. Emojis and special characters are not supported, and no, the key emoji doesn't count as an exception.
6. Copy your link:

```text
https://limbo.gt.tc/my-custom-link
```

Send it to a friend. Watch the friendship carefully.

## 🏆 The challenge

1. Click **GO TO SITE**
2. Watch the keys.
3. Try to keep track of the correct one.
4. Wait for the final selection.
5. In **Click on flash** mode, click anywhere when the correct key flashes. In **Select the correct key** mode, click the key.
6. Hope you remembered correctly.

The game gets increasingly chaotic with:

* 🔴 changing key colors
* 🔄 rotations
* 🌀 moving keys
* ⚡ randomized movement patterns
* 🌈 a final color sequence
* 👁️ a blinking selection phase

Right key: a gray landing animation plays and, after a successful landing, the page shows the destination for one second before redirecting. Wrong key: the red crash sequence plays once before the challenge restarts.

---

## 🙃 Limitations (a.k.a. the fine print we're pretending is fun)

* A link name is an identifier, not encryption or access control. Anyone with the link can use it. Treat it like a bearer link, not a secret.
* The destination lives in the site's MySQL database.
* Links don't expire on their own (`expires_at` is optional and the generator leaves it `NULL`). They're immortal, like bad ideas.
* If the website, PHP endpoints, database, or hosting account goes down, so do your links.
* Some sites may block redirects or refuse to load after you win. Victory is not guaranteed to be rewarding.
* The challenge needs JavaScript. Audio may stay muted until the page gets a click.
* Closing the page loses your run. There is no save file.
* No destination previews, user accounts, link management, rate limiting, or deletion interface. This is a toy, not a platform.
* The site owner is responsible for the destinations stored and shared through the service, which is a sentence that keeps me humble.

---

## 🛠️ Hosting it yourself

Runs on InfinityFree (PHP, MySQL, Apache). Other hosts with the same stack should work, and you are welcome to inflict this on your own domain.

### 📁 Project structure

```text
limbo.keys/
├── index.html              # The game interface
├── how-to-create.html      # Link creation instructions and mode descriptions
├── 404.html                # Fallback for hosts that use a custom 404 page
├── style.css               # Styling + animations
├── script.js               # Game logic + redirect system
├── db.php                  # Server-only MySQL connection configuration
├── create-link.php         # Creates short-name-to-destination records
├── resolve-link.php        # Resolves links after they are opened
├── .htaccess               # Rewrites short paths to the app (upload with the leading dot)
├── database-migration.sql  # Adds optional link settings and challenge modes
├── favicon.png             # Site icon
├── key.png                 # Exact favicon duplicate used as the challenge key
├── limbo.mp3               # Audio
└── LICENSE                 # MIT
```

### 🗄️ Database

The repo only ships a migration (`database-migration.sql`), not the original table. The columns below are the ones the PHP code reads and writes. The base columns (`id`, `destination`, `expires_at`) are required by `create-link.php` and `resolve-link.php`; their exact types are inferred, so compare with your live table before trusting me.

```sql
CREATE TABLE short_links (
  id          VARCHAR(36)  CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL PRIMARY KEY,  -- case-sensitive link name; duplicate = error 1062 -> HTTP 409
  destination TEXT         NOT NULL,              -- HTTPS URL, max 2048 chars enforced by create-link.php
  expires_at  DATETIME     NULL,                  -- optional; the generator leaves it NULL
  button_text VARCHAR(40)  NULL,
  page_title  VARCHAR(80)  NULL,
  show_hint   TINYINT(1)   NOT NULL DEFAULT 0,
  key_mode    VARCHAR(16)  NOT NULL DEFAULT 'classic',  -- 'classic' or 'key-select'
  detail_mode VARCHAR(16)  NOT NULL DEFAULT 'high-detail' -- 'high-detail' or 'low-detail'
) CHARACTER SET utf8mb4;
```

Already have the base table (`id`, `destination`, `expires_at`)? Apply `database-migration.sql`. It adds the optional link settings and challenge modes and makes link IDs case-sensitive so uppercase names work and names differing only by case can coexist. If you already applied the previous migration, do not run it again; add the new detail setting and ensure IDs are case-sensitive:

```sql
ALTER TABLE short_links
    ADD COLUMN detail_mode VARCHAR(16) NOT NULL DEFAULT 'high-detail';

ALTER TABLE short_links
    MODIFY id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL;
```

If you only need Key select mode:

```sql
ALTER TABLE short_links ADD COLUMN key_mode VARCHAR(16) NOT NULL DEFAULT 'classic';
```

### 🧹 Moderation

There is no admin panel. The admin panel is phpMyAdmin and a steady hand. To remove a reported link:

```sql
DELETE FROM short_links WHERE id = 'the-link-name';
```

The link stops resolving immediately. This works for every link, because the challenge page only ever redirects to destinations stored in the database.

### 🛣️ Routing

`.htaccess` rewrites short paths like `/my-custom-link` to `index.html?link=my-custom-link`, and the browser keeps the pretty short path. This needs Apache `mod_rewrite`.

If a short path gives you a 404, check that `.htaccess` uploaded correctly (dotfiles love to go missing) and that rewrites are enabled for your domain. The query format `/?link=my-custom-link` works as a fallback, and older `/?link=UUID` links still work.

### 🔐 Credentials

`db.php` must never contain real credentials in a public repository. Keep the server copy configured and any public copy redacted. If your password is in a public commit, it is no longer your password.

---

## 🧠 The interesting part

The correct key is tracked even while the keys are moving.

The browser generates an eight-character short name (or uses your custom one) and sends it with the HTTPS destination to `create-link.php`, which stores it with the optional title, button text, key mode, detail mode, and hint. When a link is opened, `script.js` calls `resolve-link.php` to fetch the destination and display settings. The destination never appears in the browser URL. After you win, the browser redirects.

As for the shell game: the game randomly chooses a starting key and follows it through every shuffle to its new slot. Movement animations are committed to the keys' positions so the visuals stay in sync with the answer. Before the final selection, the keys are reordered to preserve their shuffled positions, and the selected slot is checked against the tracked key's final position.

Eventually, the player gets a final selection screen.

Click the right one:

```text
CORRECT
```

After the gray landing, the destination is shown for one second before the browser redirects.

Click the wrong one:

```text
WRONG
```

The red crash sequence plays once before the challenge restarts.

and you're sent back to try again.

---

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

The interface offers high-detail illustrated keys and a low-detail simple-key mode on black. The JavaScript handles the game sequence, animations, randomization, audio, key selection, and the final redirect.

---

## 📜 License

Released under the [MIT License](LICENSE). The original Limbo Keys code by finnchillah is also MIT-licensed, and its copyright notice is kept in the `LICENSE` file, as the license requires and as good manners suggest.

## 🙏 Credits

The original implementation was **not written from scratch by me**.

This project is based on the work by **finnchillah**:

👉 [Original CodePen: Limbo Keys](https://codepen.io/finnchillah/full/mdoGxXd)

I adapted the original, added redirect functionality, then bolted on database-backed PHP/MySQL links for the InfinityFree deployment. Huge credit to the original creator for the core idea and implementation. I just made it ask for a destination.

The project is also inspired by:

**Geometry Dash: Limbo**
by **Mindcap**

---

## 🔑

That's pretty much it.

It's a link.

It's a game.

It's a terrible idea.

**Have fun.**
