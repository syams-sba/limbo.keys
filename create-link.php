<?php

require __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    exit(json_encode(['error' => 'Method not allowed.']));
}

$body = json_decode(file_get_contents('php://input'), true);
$id = $body['id'] ?? '';
$destination = $body['destination'] ?? '';

if (!is_string($id) || !preg_match(
    '/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i',
    $id
)) {
    http_response_code(400);
    exit(json_encode(['error' => 'Invalid link ID.']));
}

if (!is_string($destination) || !filter_var($destination, FILTER_VALIDATE_URL)) {
    http_response_code(400);
    exit(json_encode(['error' => 'Invalid destination URL.']));
}

$url = parse_url($destination);
if (strtolower($url['scheme'] ?? '') !== 'https') {
    http_response_code(400);
    exit(json_encode(['error' => 'Only HTTPS destinations are allowed.']));
}

try {
    $statement = $pdo->prepare(
        'INSERT INTO short_links (id, destination) VALUES (:id, :destination)'
    );
    $statement->execute([
        ':id' => strtolower($id),
        ':destination' => $destination,
    ]);

    echo json_encode(['id' => strtolower($id)]);
} catch (PDOException $error) {
    if (($error->errorInfo[1] ?? null) === 1062) {
        http_response_code(409);
        exit(json_encode(['error' => 'Link ID collision. Please try again.']));
    }

    http_response_code(500);
    exit(json_encode(['error' => 'Could not create link.']));
}
