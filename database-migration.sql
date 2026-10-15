ALTER TABLE short_links
    ADD COLUMN button_text VARCHAR(40) NULL,
    ADD COLUMN page_title VARCHAR(80) NULL,
    ADD COLUMN show_hint TINYINT(1) NOT NULL DEFAULT 0,
    ADD COLUMN key_mode VARCHAR(16) NOT NULL DEFAULT 'classic';
