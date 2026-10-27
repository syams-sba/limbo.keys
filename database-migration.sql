ALTER TABLE short_links
    ADD COLUMN button_text VARCHAR(40) NULL,
    ADD COLUMN page_title VARCHAR(80) NULL,
    ADD COLUMN show_hint TINYINT(1) NOT NULL DEFAULT 0,
    ADD COLUMN key_mode VARCHAR(16) NOT NULL DEFAULT 'classic',
    ADD COLUMN detail_mode VARCHAR(16) NOT NULL DEFAULT 'high-detail';

ALTER TABLE short_links
    MODIFY id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL;
