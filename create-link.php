<?php

require __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    exit(json_encode(['error' => 'Method not allowed.']));
}

$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body)) {
    http_response_code(400);
    exit(json_encode(['error' => 'Invalid request body.']));
}

$id = $body['id'] ?? '';
$destination = $body['destination'] ?? '';
$options = [
    'button_text' => ['buttonText', 40],
    'page_title' => ['pageTitle', 80],
];

if (!is_string($id) || !preg_match('/^[a-z0-9-]{1,36}$/i', $id)) {
    http_response_code(400);
    exit(json_encode(['error' => 'Link name must use only letters, numbers, and hyphens (up to 36 characters).']));
}

$linkOptions = [];
foreach ($options as $column => [$field, $maxLength]) {
    $value = $body[$field] ?? '';
    if (!is_string($value)) {
        http_response_code(400);
        exit(json_encode(['error' => 'Invalid link options.']));
    }
    $value = trim($value);
    if (strlen($value) > $maxLength) {
        http_response_code(400);
        exit(json_encode(['error' => 'A link option is too long.']));
    }
    $linkOptions[$column] = $value === '' ? null : $value;
}

$showHint = $body['showHint'] ?? false;
if (!is_bool($showHint)) {
    http_response_code(400);
    exit(json_encode(['error' => 'Invalid hint setting.']));
}

$keyMode = $body['keyMode'] ?? 'classic';
if (!is_string($keyMode) || !in_array($keyMode, ['classic', 'key-select'], true)) {
    http_response_code(400);
    exit(json_encode(['error' => 'Invalid key mode.']));
}

$detailMode = $body['detailMode'] ?? 'high-detail';
if (!is_string($detailMode) || !in_array($detailMode, ['high-detail', 'low-detail'], true)) {
    http_response_code(400);
    exit(json_encode(['error' => 'Invalid detail mode.']));
}

if (!is_string($destination) || strlen($destination) > 2048 || !filter_var($destination, FILTER_VALIDATE_URL)) {
    http_response_code(400);
    exit(json_encode(['error' => 'Invalid destination URL.']));
}

$url = parse_url($destination);
if (strtolower($url['scheme'] ?? '') !== 'https') {
    http_response_code(400);
    exit(json_encode(['error' => 'Only HTTPS destinations are allowed.']));
}

if (isset($url['user']) || isset($url['pass'])) {
    http_response_code(400);
    exit(json_encode(['error' => 'Destination URLs cannot contain a username or password.']));
}

$host = strtolower($url['host'] ?? '');
if ($host === '' || preg_match('/(^|\.)limbo\.gt\.tc$/', $host)) {
    http_response_code(400);
    exit(json_encode(['error' => 'That destination is not allowed.']));
}

try {
    $statement = $pdo->prepare(
        'INSERT INTO short_links
            (id, destination, button_text, page_title, show_hint, key_mode, detail_mode)
         VALUES
            (:id, :destination, :button_text, :page_title, :show_hint, :key_mode, :detail_mode)'
    );
    $statement->execute([
        ':id' => $id,
        ':destination' => $destination,
        ':button_text' => $linkOptions['button_text'],
        ':page_title' => $linkOptions['page_title'],
        ':show_hint' => $showHint ? 1 : 0,
        ':key_mode' => $keyMode,
        ':detail_mode' => $detailMode,
    ]);

    echo json_encode(['id' => $id]);
} catch (PDOException $error) {
    if (($error->errorInfo[1] ?? null) === 1062) {
        http_response_code(409);
        exit(json_encode(['error' => 'That link name already exists. Please choose another one.']));
    }

    http_response_code(500);
    exit(json_encode(['error' => 'Could not create link.']));
}
