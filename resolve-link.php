<?php

require __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

$id = $_GET['id'] ?? '';
if (!is_string($id) || !preg_match('/^[a-z0-9-]{1,36}$/i', $id)) {
    http_response_code(400);
    exit(json_encode(['error' => 'Invalid link ID.']));
}

$statement = $pdo->prepare(
    'SELECT destination, button_text, page_title, show_hint, key_mode, detail_mode FROM short_links
     WHERE id = :id AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)'
);
$statement->execute([':id' => $id]);
$link = $statement->fetch();

if (!$link) {
    http_response_code(404);
    exit(json_encode(['error' => 'Link not found or expired.']));
}

echo json_encode([
    'destination' => $link['destination'],
    'buttonText' => $link['button_text'],
    'pageTitle' => $link['page_title'],
    'showHint' => (bool) $link['show_hint'],
    'keyMode' => $link['key_mode'],
    'detailMode' => $link['detail_mode'],
]);
