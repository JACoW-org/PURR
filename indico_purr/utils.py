import json
from typing import Any


def json_decode(data: bytes) -> Any:
    return json.loads(data)


def json_encode(data: Any) -> bytes:
    return json.dumps(data)
