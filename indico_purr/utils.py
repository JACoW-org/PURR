from typing import Any

import orjson


def json_decode(data: bytes) -> Any:
    return orjson.loads(data)


def json_encode(data: Any) -> bytes:
    return orjson.dumps(data)
