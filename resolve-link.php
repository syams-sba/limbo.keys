<?php

require __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

$id = $_GET['id'] ?? '';
if (!is_string($id) || !preg_match(
    '/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i',
    $id
)) {
    http_response_code(400);
    exit(json_encode(['error' => 'Invalid link ID.']));
}

$statement = $pdo->prepare(
    'SELECT destination FROM short_links
     WHERE id = :id AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)'
);
$statement->execute([':id' => strtolower($id)]);
$link = $statement->fetch();

if (!$link) {
    http_response_code(404);
    exit(json_encode(['error' => 'Link not found or expired.']));
}

echo json_encode(['destination' => $link['destination']]);
