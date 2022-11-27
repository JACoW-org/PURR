import json

from datetime import date, datetime
from typing import Any
import orjson

from pytz import timezone

from indico.core.config import config


def default_timezone():
    try:
        if not config is None and not config.DEFAULT_TIMEZONE is None:
            return timezone(config.DEFAULT_TIMEZONE)
    except BaseException as e:
        print(e)
    return timezone('UTC')


def json_decode(data: bytes) -> Any:   
    return orjson.loads(data)

def json_encode(data: Any) -> bytes:    
    return orjson.dumps(data)



DEFAULT_TIMEZONE = default_timezone()
